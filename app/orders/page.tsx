"use client";

import {
  DataTable,
  createStatusColumn,
  createPriorityColumn,
  createActionsColumn,
  Column,
} from "@/components/ui/DataTable";

interface Order {
  id: string;
  customer: string;
  items: string;
  total: string;
  status: string;
  time: string;
  priority: string;
}

export default function OrdersPage() {
  const orders: Order[] = [
    {
      id: "#1234",
      customer: "John Doe",
      items: "Cappuccino, Croissant",
      total: "$24.50",
      status: "Preparing",
      time: "2 min ago",
      priority: "High",
    },
    {
      id: "#1233",
      customer: "Jane Smith",
      items: "Latte, Blueberry Muffin",
      total: "$18.75",
      status: "Ready",
      time: "5 min ago",
      priority: "Normal",
    },
    {
      id: "#1232",
      customer: "Mike Johnson",
      items: "Espresso, Sandwich, Cookie",
      total: "$32.00",
      status: "Completed",
      time: "8 min ago",
      priority: "Normal",
    },
    {
      id: "#1231",
      customer: "Sarah Wilson",
      items: "Tea, Scone",
      total: "$12.25",
      status: "Pending",
      time: "12 min ago",
      priority: "Low",
    },
  ];

  const statusColors = {
    Ready: "bg-green-100 text-green-800",
    Preparing: "bg-yellow-100 text-yellow-800",
    Pending: "bg-gray-100 text-gray-800",
    Completed: "bg-blue-100 text-blue-800",
    default: "bg-gray-100 text-gray-800",
  };

  const columns: Column<Order>[] = [
    {
      key: "id",
      header: "Order ID",
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    { key: "customer", header: "Customer" },
    { key: "items", header: "Items" },
    {
      key: "total",
      header: "Total",
      render: (value) => (
        <span className="text-sm font-medium text-gray-900">{value}</span>
      ),
    },
    createStatusColumn("status", "Status", statusColors),
    createPriorityColumn("priority", "Priority"),
    {
      key: "time",
      header: "Time",
      render: (value) => <span className="text-sm text-gray-500">{value}</span>,
    },
    createActionsColumn("Actions"),
  ];

  const handleNewOrder = () => {
    console.log("New order clicked");
    // Add your new order logic here
  };

  const handleRowClick = (order: Order) => {
    console.log("Order clicked:", order);
    // Add your order detail logic here
  };

  const handleActionClick = (order: Order) => {
    console.log("Action clicked for order:", order);
    // Add your action menu logic here
  };

  return (
    <DataTable
      data={orders}
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
  );
}
