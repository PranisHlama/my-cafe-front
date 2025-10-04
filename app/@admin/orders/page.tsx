"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { OrdersService, OrderDTO } from "@/lib/services/ordersService";
import OrderWizard from "@/components/orders/OrderWizard";

interface ViewOrder {
  id: string;
  customer: string;
  contact: string;
  items: string;
  total: string;
  time: string;
  table?: string;
}

export default function OrdersPage() {
  const [rows, setRows] = useState<ViewOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);

  const formatTimeAgo = (isoDate: string): string => {
    const then = new Date(isoDate).getTime();
    const now = Date.now();
    const diffSeconds = Math.max(0, Math.floor((now - then) / 1000));
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const mapOrders = (data: OrderDTO[]): ViewOrder[] =>
    data.map((o) => ({
      id: `#${o.order_number}`,
      customer: o.customer_name || "Guest",
      contact: o.contact || "-",
      items: (o.items || [])
        .map((it) => `${it.quantity}x ${it.menu_item_name}`)
        .join(", "),
      total: `$${parseFloat(o.total_amount || "0").toFixed(2)}`,
      time: formatTimeAgo(o.created_at),
      table: o.table_number || undefined,
    }));

  const load = async () => {
    try {
      setLoading(true);
      const data = await OrdersService.list();
      setRows(mapOrders(data));
    } catch (e: any) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: Column<ViewOrder>[] = [
    {
      key: "id",
      header: "Order #",
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    { key: "customer", header: "Customer" },
    { key: "contact", header: "Contact" },
    { key: "items", header: "Items" },
    {
      key: "total",
      header: "Total",
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    {
      key: "time",
      header: "Time",
      render: (value) => <span className="text-sm text-gray-500">{value}</span>,
    },
    { key: "table", header: "Table" },
  ];

  const handleNewOrder = () => setWizardOpen(true);
  const handleRowClick = (order: ViewOrder) =>
    console.log("Order clicked:", order);
  const handleActionClick = (order: ViewOrder) =>
    console.log("Action clicked for order:", order);

  if (loading) return <div className="p-6">Loading orders...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <>
      <DataTable
        data={rows}
        columns={columns}
        title="Orders"
        description="Manage and track all cafe orders"
        searchPlaceholder="Search orders..."
        newButtonText="New Order"
        onNewClick={handleNewOrder}
        onRowClick={handleRowClick}
        onActionClick={handleActionClick}
        itemsPerPage={10}
      />

      <OrderWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onCreated={() => load()}
      />
    </>
  );
}
