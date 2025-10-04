"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthService.isAuthenticated()) {
        router.push("/login");
        return;
      }
      setIsLoading(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const user = AuthService.getCurrentUser();
  const userRole = (user?.role as unknown as string) || "";

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">System Settings</h2>
          <p className="text-gray-600">Role: {userRole}</p>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">User Profile</h3>
            <p className="text-gray-600">Manage your account settings</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Preferences</h3>
            <p className="text-gray-600">Customize your experience</p>
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold">Security</h3>
            <p className="text-gray-600">Password and security settings</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-gray-600">
            Settings functionality will be implemented here.
          </p>
        </div>
      </div>
    </div>
  );
}
