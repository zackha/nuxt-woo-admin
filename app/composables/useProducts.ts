// app/composables/useProducts.ts
export type Product = {
  id: number;
  name: string;
  status: string; // publish | draft | pending | private
  price: string;
  regular_price: string;
  sale_price: string;
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  stock_quantity: number | null;
  manage_stock: boolean;
  date_created: string;
  image: { id: number; src: string; alt: string } | null;
};

export type ProductDetail = Product & {
  images: Array<{ id: number; src: string; alt: string }>;
  description: string; // HTML’siz sade metin (server'da strip edildi)
};

export const useProducts = () => {
  const { call } = useWoo();

  const list = async (params: { page?: number; per_page?: number; status?: string; search?: string }) => {
    return call<Product[]>(`/products`, { method: 'GET', query: params });
  };

  const getById = async (id: string | number) => {
    return call<ProductDetail>(`/products/${id}`, { method: 'GET' });
  };

  return { list, getById };
};
