"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";
import {
  OrdersService,
  OrderDTO,
  OrderStatus,
} from "@/lib/services/ordersService";
import { DataTable, Column } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/badge";

// Helper to map backend status to display variant
const getStatusVariant = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "blue";
    case "preparing":
      return "yellow";
    case "ready":
      return "purple";
    case "completed":
      return "green";
    case "canceled":
      return "red";
    default:
      return "gray";
  }
};

interface OrderView
  extends Omit<OrderDTO, "total_amount" | "created_at" | "completed_at"> {
  total: string;
  date: string;
  completionDate: string;
  statusBadge: React.ReactNode;
}

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [orders, setOrders] = useState<OrderView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const isAdminOrCashier =
    user &&
    AuthService.hasAnyRole([
      UserRole.OWNER,
      UserRole.MANAGER,
      UserRole.CASHIER,
    ]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await OrdersService.list();
      setOrders(mapOrdersToView(data));
    } catch (err: any) {
      setError(err?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isClient && isAdminOrCashier) {
      loadOrders();
    }
  }, [isClient, isAdminOrCashier]);

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      await OrdersService.setStatus(orderId, newStatus);
      // Reload orders to reflect the change
      await loadOrders();
    } catch (err: any) {
      alert(err?.message || "Failed to update order status");
    }
  };

  const mapOrdersToView = (data: OrderDTO[]): OrderView[] => {
    return data.map((order) => ({
      ...order,
      total: `₹${parseFloat(order.total_amount).toFixed(2)}`,
      date: new Date(order.created_at).toLocaleDateString(),
      completionDate: order.completed_at
        ? new Date(order.completed_at).toLocaleDateString()
        : "-",
      statusBadge: (
        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
      ),
    }));
  };

  const columns: Column<OrderView>[] = [
    { key: "order_number", header: "Order #" },
    { key: "customer_name", header: "Customer" },
    { key: "total", header: "Total" },
    { key: "statusBadge", header: "Status", enableSorting: false },
    { key: "date", header: "Order Date" },
    { key: "completionDate", header: "Completion Date" },
    {
      key: "actions",
      header: "Actions",
      enableSorting: false,
      render: (_: any, order: any) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {order.status === "pending" && (
            <>
              <button
                onClick={() => handleUpdateStatus(order.id, "preparing")}
                className="px-3 py-1 text-xs rounded bg-yellow-500 text-white hover:bg-yellow-600"
              >
                Start Preparing
              </button>
              <button
                onClick={() => handleUpdateStatus(order.id, "completed")}
                className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
              >
                Complete
              </button>
            </>
          )}
          {order.status === "preparing" && (
            <>
              <button
                onClick={() => handleUpdateStatus(order.id, "ready")}
                className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-purple-700"
              >
                Mark Ready
              </button>
              <button
                onClick={() => handleUpdateStatus(order.id, "completed")}
                className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
              >
                Complete
              </button>
            </>
          )}
          {order.status === "ready" && (
            <button
              onClick={() => handleUpdateStatus(order.id, "completed")}
              className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700"
            >
              Complete
            </button>
          )}
          {(order.status === "pending" || order.status === "preparing") && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to cancel this order?")) {
                  handleUpdateStatus(order.id, "canceled");
                }
              }}
              className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
            >
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdminOrCashier) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading orders...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        data={orders}
        columns={columns}
        title="Orders List"
        description="View and manage all customer orders"
        searchPlaceholder="Search orders..."
        showNewButton={false} // Orders are created through the order wizard
        itemsPerPage={10}
        onRowClick={(item) => router.push(`/orders/${(item as any).id}`)}
      />
    </div>
  );
}
