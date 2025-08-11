"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Utensils, 
  Package, 
  BarChart3, 
  Settings,
  Home
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Orders", href: "/orders", icon: ShoppingCart },
  { name: "Menu", href: "/menu", icon: Utensils },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

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
        {navigation.map((item) => {
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
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
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