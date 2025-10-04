"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  InventoryCreateInput,
  InventoryUpdateInput,
} from "@/lib/services/menuService";
import { InventoryItem } from "@/lib/definitions";
import { DataTable, Column } from "@/components/ui/DataTable";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal/form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<InventoryCreateInput>({
    name: "",
    description: "",
    unit: "pcs",
    quantity_in_stock: 0,
    reorder_level: 0,
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const data = await getInventory();
        setInventory(data);
      } catch (error) {
        console.error("Error fetching inventory:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setForm({
      name: "",
      description: "",
      unit: "pcs",
      quantity_in_stock: 0,
      reorder_level: 0,
      is_active: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description || "",
      unit: item.unit,
      quantity_in_stock: item.quantity_in_stock,
      reorder_level: item.reorder_level,
      is_active: item.is_active,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
  };

  const handleDelete = async (item: InventoryItem) => {
    const ok = window.confirm(
      `Delete item \"${item.name}\"? This cannot be undone.`
    );
    if (!ok) return;
    const success = await deleteInventoryItem(item.id);
    if (success) {
      setInventory((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      if (editingItem) {
        // Update
        const payload: InventoryUpdateInput = { ...form };
        const updated = await updateInventoryItem(editingItem.id, payload);
        if (updated) {
          setInventory((prev) =>
            prev.map((i) => (i.id === updated.id ? updated : i))
          );
          setIsModalOpen(false);
        } else {
          setError("Failed to update item");
        }
      } else {
        // Create
        const created = await createInventoryItem(form);
        if (created) {
          setInventory((prev) => [created, ...prev]);
          setIsModalOpen(false);
        } else {
          setError("Failed to create item");
        }
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<InventoryItem>[] = useMemo(
    () => [
      {
        key: "name",
        header: "Name",
        render: (value) => <span className="font-medium">{value}</span>,
      },
      { key: "description", header: "Description" },
      { key: "quantity_in_stock", header: "Stock" },
      { key: "unit", header: "Unit" },
      { key: "reorder_level", header: "Reorder Level" },
      {
        key: "needs_restock",
        header: "Needs Restock",
        render: (value: boolean) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
            }`}
          >
            {value ? "Yes" : "No"}
          </span>
        ),
      },
      {
        key: "is_active",
        header: "Active",
        render: (value: boolean) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              value
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {value ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        key: "last_updated",
        header: "Last Updated",
        render: (value: string) => new Date(value).toLocaleString(),
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
                openEditModal(item);
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
    [inventory]
  );

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <DataTable
        data={inventory}
        columns={columns}
        title="Inventory"
        description="Manage cafe inventory and stock levels"
        searchPlaceholder="Search inventory..."
        newButtonText="New Item"
        onNewClick={openCreateModal}
        itemsPerPage={15}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingItem ? "Edit Item" : "New Item"}
            </h3>

            {error && (
              <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Description
                </label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Level
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.reorder_level}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reorder_level: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity In Stock
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.quantity_in_stock}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantity_in_stock: Number(e.target.value),
                      })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
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
    </>
  );
}
