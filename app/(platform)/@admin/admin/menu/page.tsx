"use client";

import MenuManager from "@/components/menu/MenuManager";
import { AdminGuard } from "@/components/auth/PermissionGuard";

export default function AdminMenuPage() {
  return (
    <AdminGuard
      fallback={
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Only admins/managers can manage the menu.</p>
        </div>
      }
    >
      <MenuManager />
    </AdminGuard>
  );
}


