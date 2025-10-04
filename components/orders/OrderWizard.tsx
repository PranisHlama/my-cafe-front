"use client";

import { useEffect, useMemo, useState } from "react";
import { OrdersService, OrderDTO, OrderItemInput } from "@/lib/services/ordersService";
import { MenuService, MenuItem } from "@/lib/services/menuService";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated?: (order: OrderDTO) => void;
}

interface DraftItem {
  menu_item: number;
  name: string;
  price: number; // base price snapshot
  quantity: number;
}

export default function OrderWizard({ open, onClose, onCreated }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [query, setQuery] = useState("");
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const items = await MenuService.getMenuItems();
        setMenuItems(items);
      } catch (e) {}
    };
    load();
  }, [open]);

  useEffect(() => {
    if (!open) {
      // reset state when closing
      setTimeout(() => {
        setStep(1);
        setQuery("");
        setDraftItems([]);
        setError(null);
        setSubmitting(false);
      }, 200);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menuItems;
    return menuItems.filter((m) => m.name.toLowerCase().includes(q));
  }, [menuItems, query]);

  const total = useMemo(() => {
    return draftItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
  }, [draftItems]);

  const addItem = (item: MenuItem) => {
    const existing = draftItems.find((d) => d.menu_item === item.id);
    if (existing) {
      setDraftItems((prev) => prev.map((d) => (d.menu_item === item.id ? { ...d, quantity: d.quantity + 1 } : d)));
    } else {
      setDraftItems((prev) => [
        ...prev,
        {
          menu_item: item.id,
          name: item.name,
          price: parseFloat(item.base_price),
          quantity: 1,
        },
      ]);
    }
  };

  const decItem = (id: number) => {
    setDraftItems((prev) => prev.map((d) => (d.menu_item === id ? { ...d, quantity: Math.max(1, d.quantity - 1) } : d)));
  };

  const removeItem = (id: number) => {
    setDraftItems((prev) => prev.filter((d) => d.menu_item !== id));
  };

  const submit = async () => {
    if (draftItems.length === 0) {
      setError("Add at least one item");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order_number = `ORD-${Date.now().toString().slice(-6)}`;
      const created = await OrdersService.create({ order_number });
      if (!created) throw new Error("Failed to create order");

      // add items
      for (const it of draftItems) {
        const payload: OrderItemInput = {
          menu_item: it.menu_item,
          quantity: it.quantity,
          price: it.price.toFixed(2),
        };
        await OrdersService.addItem(created.id, payload);
      }

      // optionally set status to preparing
      // await OrdersService.setStatus(created.id, "preparing");

      const fresh = await OrdersService.retrieve(created.id);
      onCreated?.(fresh);
      onClose();
    } catch (e: any) {
      setError(e?.message || "Failed to submit order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !submitting && onClose()} />
      <div className="relative z-10 w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">New Order</h3>
          <div className="text-sm text-gray-500">Step {step} of 2</div>
        </div>

        {error && (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
        )}

        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search menu items..."
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="max-h-[420px] overflow-auto divide-y">
                {filtered.map((m) => (
                  <div key={m.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-gray-900">{m.name}</div>
                      {m.description && <div className="text-xs text-gray-500 line-clamp-2">{m.description}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-medium text-gray-900">${parseFloat(m.base_price).toFixed(2)}</div>
                      <button
                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                        onClick={() => addItem(m)}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Selected Items</div>
              <div className="max-h-[420px] overflow-auto divide-y">
                {draftItems.length === 0 && (
                  <div className="text-sm text-gray-500 py-8 text-center">No items added yet</div>
                )}
                {draftItems.map((d) => (
                  <div key={d.menu_item} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-500">${d.price.toFixed(2)} each</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded border px-2 py-1 text-xs"
                        onClick={() => decItem(d.menu_item)}
                      >
                        -
                      </button>
                      <div className="w-8 text-center text-sm">{d.quantity}</div>
                      <button
                        className="rounded border px-2 py-1 text-xs"
                        onClick={() => addItem({ id: d.menu_item } as any)}
                      >
                        +
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                        onClick={() => removeItem(d.menu_item)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-base font-semibold text-gray-900">${total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-sm text-gray-700 mb-3">Review</div>
            <div className="border rounded divide-y">
              {draftItems.map((d) => (
                <div key={d.menu_item} className="flex items-center justify-between p-3">
                  <div>
                    <div className="font-medium text-gray-900">{d.name}</div>
                    <div className="text-xs text-gray-500">{d.quantity} × ${d.price.toFixed(2)}</div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">${(d.price * d.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">Total</div>
              <div className="text-base font-semibold text-gray-900">${total.toFixed(2)}</div>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setStep(1)}
                disabled={submitting}
              >
                Back
              </button>
            )}
            {step === 1 && (
              <button
                className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={() => setStep(2)}
                disabled={draftItems.length === 0}
              >
                Next
              </button>
            )}
            {step === 2 && (
              <button
                className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                onClick={submit}
                disabled={submitting || draftItems.length === 0}
              >
                {submitting ? "Creating..." : "Create Order"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
