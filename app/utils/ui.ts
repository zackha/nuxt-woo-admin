export const orderBadge = (s: string) =>
  (['completed', 'processing'].includes(s) && 'badge badge--ok') ||
  (['on-hold', 'pending'].includes(s) && 'badge badge--warn') ||
  (['cancelled', 'refunded', 'failed', 'trash'].includes(s) && 'badge badge--err') ||
  'badge';

export const productBadge = (s: string) => (s === 'publish' && 'badge badge--ok') || (['draft', 'pending'].includes(s) && 'badge badge--warn') || 'badge';

export const priceText = (p: any) => (p?.sale_price && p.sale_price !== '0' ? `${p.sale_price} (sale)` : `$${p?.price}` || `$${p?.regular_price}` || '—');

export const stockText = (p: any) =>
  p?.stock_status === 'instock'
    ? p?.manage_stock && p?.stock_quantity != null
      ? `in stock · ${p.stock_quantity}`
      : 'in stock'
    : p?.stock_status === 'onbackorder'
    ? 'on backorder'
    : 'out of stock';
