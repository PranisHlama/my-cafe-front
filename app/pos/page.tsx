"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/lib/services/authService";
import { UserRole } from "@/lib/types/auth";
import { MenuService, MenuItem, Category } from "@/lib/services/menuService";
import { OrdersService, OrderItemInput } from "@/lib/services/ordersService";
import { apiClient } from "@/lib/api";

type CartLine = {
  item: MenuItem;
  quantity: number;
  unitPrice: number; // parsed from base_price
};

export default function CashierPOSPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState<CartLine[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const u = AuthService.getCurrentUser();
    setUser(u);
  }, []);

  // RBAC: only CASHIER allowed. Barista/Kitchen can also use this if needed.
  const isCashierOrStaff =
    user &&
    (AuthService.hasRole(UserRole.CASHIER) ||
      AuthService.hasRole(UserRole.BARISTA) ||
      AuthService.hasRole(UserRole.KITCHEN));

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, items] = await Promise.all([
          MenuService.getCategories(),
          MenuService.getMenuItems(),
        ]);
        setCategories(cats);
        setMenuItems(items.filter((m) => m.is_available));
      } catch (e: any) {
        setError(e?.message || "Failed to load menu");
      }
    };
    if (isClient && isCashierOrStaff) {
      load();
    }
  }, [isClient, isCashierOrStaff]);

  const filteredItems = useMemo(() => {
    let list = menuItems;
    if (activeCategory !== "all") {
      list = list.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.category_name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [menuItems, activeCategory, search]);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.item.id === item.id);
      const price = parseFloat(item.base_price || "0");
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { item, quantity: 1, unitPrice: price }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => prev.filter((l) => l.item.id !== itemId));
  };

  const setQuantity = (itemId: number, qty: number) => {
    setCart((prev) =>
      prev.map((l) =>
        l.item.id === itemId ? { ...l, quantity: Math.max(1, qty) } : l
      )
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0),
    [cart]
  );
  const taxRate = 0.0; // adjust if needed
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const generateOrderNumber = () => {
    // Always keep under backend max_length=20
    const ts36 = Date.now().toString(36).toUpperCase();
    const rand = Math.floor(Math.random() * 36 * 36)
      .toString(36)
      .toUpperCase()
      .padStart(2, "0");
    return `P-${ts36}-${rand}`.slice(0, 20);
  };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    setPaymentUrl(null);
    try {
      const created = await OrdersService.create({
        order_number: generateOrderNumber(),
        customer: null,
      });
      if (!created) throw new Error("Failed to create order");

      // add items sequentially (or Promise.all)
      for (const line of cart) {
        const itemPayload: OrderItemInput = {
          menu_item: line.item.id,
          quantity: line.quantity,
          price: line.unitPrice.toFixed(2),
        };
        await OrdersService.addItem(created.id, itemPayload);
      }

      setSuccess(`Order ${created.order_number} created`);

      // Request Stripe checkout session URL
      try {
        const origin =
          typeof window !== "undefined" ? window.location.origin : "";
        const res = await apiClient.post<{ url: string }>(
          "/api/payments/create-checkout-session/",
          {
            order_id: created.id,
            success_url: `${origin}/orders`,
            cancel_url: `${origin}/pos`,
          }
        );
        if (!res.error && res.data?.url) {
          setPaymentUrl(res.data.url);
          setShowPaymentModal(true);
        } else {
          // Fallback: still navigate to orders if payment link creation fails
          setError(res.error || "Failed to initialize payment session");
        }
      } catch (e: any) {
        setError(e?.message || "Failed to initialize payment session");
      }

      clearCart();
    } catch (e: any) {
      setError(e?.message || "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isClient) {
    return (
      <div className="p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isCashierOrStaff) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Only cashiers/staff can access the POS.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Point of Sale
        </h1>
        <p className="text-gray-600 mt-1">Create and manage customer orders</p>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded border border-green-200 bg-green-50 p-2 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Menu */}
        <div className="lg:col-span-2">
          <div className="flex gap-3 mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu..."
              className="flex-1 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <select
              value={activeCategory === "all" ? "all" : String(activeCategory)}
              onChange={(e) =>
                setActiveCategory(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="w-52 rounded border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((mi) => (
              <button
                key={mi.id}
                onClick={() => addToCart(mi)}
                className="group relative rounded-lg border border-gray-200 bg-white p-3 text-left hover:shadow"
              >
                {mi.image_url && (
                  <img
                    src={mi.image_url}
                    alt={mi.name}
                    className="mb-2 h-28 w-full rounded object-cover"
                  />
                )}
                <div className="font-medium text-gray-900 group-hover:text-blue-700">
                  {mi.name}
                </div>
                <div className="text-sm text-gray-600">{mi.category_name}</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">
                  ₹{parseFloat(mi.base_price).toFixed(2)}
                </div>
                {!mi.is_available && (
                  <div className="absolute right-2 top-2 rounded bg-gray-700 px-2 py-0.5 text-xs text-white">
                    Unavailable
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Cart */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white">
            <div className="border-b px-4 py-3">
              <div className="text-lg font-semibold text-gray-900">Cart</div>
            </div>
            <div className="max-h-[60vh] overflow-auto px-4 py-3">
              {cart.length === 0 ? (
                <div className="text-sm text-gray-600">No items added.</div>
              ) : (
                <div className="space-y-3">
                  {cart.map((line) => (
                    <div
                      key={line.item.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-medium text-gray-900">
                          {line.item.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          ₹{line.unitPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          className="h-8 w-8 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() =>
                            setQuantity(line.item.id, line.quantity - 1)
                          }
                          aria-label="decrease"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={line.quantity}
                          onChange={(e) =>
                            setQuantity(
                              line.item.id,
                              Number(e.target.value || 1)
                            )
                          }
                          className="h-8 w-14 rounded border border-gray-300 px-2 text-center"
                        />
                        <button
                          className="h-8 w-8 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                          onClick={() =>
                            setQuantity(line.item.id, line.quantity + 1)
                          }
                          aria-label="increase"
                        >
                          +
                        </button>
                        <button
                          className="rounded border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                          onClick={() => removeFromCart(line.item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t px-4 py-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700">
                <span>Tax</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  className="flex-1 rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  onClick={clearCart}
                  disabled={cart.length === 0 || submitting}
                >
                  Clear
                </button>
                <button
                  className="flex-1 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                  onClick={placeOrder}
                  disabled={cart.length === 0 || submitting}
                >
                  {submitting ? "Placing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && paymentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPaymentModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Scan to Pay
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Use your phone to scan and complete payment.
            </p>
            <div className="flex items-center justify-center mb-4">
              <img
                alt="Payment QR"
                className="h-56 w-56"
                src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(
                  paymentUrl
                )}&size=300x300`}
              />
            </div>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 mb-2"
            >
              Open Payment Link
            </a>
            <button
              onClick={() => {
                setShowPaymentModal(false);
                router.push("/orders");
              }}
              className="block w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
