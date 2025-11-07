import { apiClient } from "../api";

export interface AdminDashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  lowStockItems: number;
  pendingOrders: number;
  completedOrders: number;
}

export class AdminService {
  static async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get<AdminDashboardStats>("/api/admin/dashboard/");

    if (response.error) {
      throw new Error(response.error);
    }

    if (!response.data) {
      throw new Error("No dashboard data returned");
    }

    return response.data;
  }
}

