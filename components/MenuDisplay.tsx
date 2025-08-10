"use client";

import { useState, useEffect } from "react";
import { MenuService, Category, MenuItem } from "../lib/services/menuService";

export default function MenuDisplay() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load categories and menu items in parallel
      const [categoriesData, menuItemsData] = await Promise.all([
        MenuService.getCategories(),
        MenuService.getMenuItems(),
      ]);

      setCategories(categoriesData);
      setMenuItems(menuItemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = selectedCategory
    ? menuItems.filter((item) => item.category === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="text-lg">Loading menu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800 font-medium">Error loading menu</div>
        <div className="text-red-600 text-sm mt-1">{error}</div>
        <button
          onClick={loadData}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cafe Menu</h1>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === null
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMenuItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            {item.image_url && (
              <div className="aspect-video bg-gray-200">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <span className="text-lg font-bold text-blue-600">
                  ${parseFloat(item.base_price).toFixed(2)}
                </span>
              </div>
              {item.description && (
                <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {item.is_featured && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Featured
                  </span>
                )}
                {item.calories && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    {item.calories} cal
                  </span>
                )}
                {item.preparation_time && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {item.preparation_time} min
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMenuItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No menu items found</div>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              View All Categories
            </button>
          )}
        </div>
      )}
    </div>
  );
}
