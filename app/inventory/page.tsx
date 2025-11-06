"use client";

import { useState, useEffect } from "react";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";
import {
  getInventory,
  getLowStockInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  adjustInventoryItem,
  getInventoryTransactions,
} from "@/lib/services/menuService";
import type { InventoryItem } from "@/lib/definitions";

export default function InventoryPage() {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [search, setSearch] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    unit: "",
    quantity_in_stock: 0,
    reorder_level: 0,
    is_active: true,
  });

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
  const [adjustData, setAdjustData] = useState({
    transaction_type: "PURCHASE" as
      | "PURCHASE"
      | "SALE"
      | "ADJUSTMENT"
      | "WASTE",
    quantity: 0,
    reference: "",
  });
  const [txLoading, setTxLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    setIsClient(true);
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    void loadInventory();
  }, [isClient, showLowStockOnly]);

  async function loadInventory() {
    setLoading(true);
    try {
      const data = showLowStockOnly
        ? await getLowStockInventory()
        : await getInventory();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setFormData({
      name: "",
      description: "",
      unit: "",
      quantity_in_stock: 0,
      reorder_level: 0,
      is_active: true,
    });
    setFormOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setEditing(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      unit: item.unit,
      quantity_in_stock: Number(item.quantity_in_stock),
      reorder_level: Number(item.reorder_level),
      is_active: item.is_active,
    });
    setFormOpen(true);
  }

  async function submitForm() {
    setLoading(true);
    try {
      if (editing) {
        await updateInventoryItem(editing.id, formData as any);
      } else {
        await createInventoryItem(formData as any);
      }
      setFormOpen(false);
      await loadInventory();
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id: number) {
    if (!confirm("Delete this inventory item?")) return;
    setLoading(true);
    try {
      await deleteInventoryItem(id);
      await loadInventory();
    } finally {
      setLoading(false);
    }
  }

  async function openAdjust(item: InventoryItem) {
    setAdjustTarget(item);
    setAdjustData({ transaction_type: "PURCHASE", quantity: 0, reference: "" });
    setAdjustOpen(true);
    setTxLoading(true);
    try {
      const tx = await getInventoryTransactions(item.id);
      setTransactions(tx);
    } finally {
      setTxLoading(false);
    }
  }

  async function submitAdjust() {
    if (!adjustTarget) return;
    setLoading(true);
    try {
      await adjustInventoryItem(adjustTarget.id, adjustData);
      setAdjustOpen(false);
      await loadInventory();
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
        <p className="text-gray-600 mt-2">
          Manage inventory levels, stock, and supplies
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or unit"
              className="border rounded px-3 py-2 w-64"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
              />
              Show low stock only
            </label>
          </div>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
            >
              Add Item
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qty
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reorder
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(items || [])
                .filter((i) => {
                  const q = search.trim().toLowerCase();
                  if (!q) return true;
                  return (
                    i.name.toLowerCase().includes(q) ||
                    i.unit.toLowerCase().includes(q)
                  );
                })
                .map((i) => (
                  <tr key={i.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{i.name}</div>
                      {i.description ? (
                        <div className="text-xs text-gray-500 max-w-[400px] truncate">
                          {i.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{i.unit}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {i.quantity_in_stock}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {i.reorder_level}
                    </td>
                    <td className="px-4 py-3">
                      {i.needs_restock ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Low
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openAdjust(i)}
                          className="px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-50"
                        >
                          Adjust
                        </button>
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => openEdit(i)}
                              className="px-3 py-1.5 rounded border text-gray-700 hover:bg-gray-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => removeItem(i.id)}
                              className="px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              {(!items || items.length === 0) && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={6}
                  >
                    {loading ? "Loading..." : "No inventory items found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editing ? "Edit Item" : "Add Item"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Name</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Unit</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={formData.unit}
                  onChange={(e) =>
                    setFormData({ ...formData, unit: e.target.value })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="border rounded px-3 py-2 w-full"
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={formData.quantity_in_stock}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantity_in_stock: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Reorder Level
                </label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={formData.reorder_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorder_level: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setFormOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={submitForm}
                disabled={loading}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {editing ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Modal */}
      {adjustOpen && adjustTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Adjust Stock — {adjustTarget.name}
              </h3>
              <button
                onClick={() => setAdjustOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Type</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  value={adjustData.transaction_type}
                  onChange={(e) =>
                    setAdjustData({
                      ...adjustData,
                      transaction_type: e.target.value as any,
                    })
                  }
                >
                  <option value="PURCHASE">Purchase (+)</option>
                  <option value="SALE">Sale (-)</option>
                  <option value="ADJUSTMENT">Adjustment (+)</option>
                  <option value="WASTE">Waste (-)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  className="border rounded px-3 py-2 w-full"
                  value={adjustData.quantity}
                  onChange={(e) =>
                    setAdjustData({
                      ...adjustData,
                      quantity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Reference
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  value={adjustData.reference}
                  onChange={(e) =>
                    setAdjustData({ ...adjustData, reference: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setAdjustOpen(false)}
                className="px-4 py-2 rounded border"
              >
                Cancel
              </button>
              <button
                onClick={submitAdjust}
                disabled={loading}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Recent Transactions
              </h4>
              <div className="border rounded">
                <div className="max-h-56 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Type
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Qty
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Ref
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {txLoading ? (
                        <tr>
                          <td
                            className="px-3 py-4 text-sm text-gray-500"
                            colSpan={4}
                          >
                            Loading...
                          </td>
                        </tr>
                      ) : (
                        (transactions || []).map((t) => (
                          <tr key={t.id}>
                            <td className="px-3 py-2 text-sm text-gray-700">
                              {new Date(t.created_at).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-700">
                              {t.transaction_type}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-700">
                              {t.quantity}
                            </td>
                            <td className="px-3 py-2 text-sm text-gray-700">
                              {t.reference || "-"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
