// lib/services/menuService.ts
import { apiClient } from '../api';
import { InventoryItem } from '../definitions';

export interface Category {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  created: string;
  updated: string;
  menu_items_count?: number;
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
  category_name: string;
  base_price: string;
  is_available: boolean;
  is_featured: boolean;
  image_url?: string;
  calories?: number;
  allergens?: string;
  preparation_time?: number;
  modifier_groups: ModifierGroup[];
  display_order: number;
  created: string;
  updated: string;
  pricing_rules: PricingRule[];
}

export type MenuItemCreateInput = {
  name: string;
  description?: string | null;
  category: number;
  base_price: string; // send as string to preserve decimal
  is_available: boolean;
  is_featured: boolean;
  image_url?: string | null;
  calories?: number | null;
  allergens?: string | null;
  preparation_time?: number | null;
  display_order?: number;
};

export type MenuItemUpdateInput = Partial<MenuItemCreateInput>;

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

  static async createCategory(payload: Pick<Category, 'name' | 'description' | 'display_order' | 'is_active'>): Promise<Category | null> {
    const res = await apiClient.post<Category>('/api/categories/', payload);
    if (res.error) {
      console.error('Failed to create category:', res.error);
      return null;
    }
    return res.data ?? null;
  }

  static async updateCategory(id: number, payload: Partial<Pick<Category, 'name' | 'description' | 'display_order' | 'is_active'>>): Promise<Category | null> {
    const res = await apiClient.put<Category>(`/api/categories/${id}/`, payload);
    if (res.error) {
      console.error('Failed to update category:', res.error);
      return null;
    }
    return res.data ?? null;
  }

  static async deleteCategory(id: number): Promise<boolean> {
    const res = await apiClient.delete(`/api/categories/${id}/`);
    if (res.error) {
      console.error('Failed to delete category:', res.error);
      return false;
    }
    return true;
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

  // CRUD for Menu Items
  static async createMenuItem(payload: MenuItemCreateInput): Promise<MenuItem | null> {
    const res = await apiClient.post<MenuItem>('/api/menu-items/', payload);
    if (res.error) {
      console.error('Failed to create menu item:', res.error);
      throw new Error(res.error);
    }
    return res.data ?? null;
  }

  static async updateMenuItem(id: number, payload: MenuItemUpdateInput): Promise<MenuItem | null> {
    const res = await apiClient.put<MenuItem>(`/api/menu-items/${id}/`, payload);
    if (res.error) {
      console.error('Failed to update menu item:', res.error);
      throw new Error(res.error);
    }
    return res.data ?? null;
  }

  static async deleteMenuItem(id: number): Promise<boolean> {
    const res = await apiClient.delete(`/api/menu-items/${id}/`);
    if (res.error) {
      console.error('Failed to delete menu item:', res.error);
      return false;
    }
    return true;
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

// Inventory
export async function getInventory(): Promise<InventoryItem[]> {
  const res = await apiClient.get<InventoryItem[]>("/api/inventory/");

  if (res.error) {
    console.error("Failed to fetch inventory:", res.error);
    return [];
  }

  return res.data || [];
}

export type InventoryCreateInput = {
  name: string;
  description?: string | null;
  unit: string;
  quantity_in_stock: number;
  reorder_level: number;
  is_active: boolean;
};

export type InventoryUpdateInput = Partial<InventoryCreateInput>;

export async function createInventoryItem(payload: InventoryCreateInput): Promise<InventoryItem | null> {
  const res = await apiClient.post<InventoryItem>("/api/inventory/", payload);
  if (res.error) {
    console.error("Failed to create inventory item:", res.error);
    return null;
  }
  return res.data ?? null;
}

export async function updateInventoryItem(id: number, payload: InventoryUpdateInput): Promise<InventoryItem | null> {
  const res = await apiClient.put<InventoryItem>(`/api/inventory/${id}/`, payload);
  if (res.error) {
    console.error("Failed to update inventory item:", res.error);
    return null;
  }
  return res.data ?? null;
}

export async function deleteInventoryItem(id: number): Promise<boolean> {
  const res = await apiClient.delete(`/api/inventory/${id}/`);
  if (res.error) {
    console.error("Failed to delete inventory item:", res.error);
    return false;
  }
  return true;
} 

// Inventory Transactions and Adjustments
export type InventoryTransaction = {
  id: number;
  inventory_item: number;
  inventory_item_name: string;
  transaction_type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'WASTE';
  quantity: string; // backend returns Decimal as string
  reference?: string | null;
  created_at: string;
  created_by?: string | null;
};

export async function getLowStockInventory(): Promise<InventoryItem[]> {
  const res = await apiClient.get<InventoryItem[]>("/api/inventory/low_stock/");
  if (res.error) {
    console.error("Failed to fetch low stock inventory:", res.error);
    return [];
  }
  return res.data || [];
}

export async function getInventoryTransactions(itemId: number): Promise<InventoryTransaction[]> {
  const res = await apiClient.get<InventoryTransaction[]>(`/api/inventory/${itemId}/transactions/`);
  if (res.error) {
    console.error("Failed to fetch inventory transactions:", res.error);
    return [];
  }
  return res.data || [];
}

export type InventoryAdjustInput = {
  transaction_type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'WASTE';
  quantity: number | string;
  reference?: string | null;
  created_by?: string | null;
};

export async function adjustInventoryItem(id: number, payload: InventoryAdjustInput): Promise<{ item: InventoryItem; transaction: InventoryTransaction } | null> {
  const res = await apiClient.post<{ item: InventoryItem; transaction: InventoryTransaction }>(`/api/inventory/${id}/adjust/`, payload);
  if (res.error) {
    console.error("Failed to adjust inventory:", res.error);
    return null;
  }
  return res.data ?? null;
}

// Recipe (Menu Item Ingredients)
export type Recipe = {
  id: number;
  menu_item: number;
  menu_item_name: string;
  inventory_item: number;
  inventory_item_name: string;
  inventory_item_unit: string;
  quantity_required: string; // backend returns Decimal as string
};

export type RecipeCreateInput = {
  menu_item: number;
  inventory_item: number;
  quantity_required: number | string;
};

export type RecipeUpdateInput = Partial<RecipeCreateInput>;

export async function getRecipes(): Promise<Recipe[]> {
  const res = await apiClient.get<Recipe[]>("/api/recipes/");
  if (res.error) {
    console.error("Failed to fetch recipes:", res.error);
    return [];
  }
  return res.data || [];
}

export async function getRecipesByMenuItem(menuItemId: number): Promise<Recipe[]> {
  const res = await apiClient.get<Recipe[]>(`/api/recipes/by_menu_item/?menu_item_id=${menuItemId}`);
  if (res.error) {
    console.error("Failed to fetch recipes for menu item:", res.error);
    return [];
  }
  return res.data || [];
}

export async function createRecipe(payload: RecipeCreateInput): Promise<Recipe | null> {
  const res = await apiClient.post<Recipe>("/api/recipes/", payload);
  if (res.error) {
    console.error("Failed to create recipe:", res.error);
    return null;
  }
  return res.data ?? null;
}

export async function updateRecipe(id: number, payload: RecipeUpdateInput): Promise<Recipe | null> {
  const res = await apiClient.put<Recipe>(`/api/recipes/${id}/`, payload);
  if (res.error) {
    console.error("Failed to update recipe:", res.error);
    return null;
  }
  return res.data ?? null;
}

export async function deleteRecipe(id: number): Promise<boolean> {
  const res = await apiClient.delete(`/api/recipes/${id}/`);
  if (res.error) {
    console.error("Failed to delete recipe:", res.error);
    return false;
  }
  return true;
}
