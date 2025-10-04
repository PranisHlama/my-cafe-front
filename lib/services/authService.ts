// lib/services/authService.ts
import { apiClient } from '../api';
import {
  User,
  UserProfile,
  LoginCredentials,
  MFAVerification,
  AuthResponse,
  Session,
  AuditLog,
  Permission,
  UserRole
} from '../types/auth';

interface AuthTokens {
  access: string;
  refresh?: string; 
}

interface LoginResponse extends AuthTokens {}

interface RefreshResponse extends AuthTokens {}


export class AuthService {
  private static readonly TOKEN_KEY = 'cafe_access_token';
  private static readonly REFRESH_TOKEN_KEY = 'cafe_refresh_token';
  private static readonly USER_KEY = 'cafe_user';

  // Check if we're on the client side
  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }


  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<any>('/api/auth/login/', credentials);

    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Login failed');
    }

    // Support both our custom shape and SimpleJWT default shape
    const access = response.data.accessToken || response.data.access;
    const refresh = response.data.refreshToken || response.data.refresh;
    if (!access || !refresh) {
      throw new Error('Login failed: tokens missing');
    }
    this.setTokens(access, refresh);

    // Persist user if backend provided, else create a minimal placeholder
    if (response.data.user) {
      this.setUser(response.data.user);
    } else {
      try {
        const payload = JSON.parse(atob(access.split('.')[1]));
        const minimalUser: any = {
          id: String(payload.user_id || payload.sub || 'me'),
          email: '',
          firstName: '',
          lastName: '',
          role: UserRole.CUSTOMER,
          permissions: [Permission.VIEW_MENU],
          isActive: true,
          isEmailVerified: true,
          isMFAEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.setUser(minimalUser);
      } catch {
        // If decoding fails, still set a minimal user so guards work
        const minimalUser: any = {
          id: 'me',
          email: '',
          firstName: '',
          lastName: '',
          role: UserRole.CUSTOMER,
          permissions: [Permission.VIEW_MENU],
          isActive: true,
          isEmailVerified: true,
          isMFAEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.setUser(minimalUser);
      }
    }

    return {
      user: this.getCurrentUser() as any,
      accessToken: access,
      refreshToken: refresh,
      expiresIn: 0,
    } as any;
  }

  // Login
  // static async login(credentials: LoginCredentials): Promise<AuthResponse> {
  //   const response = await apiClient.post<AuthResponse>('/api/auth/login/', credentials);
  //   if (response.error) {
  //     throw new Error(response.error);
  //   }
  //   if (!response.data) {
  //     throw new Error('Login failed');
  //   }
    
  //   // Store tokens and user data
  //   this.setTokens(response.data.accessToken, response.data.refreshToken);
  //   this.setUser(response.data.user);
    
  //   return response.data;
  // }

  // MFA Verification
  static async verifyMFA(verification: MFAVerification): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth/verify-mfa/', verification);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('MFA verification failed');
    }
    
    // Update tokens after MFA verification
    this.setTokens(response.data.accessToken, response.data.refreshToken);
    this.setUser(response.data.user);
    
    return response.data;
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  // Refresh Token
  static async refreshToken(): Promise<void> {
  const refreshToken = this.getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<RefreshResponse>('/api/auth/refresh/', {
    refresh: refreshToken
  });

  if (response.error || !response.data) {
    this.clearAuth();
    throw new Error('Token refresh failed');
  }

  // SimpleJWT returns { access: "..." }
  const newAccessToken = response.data.access;
    this.setTokens(newAccessToken, refreshToken);

}

  // static async refreshToken(): Promise<AuthResponse> {
  //   const refreshToken = this.getRefreshToken();
  //   if (!refreshToken) {
  //     throw new Error('No refresh token available');
  //   }

  //   const response = await apiClient.post<AuthResponse>('/api/auth/refresh/', {
  //     refresh: refreshToken
  //   });
    
  //   if (response.error) {
  //     throw new Error(response.error);
  //   }
  //   if (!response.data) {
  //     throw new Error('Token refresh failed');
  //   }
    
  //   this.setTokens(response.data.accessToken, response.data.refreshToken);
  //   this.setUser(response.data.user);
    
  //   return response.data;
  // }

  // Get Current User
  static getCurrentUser(): User | null {
    if (!this.isClient()) return null;
    
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    if (!this.isClient()) return false;
    
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    
    if (!token || !user) return false;
    
    // Check if token is expired (JWT tokens have expiration)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear it
        this.clearAuth();
        return false;
      }
    } catch (error) {
      // Invalid token format, clear it
      this.clearAuth();
      return false;
    }
    
    return true;
  }

  // Check if token is expired
  static isTokenExpired(): boolean {
    if (!this.isClient()) return true;
    
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  // Check if user has specific permission
  static hasPermission(permission: Permission): boolean {
    if (!this.isClient()) return false;
    
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  static hasAnyPermission(permissions: Permission[]): boolean {
    if (!this.isClient()) return false;
    
    return permissions.some(permission => this.hasPermission(permission));
  }

  // Check if user has all of the specified permissions
  static hasAllPermissions(permissions: Permission[]): boolean {
    if (!this.isClient()) return false;
    
    return permissions.every(permission => this.hasPermission(permission));
  }

  // Check if user has specific role
  static hasRole(role: UserRole): boolean {
    if (!this.isClient()) return false;
    
    const user = this.getCurrentUser();
    if (!user) return false;
    
    return user.role === role;
  }

  // Check if user has any of the specified roles
  static hasAnyRole(roles: UserRole[]): boolean {
    if (!this.isClient()) return false;
    
    return roles.some(role => this.hasRole(role));
  }

  // Get user sessions
  static async getUserSessions(): Promise<Session[]> {
    const response = await apiClient.get<Session[]>('/api/auth/sessions/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Revoke session
  static async revokeSession(sessionId: string): Promise<void> {
    const response = await apiClient.delete(`/api/auth/sessions/${sessionId}/`);
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Revoke all other sessions
  static async revokeAllOtherSessions(): Promise<void> {
    const response = await apiClient.post('/api/auth/sessions/revoke-all-other/');
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Get audit logs
  static async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    filters?: {
      userId?: string;
      action?: string;
      resource?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ logs: AuditLog[]; total: number; page: number; totalPages: number }> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    });

    const response = await apiClient.get<{ logs: AuditLog[]; total: number; page: number; totalPages: number }>(
      `/api/auth/audit-logs/?${queryParams}`
    );
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || { logs: [], total: 0, page: 1, totalPages: 1 };
  }

  // Update user profile
  static async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/api/auth/profile/', profile);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Profile update failed');
    }
    
    // Update stored user data
    this.setUser(response.data);
    
    return response.data;
  }

  // Change password
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const response = await apiClient.post('/api/auth/change-password/', {
      current_password: currentPassword,
      new_password: newPassword
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Enable/Disable MFA
  static async toggleMFA(enabled: boolean): Promise<void> {
    const response = await apiClient.post('/api/auth/toggle-mfa/', {
      enabled
    });
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    // Update user data
    const user = this.getCurrentUser();
    if (user) {
      user.isMFAEnabled = enabled;
      this.setUser(user);
    }
  }

  // Setup MFA
  static async setupMFA(): Promise<{ qrCode: string; secret: string }> {
    const response = await apiClient.post<{ qrCode: string; secret: string }>('/api/auth/setup-mfa/');
    
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('MFA setup failed');
    }
    
    return response.data;
  }

  // Private helper methods
  private static setTokens(accessToken: string, refreshToken: string): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  private static setUser(user: User): void {
    if (!this.isClient()) return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Public methods for token access
  static getAccessToken(): string | null {
    if (!this.isClient()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (!this.isClient()) return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  private static clearAuth(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
