"use client";

import { useState, useEffect, useMemo } from "react";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";
import { MenuService, Category, MenuItem } from "@/lib/services/menuService";
import { DataTable, Column } from "@/components/ui/DataTable";
import MenuManager from "@/components/menu/MenuManager";

export default function MenuPage() {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Load menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const [categoriesData, menuItemsData] = await Promise.all([
          MenuService.getCategories(),
          MenuService.getMenuItems(),
        ]);
        setCategories(categoriesData);
        setMenuItems(menuItemsData);
      } catch (err: any) {
        setError(err?.message || "Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      loadMenuData();
    }
  }, [isClient]);

  // Hooks must be declared before any conditional returns
  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const columns: Column<MenuItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (v) => <span className="font-medium">{v}</span>,
      },
      {
        key: "category",
        header: "Category",
        render: (value: number) => categoryNameById.get(value) ?? value,
      },
      {
        key: "base_price",
        header: "Price",
        render: (v) => `₹${parseFloat(v).toFixed(2)}`,
      },
      {
        key: "is_available",
        header: "Available",
        render: (v: boolean) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              v ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {v ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "is_featured",
        header: "Featured",
        render: (v: boolean) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              v ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {v ? "Yes" : "No"}
          </span>
        ),
      },
    ],
    [categoryNameById]
  );

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Check if user has admin/owner or cashier role
  const isAdmin =
    user && AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]);
  const isCashier = user && AuthService.hasRole(UserRole.CASHIER);

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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading menu...</div>
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

  // Admins get full CRUD UI
  if (isAdmin) {
    return (
      <div className="p-6">
        <MenuManager />
      </div>
    );
  }

  return (
    <div className="p-6">
      <DataTable
        data={menuItems}
        columns={columns}
        title="Menu Items"
        description="View all menu items in a single table"
        searchPlaceholder="Search menu items..."
        itemsPerPage={20}
        showNewButton={false}
      />
    </div>
  );
}
