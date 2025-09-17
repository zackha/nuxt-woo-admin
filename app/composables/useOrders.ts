// app/composables/useOrders.ts

export type Order = {
  id: number;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  billing?: { first_name?: string; last_name?: string; email?: string };
  line_items?: Array<{ id: number; name: string; quantity: number; total: string }>;
};

export const useOrders = () => {
  const { call } = useWoo();

  const list = async (params: { page?: number; per_page?: number; status?: string; search?: string }) => {
    return call<Order[]>(`/orders`, { method: 'GET', query: params });
  };

  const getById = async (id: string | number) => {
    return call<Order>(`/orders/${id}`, { method: 'GET' });
  };

  const getNotes = async (id: string | number) => {
    return call<any[]>(`/orders/${id}/notes`, { method: 'GET' });
  };

  const updateStatus = async (id: string | number, status: string) => {
    return call<Order>(`/orders/${id}`, { method: 'PUT', body: { status } });
  };

  const addNote = async (id: string | number, note: string) => {
    return call(`/orders/${id}/notes`, {
      method: 'POST',
      body: { note, customer_note: false },
    });
  };

  return { list, getById, getNotes, updateStatus, addNote };
};
