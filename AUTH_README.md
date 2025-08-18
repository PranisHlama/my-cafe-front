# Authentication & RBAC System

This document describes the comprehensive authentication and Role-Based Access Control (RBAC) system implemented in the Cafe Manager application.

## 🏗️ **System Architecture**

### **Core Components**

- **Authentication Service** (`lib/services/authService.ts`)
- **Permission Guards** (`components/auth/PermissionGuard.tsx`)
- **Type Definitions** (`lib/types/auth.ts`)
- **Protected Routes** with role-based access

## 🔐 **Authentication Features**

### **Multi-Factor Authentication (MFA)**

- **TOTP Support**: Time-based one-time passwords
- **SMS/Email Codes**: Alternative MFA methods
- **MFA Setup**: QR code generation for authenticator apps
- **MFA Toggle**: Enable/disable MFA for users

### **Session Management**

- **Device Tracking**: Monitor active sessions across devices
- **Session Revocation**: Revoke individual or all other sessions
- **Device Information**: Browser, OS, and device type detection
- **IP Address Logging**: Track login locations

### **Security Features**

- **JWT Tokens**: Access and refresh token system
- **Token Refresh**: Automatic token renewal
- **Secure Storage**: Local storage with encryption considerations
- **Logout**: Secure session termination

## 👥 **Role-Based Access Control (RBAC)**

### **User Roles**

| Role         | Description          | Access Level                                 |
| ------------ | -------------------- | -------------------------------------------- |
| **Owner**    | System administrator | Full access to all features                  |
| **Manager**  | Business operations  | Manage staff, operations, reports            |
| **Barista**  | Drink preparation    | View orders, update status, manage inventory |
| **Cashier**  | Customer service     | Process orders, handle payments              |
| **Kitchen**  | Food preparation     | View orders, update status, manage inventory |
| **Customer** | End user             | View menu, place orders                      |

### **Permission System**

#### **Dashboard Permissions**

- `VIEW_DASHBOARD`: Access to main dashboard

#### **Order Management**

- `VIEW_ORDERS`: View order list
- `CREATE_ORDERS`: Create new orders
- `EDIT_ORDERS`: Modify existing orders
- `DELETE_ORDERS`: Remove orders
- `MANAGE_ORDERS`: Full order control

#### **Menu Management**

- `VIEW_MENU`: View menu items
- `CREATE_MENU_ITEMS`: Add new menu items
- `EDIT_MENU_ITEMS`: Modify menu items
- `DELETE_MENU_ITEMS`: Remove menu items
- `MANAGE_MENU`: Full menu control

#### **Inventory Management**

- `VIEW_INVENTORY`: View inventory items
- `EDIT_INVENTORY`: Modify inventory
- `MANAGE_INVENTORY`: Full inventory control

#### **Reports & Analytics**

- `VIEW_REPORTS`: Access to reports
- `EXPORT_REPORTS`: Download report data
- `MANAGE_REPORTS`: Full report control

#### **System Administration**

- `VIEW_SETTINGS`: Access system settings
- `EDIT_SETTINGS`: Modify settings
- `MANAGE_SETTINGS`: Full settings control
- `VIEW_USERS`: View user list
- `CREATE_USERS`: Add new users
- `EDIT_USERS`: Modify user profiles
- `DELETE_USERS`: Remove users
- `MANAGE_USERS`: Full user control
- `VIEW_AUDIT_LOGS`: Access audit logs
- `MANAGE_SYSTEM`: Full system control

## 🛡️ **Permission Guards**

### **Basic Permission Guard**

```tsx
import { PermissionGuard } from "../components/auth/PermissionGuard";

<PermissionGuard permissions={[Permission.VIEW_ORDERS]}>
  <OrdersComponent />
</PermissionGuard>;
```

### **Role-Based Guards**

```tsx
import { AdminGuard, OwnerGuard } from '../components/auth/PermissionGuard';

<AdminGuard>
  <AdminOnlyComponent />
</AdminGuard>

<OwnerGuard>
  <OwnerOnlyComponent />
</OwnerGuard>
```

### **Convenience Guards**

- `DashboardGuard`: Dashboard access
- `OrdersGuard`: Order management
- `MenuGuard`: Menu access
- `InventoryGuard`: Inventory access
- `ReportsGuard`: Reports access
- `SettingsGuard`: Settings access

## 📱 **MFA Implementation**

### **MFA Flow**

1. **Login**: User enters credentials
2. **MFA Check**: System checks if MFA is enabled
3. **MFA Prompt**: If enabled, show MFA verification
4. **Code Verification**: User enters TOTP/SMS/Email code
5. **Access Granted**: Full access after successful verification

### **MFA Setup Process**

1. **Initiate Setup**: User requests MFA setup
2. **Generate Secret**: System generates TOTP secret
3. **QR Code**: Display QR code for authenticator apps
4. **Verification**: User verifies setup with first code
5. **Activation**: MFA is enabled for the account

## 🔍 **Audit Logging**

### **Tracked Actions**

- **Authentication**: Login, logout, MFA verification
- **Data Operations**: Create, read, update, delete
- **System Actions**: Settings changes, user management
- **Security Events**: Failed logins, permission violations

### **Audit Log Details**

- **User ID**: Who performed the action
- **Action**: What was done
- **Resource**: What was affected
- **Details**: Additional context
- **IP Address**: Source location
- **User Agent**: Device/browser information
- **Timestamp**: When it happened

## 🚀 **Usage Examples**

### **Protecting a Page**

```tsx
// app/admin/users/page.tsx
import { AdminGuard } from "../../../components/auth/PermissionGuard";

export default function UsersPage() {
  return (
    <AdminGuard>
      <div className="p-6">{/* User management content */}</div>
    </AdminGuard>
  );
}
```

### **Conditional Rendering**

```tsx
import { AuthService } from "../../lib/services/authService";
import { Permission } from "../../lib/types/auth";

function ConditionalComponent() {
  const canEditOrders = AuthService.hasPermission(Permission.EDIT_ORDERS);

  return <div>{canEditOrders && <button>Edit Order</button>}</div>;
}
```

### **Role-Based Navigation**

```tsx
import { AuthService } from "../../lib/services/authService";
import { UserRole } from "../../lib/types/auth";

function Navigation() {
  const isAdmin = AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]);

  return (
    <nav>
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/orders">Orders</Link>
      {isAdmin && <Link href="/admin/users">Users</Link>}
    </nav>
  );
}
```

## 🔧 **Configuration**

### **Environment Variables**

```env
# Django Backend API URL
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000

# JWT Configuration (if needed)
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=3600
```

### **API Endpoints**

The system expects the following Django backend endpoints:

- `POST /api/auth/login/` - User authentication
- `POST /api/auth/verify-mfa/` - MFA verification
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Token refresh
- `GET /api/auth/sessions/` - User sessions
- `DELETE /api/auth/sessions/{id}/` - Revoke session
- `GET /api/auth/audit-logs/` - Audit logs
- `PUT /api/auth/profile/` - Update profile
- `POST /api/auth/change-password/` - Change password
- `POST /api/auth/toggle-mfa/` - Enable/disable MFA
- `POST /api/auth/setup-mfa/` - Setup MFA

## 🚨 **Security Considerations**

### **Best Practices**

1. **Strong Passwords**: Enforce password complexity
2. **MFA Enforcement**: Require MFA for admin accounts
3. **Session Timeout**: Implement automatic session expiration
4. **Rate Limiting**: Prevent brute force attacks
5. **Audit Logging**: Monitor all system activities
6. **Regular Reviews**: Periodic access reviews

### **Data Protection**

- **Encryption**: Encrypt sensitive data at rest
- **HTTPS**: Use secure connections
- **Token Security**: Secure JWT storage
- **Input Validation**: Validate all user inputs

## 📊 **Monitoring & Analytics**

### **Security Metrics**

- Failed login attempts
- MFA usage statistics
- Session duration patterns
- Permission access patterns
- Suspicious activity detection

### **User Activity**

- Login frequency
- Feature usage patterns
- Session distribution
- Device preferences

## 🔄 **Future Enhancements**

### **Planned Features**

- **Biometric Authentication**: Fingerprint/face recognition
- **SSO Integration**: Single sign-on with external providers
- **Advanced MFA**: Hardware security keys (FIDO2)
- **Risk-Based Authentication**: Adaptive security measures
- **Compliance Reporting**: GDPR, SOX compliance tools

### **Integration Possibilities**

- **LDAP/Active Directory**: Enterprise user management
- **OAuth 2.0**: Third-party authentication
- **SAML**: Enterprise SSO
- **WebAuthn**: Modern web authentication standards

## 📚 **Additional Resources**

- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [RBAC Implementation](https://en.wikipedia.org/wiki/Role-based_access_control)
- [MFA Security](https://www.nist.gov/itl/applied-cybersecurity/tools/mfa)
- [Audit Logging](https://owasp.org/www-project-proactive-controls/v3/en/c9-security-logging)

---

This authentication system provides enterprise-grade security while maintaining ease of use for cafe staff and customers.
