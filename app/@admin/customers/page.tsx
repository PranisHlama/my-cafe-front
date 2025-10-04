"use client";

import { useEffect, useState } from "react";
import { DataTable, Column } from "@/components/ui/DataTable";
import { UsersService, UserDTO } from "@/lib/services/customersService";

interface ViewCustomer {
  name: string;
  email: string;
  since: string;
}

export default function CustomersPage() {
  const [rows, setRows] = useState<ViewCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (isoDate: string): string => {
    const d = new Date(isoDate);
    return d.toLocaleDateString();
  };

  const mapCustomers = (data: UserDTO[]): ViewCustomer[] =>
    data.map((u) => ({
      name: u.first_name || u.last_name ? `${u.first_name} ${u.last_name}`.trim() : u.username,
      email: u.email || "-",
      since: formatDate(u.date_joined),
    }));

  const load = async () => {
    try {
      setLoading(true);
      const data = await UsersService.list("customer");
      setRows(mapCustomers(data));
    } catch (e: any) {
      setError(e?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const columns: Column<ViewCustomer>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "since", header: "Since" },
  ];

  if (loading) return <div className="p-6">Loading customers...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <DataTable
      data={rows}
      columns={columns}
      title="Customers"
      description="Manage your customers and their contact info"
      searchPlaceholder="Search customers..."
      showNewButton={false}
      itemsPerPage={10}
    />
  );
}


