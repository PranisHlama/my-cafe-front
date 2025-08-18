// lib/utils/tokenUtils.ts

export interface JWTPayload {
  exp?: number;
  iat?: number;
  user_id?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

export class TokenUtils {
  /**
   * Decode a JWT token without verification
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  /**
   * Check if a token is expired
   */
  static isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Get time until token expires
   */
  static getTimeUntilExpiry(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) return 0;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  }

  /**
   * Format token expiry time
   */
  static formatExpiryTime(token: string): string {
    const timeUntilExpiry = this.getTimeUntilExpiry(token);
    if (timeUntilExpiry === 0) return 'Expired';
    
    const minutes = Math.floor(timeUntilExpiry / 60);
    const seconds = timeUntilExpiry % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Validate token format
   */
  static isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') return false;
    
    const parts = token.split('.');
    return parts.length === 3;
  }

  /**
   * Get token info for debugging
   */
  static getTokenInfo(token: string) {
    if (!this.isValidTokenFormat(token)) {
      return { valid: false, error: 'Invalid token format' };
    }

    const payload = this.decodeToken(token);
    if (!payload) {
      return { valid: false, error: 'Failed to decode token' };
    }

    const isExpired = this.isTokenExpired(token);
    const timeUntilExpiry = this.getTimeUntilExpiry(token);

    return {
      valid: true,
      isExpired,
      timeUntilExpiry,
      formattedExpiry: this.formatExpiryTime(token),
      payload,
      issuedAt: payload.iat ? new Date(payload.iat * 1000).toISOString() : 'Unknown',
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Unknown',
    };
  }
}
