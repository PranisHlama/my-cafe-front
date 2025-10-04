"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";
import { DataTable, Column } from "@/components/ui/DataTable";
import { UsersService, UserDTO } from "@/lib/services/customersService";

interface ViewCustomer {
  name: string;
  email: string;
  since: string;
}

export default function CustomersPage() {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [rows, setRows] = useState<ViewCustomer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- Auth & Role Setup ---
  useEffect(() => {
    setIsClient(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const isAdmin =
    user && AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]);
  const isCashier = user && AuthService.hasRole(UserRole.CASHIER);

  // --- Fetch Customers ---
  const formatDate = (isoDate: string): string => {
    const d = new Date(isoDate);
    return d.toLocaleDateString();
  };

  const mapCustomers = (data: UserDTO[]): ViewCustomer[] =>
    data.map((u) => ({
      name:
        u.first_name || u.last_name
          ? `${u.first_name} ${u.last_name}`.trim()
          : u.username,
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
    if (isAdmin || isCashier) load();
  }, [isAdmin, isCashier]);

  const columns: Column<ViewCustomer>[] = [
    { key: "name", header: "Name" },
    { key: "email", header: "Email" },
    { key: "since", header: "Since" },
  ];

  // --- UI States ---
  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin && !isCashier) {
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

  if (loading) return <div className="p-6">Loading customers...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // --- Main Page ---
  return (
    <div className="p-6">
    
      <DataTable
        data={rows}
        columns={columns}
        title="Customers"
        description="Manage your customers and their contact info"
        searchPlaceholder="Search customers..."
        showNewButton={false}
        itemsPerPage={10}
      />
    </div>
  );
}
