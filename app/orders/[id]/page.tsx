"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";
import { OrdersService, OrderDTO } from "@/lib/services/ordersService";
import { Badge } from "@/components/ui/badge";

const getStatusVariant = (status: string) => {
  switch (status) {
    case "pending":
      return "blue" as const;
    case "preparing":
      return "yellow" as const;
    case "ready":
      return "purple" as const;
    case "completed":
      return "green" as const;
    case "canceled":
      return "red" as const;
    default:
      return "gray" as const;
  }
};

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = Number(params?.id);

  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [order, setOrder] = useState<OrderDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    setUser(AuthService.getCurrentUser());
  }, []);

  const isAdminOrCashier =
    user &&
    AuthService.hasAnyRole([
      UserRole.OWNER,
      UserRole.MANAGER,
      UserRole.CASHIER,
    ]);

  useEffect(() => {
    const load = async () => {
      if (!orderId || !isAdminOrCashier) return;
      try {
        setLoading(true);
        const data = await OrdersService.retrieve(orderId);
        setOrder(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    if (isClient && isAdminOrCashier) load();
  }, [orderId, isClient, isAdminOrCashier]);

  const totals = useMemo(() => {
    if (!order) return { subtotal: 0, total: 0 };
    const subtotal = order.items.reduce(
      (sum, it) => sum + parseFloat(it.total_price),
      0
    );
    return { subtotal, total: parseFloat(order.total_amount) };
  }, [order]);

  if (!isClient) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading...</div>
        </div>
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
            You don't have permission to view this order.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading order...</div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || "Order not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.order_number}
          </h1>
          <p className="text-gray-600 mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
            {order.completed_at
              ? ` · Completed ${new Date(order.completed_at).toLocaleString()}`
              : ""}
          </p>
        </div>
        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200">
          <div className="border-b px-4 py-3 font-semibold text-gray-900">
            Items
          </div>
          <div className="divide-y">
            {order.items.map((it, idx) => (
              <div
                key={`${it.menu_item}-${idx}`}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <div className="text-gray-900 font-medium">
                    {it.menu_item_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Qty: {it.quantity}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    ₹{parseFloat(it.price).toFixed(2)} each
                  </div>
                  <div className="text-gray-900 font-semibold">
                    ₹{parseFloat(it.total_price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 h-fit">
          <div className="border-b px-4 py-3 font-semibold text-gray-900">
            Summary
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Subtotal</span>
              <span>₹{totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Total</span>
              <span className="font-semibold text-gray-900">
                ₹
                {(order.total_amount
                  ? parseFloat(order.total_amount)
                  : totals.total
                ).toFixed(2)}
              </span>
            </div>
          </div>
          <div className="px-4 pb-4">
            <button
              className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              onClick={() => router.push("/orders")}
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="border-b px-4 py-3 font-semibold text-gray-900">
          Customer
        </div>
        <div className="px-4 py-3 text-sm text-gray-700">
          <div>Customer: {order.customer_name || "-"}</div>
          <div>Contact: {order.contact || "-"}</div>
          {order.table_number && <div>Table: {order.table_number}</div>}
        </div>
      </div>
    </div>
  );
}
