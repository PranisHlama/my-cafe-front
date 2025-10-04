import { apiClient } from "@/lib/api";

export type OrderStatus = "pending" | "preparing" | "ready" | "completed" | "canceled";

export interface OrderItemInput {
  menu_item: number;
  quantity: number;
  price?: string; // optional snapshot price
}

export interface OrderDTO {
  id: number;
  order_number: string;
  customer?: number | null;
  cashier?: number | null;
  status: OrderStatus;
  created_at: string;
  completed_at?: string | null;
  table_number?: string | null;
  customer_name?: string | null;
  contact?: string | null;
  items: Array<{
    menu_item: number;
    menu_item_name: string;
    quantity: number;
    price: string;
    total_price: string;
  }>;
  total_amount: string;
}

export interface CreateOrderInput {
  order_number: string;
  customer?: number | null;
}

export type UpdateOrderInput = Partial<{ status: OrderStatus; customer: number | null; cashier: number | null }>;

export const OrdersService = {
  async list(params?: { customer_id?: number | string }): Promise<OrderDTO[]> {
    const query = params?.customer_id ? `?customer_id=${encodeURIComponent(String(params.customer_id))}` : "";
    const res = await apiClient.get<OrderDTO[]>(`/api/orders/${query}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  async retrieve(id: number): Promise<OrderDTO> {
    const res = await apiClient.get<OrderDTO>(`/api/orders/${id}/`);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error("Order not found");
    return res.data;
  },

  async create(payload: CreateOrderInput): Promise<OrderDTO | null> {
    const res = await apiClient.post<OrderDTO>("/api/orders/", payload);
    if (res.error) throw new Error(res.error);
    return res.data ?? null;
  },

  async update(id: number, payload: UpdateOrderInput): Promise<OrderDTO | null> {
    const res = await apiClient.put<OrderDTO>(`/api/orders/${id}/`, payload);
    if (res.error) throw new Error(res.error);
    return res.data ?? null;
  },

  async remove(id: number): Promise<boolean> {
    const res = await apiClient.delete(`/api/orders/${id}/`);
    if (res.error) throw new Error(res.error);
    return true;
  },

  async addItem(id: number, item: OrderItemInput): Promise<OrderDTO> {
    const res = await apiClient.post<OrderDTO>(`/api/orders/${id}/add_item/`, item);
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error("Failed to add item");
    return res.data;
  },

  async setStatus(id: number, status: OrderStatus): Promise<OrderDTO> {
    const res = await apiClient.post<OrderDTO>(`/api/orders/${id}/set_status/`, { status });
    if (res.error) throw new Error(res.error);
    if (!res.data) throw new Error("Failed to set status");
    return res.data;
  },
};
