"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";
import { MenuService, Category, MenuItem } from "@/lib/services/menuService";

export default function MenuPage() {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Load menu data
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setLoading(true);
        const [categoriesData, menuItemsData] = await Promise.all([
          MenuService.getCategories(),
          MenuService.getMenuItems(),
        ]);
        setCategories(categoriesData);
        setMenuItems(menuItemsData);
      } catch (err: any) {
        setError(err?.message || "Failed to load menu data");
      } finally {
        setLoading(false);
      }
    };

    if (isClient) {
      loadMenuData();
    }
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Check if user has admin/owner or cashier role
  const isAdmin =
    user && AuthService.hasAnyRole([UserRole.OWNER, UserRole.MANAGER]);
  const isCashier = user && AuthService.hasRole(UserRole.CASHIER);

  if (!isAdmin && !isCashier) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Loading menu...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  // Group menu items by category
  const menuByCategory = categories.map((category) => ({
    ...category,
    items: menuItems.filter((item) => item.category === category.id),
  }));

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Menu</h1>
        <p className="text-gray-600 mt-2">
          Manage menu items, categories, and pricing
        </p>
      </div>

      {/* Categories and Menu Items */}
      <div className="space-y-8">
        {menuByCategory.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-gray-600 mt-2">{category.description}</p>
              )}
              <div className="mt-2 text-sm text-gray-500">
                {category.menu_items_count} items
              </div>
            </div>

            <div className="p-6">
              {category.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <span className="text-lg font-bold text-green-600">
                          ₹{parseFloat(item.base_price).toFixed(2)}
                        </span>
                      </div>

                      {item.description && (
                        <p className="text-gray-600 text-sm mb-3">
                          {item.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.is_available
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.is_available ? "Available" : "Unavailable"}
                        </span>
                        {item.is_featured && (
                          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-gray-500 space-y-1">
                        {item.calories && <div>Calories: {item.calories}</div>}
                        {item.preparation_time && (
                          <div>Prep time: {item.preparation_time} min</div>
                        )}
                        {item.allergens && (
                          <div>Allergens: {item.allergens}</div>
                        )}
                      </div>

                      {item.pricing_rules && item.pricing_rules.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">
                            Special Pricing:
                          </div>
                          {item.pricing_rules.map((rule) => (
                            <div
                              key={rule.id}
                              className="text-xs text-blue-600"
                            >
                              {rule.name}: ₹
                              {parseFloat(rule.price_adjustment).toFixed(2)}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No items in this category
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
