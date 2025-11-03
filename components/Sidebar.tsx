"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Utensils,
  Package,
  BarChart3,
  Settings,
  Home,
  Users,
  Activity,
  Shield,
  Circle,
} from "lucide-react";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";

// Resolve icon component by display name
const resolveIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("dashboard")) return LayoutDashboard;
  if (n.includes("order")) return ShoppingCart;
  if (n.includes("customer")) return Users;
  if (n.includes("menu")) return Utensils;
  if (n.includes("invent")) return Package;
  if (n.includes("report")) return BarChart3;
  if (n.includes("setting")) return Settings;
  if (n.includes("audit")) return Activity;
  if (n.includes("session")) return Shield;
  if (n.includes("home")) return Home;
  return Circle;
};

const defaultNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Menu", href: "/menu", icon: Utensils },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

// Cashier-focused navigation
const cashierNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "POS", href: "/pos", icon: ShoppingCart },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Menu", href: "/menu", icon: Utensils },
];

const adminNavigation = [
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: Activity },
];

const authNavigation = [
  { name: "Sessions", href: "/auth/sessions", icon: Shield },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  // Determine role and sidebar data from backend
  const userRole = (user?.role as unknown as string) || "";
  const backendSidebar: Array<{ name: string; href: string }> | null =
    Array.isArray((user as any)?.sidebar) ? (user as any).sidebar : null;

  const isAdmin =
    isClient &&
    (AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]) ||
      userRole === "admin");
  const isCashier =
    isClient &&
    (AuthService.hasRole(UserRole.CASHIER) || userRole === "cashier");

  // Show loading state during hydration
  if (!isClient || isLoading) {
    return (
      <div className="flex h-full w-64 flex-col bg-gray-900">
        <div className="flex h-16 items-center justify-center border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-white" />
            <span className="text-xl font-bold text-white">Cafe Manager</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading...</div>
        </div>
      </div>
    );
  }

  // Choose main navigation
  const mainNavigation = backendSidebar
    ? backendSidebar.map((item) => ({ ...item, icon: resolveIcon(item.name) }))
    : isAdmin
    ? defaultNavigation
    : isCashier
    ? cashierNavigation
    : defaultNavigation;

  // If using backend-provided sidebar, we won't render separate Admin/Security sections
  const renderExtraSections = !backendSidebar && isAdmin;

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-800">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white">Cafe Manager</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {mainNavigation.map((item) => {
          const Icon = (item as any).icon || Circle;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 group-hover:text-white"
                }`}
              />
              {item.name}
            </Link>
          );
        })}

        {/* Admin Navigation */}
        {renderExtraSections && (
          <div className="pt-4 mt-4 border-t border-gray-700">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Administration
            </h3>
            {adminNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Auth Navigation */}
        {renderExtraSections && (
          <div className="pt-4 mt-4 border-t border-gray-700">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Security
            </h3>
            {authNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? "text-white"
                        : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
            <span className="text-sm font-medium text-white">U</span>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">User</p>
            <p className="text-xs text-gray-400">user@cafe.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
