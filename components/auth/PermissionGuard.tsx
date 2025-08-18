"use client";

import { ReactNode } from "react";
import { AuthService } from "../../lib/services/authService";
import { Permission, UserRole } from "../../lib/types/auth";

interface PermissionGuardProps {
  children: ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  requireAllPermissions?: boolean;
  requireAllRoles?: boolean;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export default function PermissionGuard({
  children,
  permissions = [],
  roles = [],
  requireAllPermissions = false,
  requireAllRoles = false,
  fallback = null,
  showFallback = false,
}: PermissionGuardProps) {
  // Check if user is authenticated
  if (!AuthService.isAuthenticated()) {
    return showFallback ? fallback : null;
  }

  // Check permissions if specified
  if (permissions.length > 0) {
    const hasPermission = requireAllPermissions
      ? AuthService.hasAllPermissions(permissions)
      : AuthService.hasAnyPermission(permissions);

    if (!hasPermission) {
      return showFallback ? fallback : null;
    }
  }

  // Check roles if specified
  if (roles.length > 0) {
    const hasRole = requireAllRoles
      ? roles.every((role) => AuthService.hasRole(role))
      : AuthService.hasAnyRole(roles);

    if (!hasRole) {
      return showFallback ? fallback : null;
    }
    console.log("Authenticated:", AuthService.isAuthenticated());
    console.log("Has dashboard permission:", AuthService.hasAnyPermission([Permission.VIEW_DASHBOARD]));

  }

  // If all checks pass, render children
  return <>{children}</>;
}

// Convenience components for common permission checks
export function DashboardGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permissions={[Permission.VIEW_DASHBOARD]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function OrdersGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard permissions={[Permission.VIEW_ORDERS]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function MenuGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard permissions={[Permission.VIEW_MENU]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}

export function InventoryGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permissions={[Permission.VIEW_INVENTORY]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function ReportsGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permissions={[Permission.VIEW_REPORTS]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function SettingsGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permissions={[Permission.VIEW_SETTINGS]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function AdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      roles={[UserRole.OWNER, UserRole.MANAGER]}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

export function OwnerGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard roles={[UserRole.OWNER]} fallback={fallback}>
      {children}
    </PermissionGuard>
  );
}
