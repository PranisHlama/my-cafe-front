import { apiClient } from "@/lib/api";

export interface UserDTO {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  date_joined: string;
  role?: "customer" | "staff" | null;
}

export const UsersService = {
  async list(role?: "customer" | "staff"): Promise<UserDTO[]> {
    const query = role ? `?role=${encodeURIComponent(role)}` : "";
    const res = await apiClient.get<UserDTO[]>(`/api/users/${query}`);
    if (res.error) throw new Error(res.error);
    return res.data ?? [];
  },
};


