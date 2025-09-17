// server/api/woo/[...path].ts
import { defineEventHandler, getQuery, readBody, setResponseHeader, createError } from 'h3';

// ---- ENUMS / Allowlist ----
const ORDER_STATUSES = new Set(['pending', 'processing', 'completed', 'on-hold', 'cancelled', 'refunded', 'failed', 'trash']);
const PRODUCT_STATUSES = new Set(['publish', 'draft', 'pending', 'private']);

type CleanQuery = { page?: number; per_page?: number; status?: string; search?: string };

function clampInt(n: any, min: number, max: number) {
  const v = Number.parseInt(String(n), 10);
  if (Number.isNaN(v)) return undefined;
  return Math.min(Math.max(v, min), max);
}
function isNumericId(s: string) {
  return /^[0-9]+$/.test(s);
}

function pickListQuery(q: Record<string, any>, allowedStatuses?: Set<string>): CleanQuery {
  const out: CleanQuery = {};
  const page = clampInt(q.page, 1, 100000);
  const perPage = clampInt(q.per_page, 1, 100);
  const status = q.status ? String(q.status) : undefined;
  const search = q.search ? String(q.search) : undefined;
  if (page) out.page = page;
  if (perPage) out.per_page = perPage;
  if (status) {
    if (!allowedStatuses || !allowedStatuses.has(status)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid status' });
    }
    out.status = status;
  }
  if (search) {
    if (search.length > 60) throw createError({ statusCode: 400, statusMessage: 'Search too long' });
    out.search = search;
  }
  return out;
}

// ---- Projection (yalnızca UI’nın kullandığı alanlar) ----
function shapeOrderListItem(o: any) {
  return {
    id: o.id,
    status: o.status,
    total: o.total,
    currency: o.currency,
    date_created: o.date_created,
    billing: {
      first_name: o?.billing?.first_name ?? undefined,
      last_name: o?.billing?.last_name ?? undefined,
      email: o?.billing?.email ?? undefined,
    },
  };
}
function shapeOrderDetail(o: any) {
  return {
    ...shapeOrderListItem(o),
    line_items: Array.isArray(o?.line_items)
      ? o.line_items.map((li: any) => ({
          id: li.id,
          name: li.name,
          quantity: li.quantity,
          total: li.total,
        }))
      : [],
  };
}
function shapeNote(n: any) {
  return { id: n.id, note: n.note, date_created: n.date_created };
}

function firstImage(p: any) {
  const img = Array.isArray(p?.images) && p.images[0] ? p.images[0] : null;
  return img ? { id: img.id, src: img.src, alt: img.alt || img.name || '' } : null;
}
function stripHtml(s: string) {
  return String(s || '')
    .replace(/<[^>]*>/g, '')
    .trim();
}
function shapeProductListItem(p: any) {
  return {
    id: p.id,
    name: p.name,
    status: p.status,
    price: p.price, // string
    regular_price: p.regular_price, // string
    sale_price: p.sale_price, // string
    stock_status: p.stock_status, // 'instock' | 'outofstock' | 'onbackorder'
    stock_quantity: p.stock_quantity ?? null,
    manage_stock: !!p.manage_stock,
    date_created: p.date_created,
    image: firstImage(p),
  };
}
function shapeProductDetail(p: any) {
  return {
    ...shapeProductListItem(p),
    images: Array.isArray(p?.images) ? p.images.map((img: any) => ({ id: img.id, src: img.src, alt: img.alt || img.name || '' })) : [],
    description: stripHtml(p.description || ''),
  };
}

export default defineEventHandler(async event => {
  const cfg = useRuntimeConfig(event);
  const method = (event.method || 'GET').toUpperCase();

  const raw = (event.context.params?.path ?? '') as string | string[];
  const subpath = Array.isArray(raw) ? raw.join('/') : raw;
  const clean = String(subpath || '').replace(/^\/+/, ''); // "orders", "orders/123", "products", "products/123", ...

  // ---- wcUrl doğrulama ----
  const base = String(cfg.wcUrl || '').replace(/\/+$/, '');
  if (!base) throw createError({ statusCode: 500, statusMessage: 'Woo base URL not configured' });
  let baseUrl: URL;
  try {
    baseUrl = new URL(base);
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Invalid wcUrl' });
  }
  if (baseUrl.protocol !== 'https:') throw createError({ statusCode: 500, statusMessage: 'wcUrl must use HTTPS' });

  const queryRaw = getQuery(event);
  let root = `${base}/wp-json/wc/v3`;
  const seg = clean.split('/');

  // ===== ORDERS =====
  if (seg[0] === 'orders') {
    // /orders
    if (seg.length === 1) {
      if (method !== 'GET') throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
      const q = pickListQuery(queryRaw as Record<string, any>, ORDER_STATUSES);
      const res = await $fetch.raw(`${root}/orders`, {
        method: 'GET',
        params: q,
        headers: { Authorization: `Basic ${Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64')}` },
        timeout: 10000,
      });
      const total = res.headers.get('x-wp-total');
      const totalPages = res.headers.get('x-wp-totalpages');
      if (total) setResponseHeader(event, 'x-wp-total', total);
      if (totalPages) setResponseHeader(event, 'x-wp-totalpages', totalPages);
      const data = Array.isArray(res._data) ? res._data.map(shapeOrderListItem) : [];
      return { data, meta: { total: total ? Number(total) : undefined, totalPages: totalPages ? Number(totalPages) : undefined } };
    }

    // /orders/:id
    if (seg.length === 2 && isNumericId(seg[1])) {
      const id = seg[1];
      if (method === 'GET') {
        const res = await $fetch.raw(`${root}/orders/${id}`, {
          method: 'GET',
          headers: { Authorization: `Basic ${Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64')}` },
          timeout: 10000,
        });
        return { data: shapeOrderDetail(res._data) };
      }
      if (method === 'PUT') {
        const body = await readBody(event);
        const status = body?.status ? String(body.status) : undefined;
        if (!status || !ORDER_STATUSES.has(status)) throw createError({ statusCode: 400, statusMessage: 'Invalid status' });
        const res = await $fetch.raw(`${root}/orders/${id}`, {
          method: 'PUT',
          body: { status },
          headers: {
            Authorization: `Basic ${Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 10000,
        });
        return { data: shapeOrderDetail(res._data) };
      }
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    // /orders/:id/notes
    if (seg.length === 3 && isNumericId(seg[1]) && seg[2] === 'notes') {
      const id = seg[1];
      if (method === 'GET') {
        const res = await $fetch.raw(`${root}/orders/${id}/notes`, {
          method: 'GET',
          headers: { Authorization: `Basic ${Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64')}` },
          timeout: 10000,
        });
        const data = Array.isArray(res._data) ? res._data.map(shapeNote) : [];
        return { data };
      }
      if (method === 'POST') {
        const body = await readBody(event);
        const note = body?.note ? String(body.note) : '';
        const customer_note = Boolean(body?.customer_note ?? false);
        if (!note.trim()) throw createError({ statusCode: 400, statusMessage: 'Note is required' });
        if (note.length > 5000) throw createError({ statusCode: 400, statusMessage: 'Note too long' });
        const res = await $fetch.raw(`${root}/orders/${id}/notes`, {
          method: 'POST',
          body: { note, customer_note },
          headers: {
            Authorization: `Basic ${Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64')}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          timeout: 10000,
        });
        return { data: shapeNote(res._data) };
      }
      throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
    }

    throw createError({ statusCode: 404, statusMessage: 'Not allowed path' });
  }

  // ===== PRODUCTS (READ-ONLY, güvenli) =====
  if (seg[0] === 'products') {
    // /products
    if (seg.length === 1) {
      if (method !== 'GET') throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
      const q = pickListQuery(queryRaw as Record<string, any>, PRODUCT_STATUSES);
      const res = await $fetch.raw(`${root}/products`, {
        method: 'GET',
        params: q,
        headers: { Authorization: `Basic ${Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64')}` },
        timeout: 10000,
      });
      const total = res.headers.get('x-wp-total');
      const totalPages = res.headers.get('x-wp-totalpages');
      if (total) setResponseHeader(event, 'x-wp-total', total);
      if (totalPages) setResponseHeader(event, 'x-wp-totalpages', totalPages);
      const data = Array.isArray(res._data) ? res._data.map(shapeProductListItem) : [];
      return { data, meta: { total: total ? Number(total) : undefined, totalPages: totalPages ? Number(totalPages) : undefined } };
    }

    // /products/:id
    if (seg.length === 2 && isNumericId(seg[1])) {
      const id = seg[1];
      if (method !== 'GET') throw createError({ statusCode: 405, statusMessage: 'Method not allowed' });
      const res = await $fetch.raw(`${root}/products/${id}`, {
        method: 'GET',
        headers: { Authorization: `Basic ${Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64')}` },
        timeout: 10000,
      });
      return { data: shapeProductDetail(res._data) };
    }

    throw createError({ statusCode: 404, statusMessage: 'Not allowed path' });
  }

  // Diğer her şey: kapalı
  throw createError({ statusCode: 404, statusMessage: 'Not allowed path' });
});
