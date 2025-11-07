"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import ClientOnly from "../../components/ClientOnly";
import RoleSlots from "../../components/auth/RoleSlots";
import TokenDebugger from "../../components/debug/TokenDebugger";
import { AuthService } from "@/lib/services/authService";

export default function PlatformLayout({
  children,
  admin,
  cashier,
}: {
  children: React.ReactNode;
  admin?: React.ReactNode;
  cashier?: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authed = AuthService.isAuthenticated();
    if (!authed) {
      router.replace("/login");
    }
    setIsAuthenticated(authed);
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-gray-600">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <ClientOnly
        fallback={
          <div className="flex h-full w-64 flex-col bg-gray-900">
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gray-700 rounded" />
                <div className="h-6 w-32 bg-gray-700 rounded" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-gray-400">Loading...</div>
            </div>
          </div>
        }
      >
        <Sidebar />
      </ClientOnly>
      <main className="flex-1 overflow-auto">
        {children}
        <RoleSlots admin={admin} cashier={cashier} />
      </main>
      <ClientOnly>
        <TokenDebugger />
      </ClientOnly>
    </div>
  );
}
