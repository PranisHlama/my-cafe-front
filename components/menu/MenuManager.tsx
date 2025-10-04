"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MenuService,
  MenuItem,
  MenuItemCreateInput,
  MenuItemUpdateInput,
  Category,
} from "@/lib/services/menuService";
import { DataTable, Column } from "@/components/ui/DataTable";

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<MenuItemCreateInput>({
    name: "",
    description: "",
    category: 0,
    base_price: "0.00",
    is_available: true,
    is_featured: false,
    image_url: "",
    calories: undefined,
    allergens: "",
    preparation_time: undefined,
    display_order: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [menuItems, cats] = await Promise.all([
          MenuService.getMenuItems(),
          MenuService.getCategories(),
        ]);
        setItems(menuItems);
        setCategories(cats);
        if (cats.length && form.category === 0) {
          setForm((f) => ({ ...f, category: cats[0].id }));
        }
      } catch (e) {
        console.error("Failed to load menu data", e);
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({
      name: "",
      description: "",
      category: categories[0]?.id ?? 0,
      base_price: "0.00",
      is_available: true,
      is_featured: false,
      image_url: "",
      calories: undefined,
      allergens: "",
      preparation_time: undefined,
      display_order: 0,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      category: item.category,
      base_price: item.base_price,
      is_available: item.is_available,
      is_featured: item.is_featured,
      image_url: item.image_url ?? "",
      calories: item.calories,
      allergens: item.allergens ?? "",
      preparation_time: item.preparation_time,
      display_order: item.display_order,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleDelete = async (item: MenuItem) => {
    const ok = window.confirm(`Delete menu item \"${item.name}\"?`);
    if (!ok) return;
    const success = await MenuService.deleteMenuItem(item.id);
    if (success) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingItem) {
        const payload: MenuItemUpdateInput = { ...form };
        const updated = await MenuService.updateMenuItem(
          editingItem.id,
          payload
        );
        if (updated) {
          setItems((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
          setIsModalOpen(false);
        } else {
          setError("Failed to update menu item");
        }
      } else {
        const created = await MenuService.createMenuItem(form);
        if (created) {
          setItems((prev) => [created, ...prev]);
          setIsModalOpen(false);
        } else {
          setError("Failed to create menu item");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<MenuItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (v) => <span className="font-medium">{v}</span>,
      },
      { key: "description", header: "Description" },
      {
        key: "category",
        header: "Category",
        render: (value: number) => categoryNameById.get(value) ?? value,
      },
      {
        key: "base_price",
        header: "Price",
        render: (v) => `$${parseFloat(v).toFixed(2)}`,
      },
      {
        key: "is_available",
        header: "Available",
        render: (v: boolean) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              v ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {v ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "is_featured",
        header: "Featured",
        render: (v: boolean) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              v ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {v ? "Yes" : "No"}
          </span>
        ),
      },
      { key: "display_order", header: "Order" },
      {
        key: "actions",
        header: "Actions",
        render: (_: any, item) => (
          <div className="flex items-center gap-2">
            <button
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation();
                openEdit(item);
              }}
            >
              Edit
            </button>
            <button
              className="text-red-600 hover:text-red-800 text-sm font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item);
              }}
            >
              Delete
            </button>
          </div>
        ),
      },
    ],
    [categoryNameById]
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <DataTable
        data={items}
        columns={columns}
        title="Menu Items"
        description="Create, edit, and delete menu items"
        searchPlaceholder="Search menu items..."
        newButtonText="New Item"
        onNewClick={openCreate}
        itemsPerPage={15}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? "Edit Menu Item" : "New Menu Item"}
            </h3>

            {error && (
              <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: Number(e.target.value) })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={parseFloat(form.base_price || "0").toString()}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        base_price: Number(e.target.value || 0).toFixed(2),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.display_order ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        display_order: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.is_available}
                      onChange={(e) =>
                        setForm({ ...form, is_available: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Available
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) =>
                        setForm({ ...form, is_featured: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Featured
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={form.image_url ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, image_url: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calories
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.calories ?? 0}
                    onChange={(e) =>
                      setForm({ ...form, calories: Number(e.target.value) })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text sm font-medium text-gray-700 mb-1">
                    Prep Time (min)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.preparation_time ?? 0}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        preparation_time: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergens
                </label>
                <input
                  type="text"
                  value={form.allergens ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, allergens: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingItem
                    ? "Save Changes"
                    : "Create Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
