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
  const userRole = (user?.role as unknown as string) || "";

  const isAdmin =
    userRole === "admin" ||
    AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]);
  const isCashier =
    userRole === "cashier" || AuthService.hasRole(UserRole.CASHIER);
  const isCustomer =
    userRole === "customer" || AuthService.hasRole(UserRole.CUSTOMER);

  return (
    <>
      {isAdmin ? admin : null}
      {isCashier ? cashier : null}
      {isCustomer ? customer : null}
    </>
  );
}
