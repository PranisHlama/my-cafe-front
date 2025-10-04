import { apiClient } from "@/lib/api";

export interface CustomerDTO {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface UserDTO {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  date_joined: string;
  role?: "customer" | "staff" | null;
  permissions?: string[];
  sidebar?: Array<{name: string; href: string}>;
}

export interface CustomerSearchParams {
  q?: string;
  role?: "customer" | "staff";
}

export const CustomersService = {
  async list(): Promise<CustomerDTO[]> {
    const res = await apiClient.get<CustomerDTO[]>('/api/customers/');
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  async getById(id: number): Promise<CustomerDTO | null> {
    const res = await apiClient.get<CustomerDTO>(`/api/customers/${id}/`);
    if (res.error) throw new Error(res.error);
    return res.data ?? null;
  },

  async create(customer: Omit<CustomerDTO, 'id' | 'created_at'>): Promise<CustomerDTO> {
    const res = await apiClient.post<CustomerDTO>('/api/customers/', customer);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  async update(id: number, customer: Partial<CustomerDTO>): Promise<CustomerDTO> {
    const res = await apiClient.put<CustomerDTO>(`/api/customers/${id}/`, customer);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  async delete(id: number): Promise<void> {
    const res = await apiClient.delete(`/api/customers/${id}/`);
    if (res.error) throw new Error(res.error);
  }
};

export const UsersService = {
  async list(role?: "customer" | "staff"): Promise<UserDTO[]> {
    const query = role ? `?role=${encodeURIComponent(role)}` : "";
    const res = await apiClient.get<UserDTO[]>(`/api/users/${query}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },

  async getById(id: number): Promise<UserDTO | null> {
    const res = await apiClient.get<UserDTO>(`/api/users/${id}/`);
    if (res.error) throw new Error(res.error);
    return res.data ?? null;
  }
};


