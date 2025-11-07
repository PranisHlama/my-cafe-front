"use client";

import CategoryManager from "@/components/menu/CategoryManager";
import { AdminGuard } from "@/components/auth/PermissionGuard";

export default function AdminCategoriesPage() {
  return (
    <AdminGuard
      fallback={
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only admins/managers can manage categories.</p>
        </div>
      }
    >
      <CategoryManager />
    </AdminGuard>
  );
}


