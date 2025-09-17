// server/api/woo/[...path].ts
import { defineEventHandler, getQuery, readBody, setResponseHeader, createError } from 'h3';

export default defineEventHandler(async event => {
  const cfg = useRuntimeConfig(event);
  const method = event.method || 'GET';

  const raw = (event.context.params?.path ?? '') as string | string[];
  const subpath = Array.isArray(raw) ? raw.join('/') : raw;

  const base = String(cfg.wcUrl || '').replace(/\/+$/, '');

  // -> https://site.com/wp-json/wc/v3/{subpath}
  const url = `${base}/wp-json/wc/v3/${subpath}`;
  const query = getQuery(event);
  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) ? await readBody(event) : undefined;

  const auth = Buffer.from(`${cfg.wcKey}:${cfg.wcSecret}`, 'utf-8').toString('base64');

  try {
    const res = await $fetch.raw(url, {
      method,
      params: query,
      body,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    const total = res.headers.get('x-wp-total');
    const totalPages = res.headers.get('x-wp-totalpages');
    if (total) setResponseHeader(event, 'x-wp-total', total);
    if (totalPages) setResponseHeader(event, 'x-wp-totalpages', totalPages);

    return {
      data: res._data,
      meta: {
        total: total ? Number(total) : undefined,
        totalPages: totalPages ? Number(totalPages) : undefined,
      },
    };
  } catch (err: any) {
    const statusCode = err?.response?.status || err?.statusCode || 500;
    const statusMessage = err?.response?._data?.message || err?.message || 'Woo request failed';
    throw createError({ statusCode, statusMessage });
  }
});
