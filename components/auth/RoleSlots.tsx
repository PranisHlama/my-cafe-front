"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";

export default function RoleSlots({
  admin,
  cashier,
}: {
  admin?: React.ReactNode;
  cashier?: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Don't render anything during SSR
  if (!isClient) {
    return null;
  }

  // Check if user is authenticated first
  if (!user || !AuthService.isAuthenticated()) {
    return null;
  }

  // Check roles using the proper enum values
  const isAdmin = AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]);
  const isCashier = AuthService.hasRole(UserRole.CASHIER);

  return (
    <>
      {isAdmin ? admin : null}
      {isCashier ? cashier : null}
    </>
  );
}
