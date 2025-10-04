"use client";

import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";

export default function RoleSlots({
  admin,
  cashier,
  customer,
}: {
  admin?: React.ReactNode;
  cashier?: React.ReactNode;
  customer?: React.ReactNode;
}) {
  const user =
    typeof window !== "undefined" ? AuthService.getCurrentUser() : null;
  const userRole = user?.role;

  // Check if user is authenticated first
  if (!user || !AuthService.isAuthenticated()) {
    return null;
  }

  // Check roles using the proper enum values
  const isAdmin = AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]);
  const isCashier = AuthService.hasRole(UserRole.CASHIER);
  const isCustomer = AuthService.hasRole(UserRole.CUSTOMER);

  return (
    <>
      {isAdmin ? admin : null}
      {isCashier ? cashier : null}
      {isCustomer ? customer : null}
    </>
  );
}
