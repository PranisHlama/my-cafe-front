import { AuthService } from "./services/authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry: boolean = true
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    // Attach access token if available
    const token = AuthService.getAccessToken?.();
    const headers: HeadersInit = {
      ...(options.headers || {}),
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    let response: Response;
    try {
      response = await fetch(url, fetchOptions);
    } catch (err) {
      return { error: 'Network error' };
    }

    // If token expired and we haven't retried yet, try to refresh and retry
    if (response.status === 401 && retry && AuthService.refreshToken) {
      try {
        await AuthService.refreshToken();
        // Try again with new token
        return this.request<T>(endpoint, options, false);
      } catch {
        AuthService.logout?.();
        return { error: 'Session expired. Please log in again.' };
      }
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      data = undefined;
    }

    if (!response.ok) {
      return { error: data?.detail || data?.error || 'API error', ...data };
    }
    return { data };
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export the base URL for other parts of the app
export { API_BASE_URL };