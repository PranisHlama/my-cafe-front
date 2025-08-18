// lib/types/auth.ts

export enum UserRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  BARISTA = 'barista',
  CASHIER = 'cashier',
  KITCHEN = 'kitchen',
  CUSTOMER = 'customer'
}

export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = 'view_dashboard',
  
  // Orders
  VIEW_ORDERS = 'view_orders',
  CREATE_ORDERS = 'create_orders',
  EDIT_ORDERS = 'edit_orders',
  DELETE_ORDERS = 'delete_orders',
  MANAGE_ORDERS = 'manage_orders',
  
  // Menu
  VIEW_MENU = 'view_menu',
  CREATE_MENU_ITEMS = 'create_menu_items',
  EDIT_MENU_ITEMS = 'edit_menu_items',
  DELETE_MENU_ITEMS = 'delete_menu_items',
  MANAGE_MENU = 'manage_menu',
  
  // Inventory
  VIEW_INVENTORY = 'view_inventory',
  EDIT_INVENTORY = 'edit_inventory',
  MANAGE_INVENTORY = 'manage_inventory',
  
  // Reports
  VIEW_REPORTS = 'view_reports',
  EXPORT_REPORTS = 'export_reports',
  MANAGE_REPORTS = 'manage_reports',
  
  // Settings
  VIEW_SETTINGS = 'view_settings',
  EDIT_SETTINGS = 'edit_settings',
  MANAGE_SETTINGS = 'manage_settings',
  
  // User Management
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  MANAGE_USERS = 'manage_users',
  
  // System
  VIEW_AUDIT_LOGS = 'view_audit_logs',
  MANAGE_SYSTEM = 'manage_system'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  isEmailVerified: boolean;
  isMFAEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  phone?: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  orderUpdates: boolean;
  inventoryAlerts: boolean;
  systemAlerts: boolean;
}

export interface LoginCredentials {
  // email: string;
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface MFAVerification {
  code: string;
  method: 'totp' | 'sms' | 'email';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface Session {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  lastActivityAt: string;
  createdAt: string;
}

export interface DeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  deviceId: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
  description: string;
}

// Role-based permission mappings
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: Object.values(Permission), // All permissions
  [UserRole.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ORDERS, Permission.CREATE_ORDERS, Permission.EDIT_ORDERS, Permission.MANAGE_ORDERS,
    Permission.VIEW_MENU, Permission.CREATE_MENU_ITEMS, Permission.EDIT_MENU_ITEMS, Permission.MANAGE_MENU,
    Permission.VIEW_INVENTORY, Permission.EDIT_INVENTORY, Permission.MANAGE_INVENTORY,
    Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS, Permission.MANAGE_REPORTS,
    Permission.VIEW_SETTINGS, Permission.EDIT_SETTINGS,
    Permission.VIEW_USERS, Permission.CREATE_USERS, Permission.EDIT_USERS,
    Permission.VIEW_AUDIT_LOGS
  ],
  [UserRole.BARISTA]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ORDERS, Permission.EDIT_ORDERS,
    Permission.VIEW_MENU,
    Permission.VIEW_INVENTORY, Permission.EDIT_INVENTORY
  ],
  [UserRole.CASHIER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ORDERS, Permission.CREATE_ORDERS, Permission.EDIT_ORDERS,
    Permission.VIEW_MENU,
    Permission.VIEW_INVENTORY
  ],
  [UserRole.KITCHEN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ORDERS, Permission.EDIT_ORDERS,
    Permission.VIEW_MENU,
    Permission.VIEW_INVENTORY, Permission.EDIT_INVENTORY
  ],
  [UserRole.CUSTOMER]: [
    Permission.VIEW_MENU
  ]
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.OWNER]: 'Full system access and control',
  [UserRole.MANAGER]: 'Manage operations, staff, and business functions',
  [UserRole.BARISTA]: 'Prepare drinks and manage orders',
  [UserRole.CASHIER]: 'Process payments and manage customer orders',
  [UserRole.KITCHEN]: 'Prepare food items and manage kitchen operations',
  [UserRole.CUSTOMER]: 'View menu and place orders'
};
