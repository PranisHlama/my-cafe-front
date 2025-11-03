"use client";

import { useEffect, useMemo, useState } from "react";
import { MenuService, Category } from "@/lib/services/menuService";
import { DataTable, Column } from "@/components/ui/DataTable";

type CategoryForm = {
  name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
};

export default function CategoryManager() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CategoryForm>({
    name: "",
    description: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const cats = await MenuService.getCategories();
        setItems(cats);
      } catch (e) {
        setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", display_order: 0, is_active: true });
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      description: cat.description ?? "",
      display_order: cat.display_order,
      is_active: cat.is_active,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleDelete = async (cat: Category) => {
    const ok = window.confirm(`Delete category "${cat.name}"?`);
    if (!ok) return;
    const success = await MenuService.deleteCategory(cat.id);
    if (success) setItems((prev) => prev.filter((i) => i.id !== cat.id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (editing) {
        const updated = await MenuService.updateCategory(editing.id, form);
        if (updated) {
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          setIsModalOpen(false);
        } else {
          setError("Failed to update category");
        }
      } else {
        const created = await MenuService.createCategory(form);
        if (created) {
          setItems((prev) => [created, ...prev]);
          setIsModalOpen(false);
        } else {
          setError("Failed to create category");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Category>[] = useMemo(
    () => [
      { key: "name", header: "Name" },
      { key: "description", header: "Description" },
      { key: "display_order", header: "Order" },
      {
        key: "is_active",
        header: "Active",
        render: (v: boolean) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${v ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
            {v ? "Yes" : "No"}
          </span>
        ),
      },
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
    []
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <DataTable
        data={items}
        columns={columns}
        title="Categories"
        description="Create, edit, and delete categories"
        searchPlaceholder="Search categories..."
        newButtonText="New Category"
        onNewClick={openCreate}
        itemsPerPage={15}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editing ? "Edit Category" : "New Category"}
            </h3>

            {error && (
              <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description ?? ""}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.display_order}
                    onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Active
                  </label>
                </div>
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
                  {isSubmitting ? "Saving..." : editing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


