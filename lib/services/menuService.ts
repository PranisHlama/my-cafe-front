// lib/services/menuService.ts
import { apiClient } from '../api';

export interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created: string;
  updated: string;
}

export interface ModifierGroup {
  id: number;
  name: string;
  description?: string;
  is_required: boolean;
  max_selections: number;
  display_order: number;
  is_active: boolean;
  created: string;
  updated: string;
}

export interface Modifier {
  id: number;
  group: number;
  name: string;
  price_adjustment: string;
  is_available: boolean;
  display_order: number;
  created: string;
  updated: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  category: number;
  base_price: string;
  is_available: boolean;
  is_featured: boolean;
  image_url?: string;
  calories?: number;
  allergens?: string;
  preparation_time?: number;
  modifier_groups: number[];
  display_order: number;
  created: string;
  updated: string;
}

export interface PricingRule {
  id: number;
  name: string;
  description?: string;
  menu_item: number;
  price_adjustment: string;
  percentage_adjustment: string;
  start_time?: string;
  end_time?: string;
  days_of_week?: string;
  is_active: boolean;
  created: string;
  updated: string;
}

export interface MenuItemAvailability {
  id: number;
  menu_item: number;
  is_available: boolean;
  reason?: string;
  changed_by?: string;
  changed_at: string;
}

// Menu Service Class
export class MenuService {
  // Categories
  static async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/api/categories/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  static async getCategory(id: number): Promise<Category> {
    const response = await apiClient.get<Category>(`/api/categories/${id}/`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Category not found');
    }
    return response.data;
  }

  // Menu Items
  static async getMenuItems(): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>('/api/menu-items/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  static async getMenuItem(id: number): Promise<MenuItem> {
    const response = await apiClient.get<MenuItem>(`/api/menu-items/${id}/`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Menu item not found');
    }
    return response.data;
  }

  static async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>(`/api/menu-items/?category=${categoryId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  static async getFeaturedMenuItems(): Promise<MenuItem[]> {
    const response = await apiClient.get<MenuItem[]>('/api/menu-items/?is_featured=true');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Modifier Groups
  static async getModifierGroups(): Promise<ModifierGroup[]> {
    const response = await apiClient.get<ModifierGroup[]>('/api/modifier-groups/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  static async getModifierGroup(id: number): Promise<ModifierGroup> {
    const response = await apiClient.get<ModifierGroup>(`/api/modifier-groups/${id}/`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Modifier group not found');
    }
    return response.data;
  }

  // Modifiers
  static async getModifiers(): Promise<Modifier[]> {
    const response = await apiClient.get<Modifier[]>('/api/modifiers/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  static async getModifiersByGroup(groupId: number): Promise<Modifier[]> {
    const response = await apiClient.get<Modifier[]>(`/api/modifiers/?group=${groupId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Pricing Rules
  static async getPricingRules(): Promise<PricingRule[]> {
    const response = await apiClient.get<PricingRule[]>('/api/pricing-rules/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  static async getPricingRulesByMenuItem(menuItemId: number): Promise<PricingRule[]> {
    const response = await apiClient.get<PricingRule[]>(`/api/pricing-rules/?menu_item=${menuItemId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  // Availability History
  static async getAvailabilityHistory(): Promise<MenuItemAvailability[]> {
    const response = await apiClient.get<MenuItemAvailability[]>('/api/availability-history/');
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }

  static async getAvailabilityHistoryByMenuItem(menuItemId: number): Promise<MenuItemAvailability[]> {
    const response = await apiClient.get<MenuItemAvailability[]>(`/api/availability-history/?menu_item=${menuItemId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  }
} 