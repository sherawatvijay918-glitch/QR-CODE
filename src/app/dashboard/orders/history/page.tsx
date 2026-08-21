"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { Order, OrderStatus } from "@/lib/types";
import { FiInfo, FiX, FiSearch, FiPrinter, FiEye } from "react-icons/fi";

const STATUS_FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All Status" },
  { id: "pending", label: "Pending" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "delivered", label: "Delivered (Settled)" },
];

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");

  // Tab 1: All Orders vs Tab 2: Current Orders (Today)
  const [historyTab, setHistoryTab] = useState<"all" | "today">("all");

  // Drawer / Settle States
  const [selectedOrderForBilling, setSelectedOrderForBilling] = useState<Order | null>(null);
  const [applyGst, setApplyGst] = useState(true);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = new BroadcastChannel("hotel_orders_channel");
    channel.onmessage = () => {
      fetchOrders();
    };

    return () => {
      channel.close();
    };
  }, []);

  // Sync current billing order details with fresh database fetch
  useEffect(() => {
    if (selectedOrderForBilling) {
      const refreshed = orders.find((o) => o.id === selectedOrderForBilling.id);
      if (refreshed) {
        setSelectedOrderForBilling(refreshed);
      }
    }
  }, [orders, selectedOrderForBilling]);

  // Billing & Tax Calculations
  const subtotal = selectedOrderForBilling ? selectedOrderForBilling.items.reduce((s, i) => s + (i.price * i.qty), 0) : 0;
  const discount = selectedOrderForBilling ? Number(selectedOrderForBilling.discount || 0) : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const cgst = applyGst ? Math.round(taxableAmount * 0.025) : 0; // 2.5% CGST
  const sgst = applyGst ? Math.round(taxableAmount * 0.025) : 0; // 2.5% SGST
  const grandTotal = taxableAmount + cgst + sgst;

  const handleModifyActiveOrderQty = async (itemId: string, delta: number) => {
    if (!selectedOrderForBilling) return;

    const updatedItems = selectedOrderForBilling.items.map((i) => {
      if (i.id === itemId) {
        return { ...i, qty: i.qty + delta };
      }
      return i;
    }).filter((i) => i.qty > 0);

    const newSubtotal = updatedItems.reduce((s, i) => s + (i.price * i.qty), 0);
    const newTotal = Math.max(0, newSubtotal - discount) * (applyGst ? 1.05 : 1.0); // Simple grand total approximation

    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForBilling.id,
          items: updatedItems,
          total: Math.round(newTotal),
          discount: discount
        }),
      });

      await fetchOrders();
      // Broadcast changes
      const channel = new BroadcastChannel("hotel_orders_channel");
      channel.postMessage("order_items_updated");
      channel.close();
    } catch (err) {
      console.error("Failed to add new dish to active order:", err);
    }
  };

  const handleSettleAndPrintBill = async () => {
    if (!selectedOrderForBilling) return;

    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForBilling.id,
          status: "delivered",
          total: grandTotal,
          discount: discount
        }),
      });

      // Launch printer
      window.print();

      await fetchOrders();
      setSelectedOrderForBilling(null);
      triggerToast(`Order ${selectedOrderForBilling.id} settled successfully!`);

      // Broadcast changes
      const channel = new BroadcastChannel("hotel_orders_channel");
      channel.postMessage("order_settled_sync");
      channel.close();
    } catch (err) {
      triggerToast("Failed to settle bill");
    }
  };

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Filter orders by All vs Today
  const tabFilteredOrders = orders.filter((o) => {
    if (historyTab === "today") {
      return isToday(o.placedAt);
    }
    return true;
  });

  // Filter orders by Search and Status
  const filteredOrders = tabFilteredOrders
    .filter((o) => {
      if (statusFilter === "all") return true;
      return o.status === statusFilter;
    })
    .filter((o) => {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.sourceLabel.toLowerCase().includes(q) ||
        o.sourceType.toLowerCase().includes(q) ||
        o.items.some((i) => i.name.toLowerCase().includes(q))
      );
    });

  return (
    <>
      <Topbar title="Orders History Ledger" />
      <main className="flex-1 space-y-8 p-8 md:p-10 max-w-6xl">
        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-8 text-white rounded-lg px-5 py-3 text-[13px] font-medium shadow-lg animate-float flex items-center gap-2 z-50 bg-primary">
            <FiInfo size={15} />
            {toast}
          </div>
        )}

        {/* Top-Level Selector: All Orders vs Current Orders (Today) */}
        <div className="flex border-b gap-8 pb-1 shrink-0" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={() => setHistoryTab("all")}
            className="pb-2.5 text-[13px] font-extrabold uppercase transition-all relative cursor-pointer flex items-center gap-2"
            style={{
              color: historyTab === "all" ? "var(--foreground)" : "var(--muted)"
            }}
          >
            <span>📜</span>
            <span>All Orders ({orders.length})</span>
            {historyTab === "all" && (
              <div className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-red-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setHistoryTab("today")}
            className="pb-2.5 text-[13px] font-extrabold uppercase transition-all relative cursor-pointer flex items-center gap-2"
            style={{
              color: historyTab === "today" ? "var(--foreground)" : "var(--muted)"
            }}
          >
            <span>🛎️</span>
            <span>Current Orders (Today - {orders.filter(o => isToday(o.placedAt)).length})</span>
            {historyTab === "today" && (
              <div className="absolute bottom-0 inset-x-0 h-[2.5px] rounded-full bg-red-600" />
            )}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-[17px] font-bold text-foreground">
              {historyTab === "all" ? "Total Orders Ledger Log" : "Today's Active Orders Ledger"}
            </h2>
            <p className="text-[13px] text-muted mt-1">Audit, details review, and re-print slips for all past restaurant orders.</p>
          </div>
        </div>

        {/* Filters and Search row */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-surface p-4 rounded-2xl border border-border shrink-0">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((f) => {
              const active = statusFilter === f.id;
              const count = tabFilteredOrders.filter(o => f.id === "all" ? true : o.status === f.id).length;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setStatusFilter(f.id)}
                  className={`rounded-lg border px-3.5 py-1.5 text-[12px] font-bold transition-all hover:scale-[1.01] hover:shadow-md active:scale-[0.99] cursor-pointer border-border/40 ${
                    active
                      ? "bg-primary text-white shadow-md border-primary/40"
                      : "bg-transparent text-muted hover:text-primary hover:bg-primary/10 border-transparent"
                  }`}
                >
                  {f.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by ID, Table, Room, or Dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary/20 font-semibold"
              style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}
            />
            <FiSearch className="absolute left-3 top-2.5 text-muted text-xs" />
          </div>
        </div>

        {/* History Table */}
        {isLoading ? (
          <div className="text-center py-12 text-xs font-bold rounded-3xl border animate-pulse" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}>
            Loading all historical ledger entries from MySQL...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border text-muted text-xs font-bold bg-surface" style={{ borderColor: "var(--border)" }}>
            No orders found matching this filter query.
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border bg-surface animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b bg-surface-inset/50 font-bold text-muted" style={{ borderColor: "var(--border)" }}>
                    <th className="p-4">Order ID</th>
                    <th className="p-4">Date & Time</th>
                    <th className="p-4">Origin / Label</th>
                    <th className="p-4">Dishes Ordered</th>
                    <th className="p-4 text-right">Bill Amount</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border" style={{ borderColor: "var(--border)" }}>
                  {filteredOrders.map((order) => {
                    const itemsLabel = order.items.map(i => `${i.qty}x ${i.name}`).join(", ");
                    return (
                      <tr key={order.id} className="hover:bg-surface-inset/20 transition-all">
                        <td className="p-4 font-mono font-bold text-foreground">{order.id}</td>
                        <td className="p-4 text-muted">{formatDate(order.placedAt)}</td>
                        <td className="p-4 font-bold">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            order.sourceType === "room" ? "bg-blue-500/10 text-blue-600" :
                            order.sourceType === "table" ? "bg-amber-500/10 text-amber-600" :
                            "bg-purple-500/10 text-purple-600"
                          }`}>
                            {order.sourceLabel}
                          </span>
                        </td>
                        <td className="p-4 max-w-[240px] truncate text-muted" title={itemsLabel}>
                          {itemsLabel}
                        </td>
                        <td className="p-4 text-right font-mono font-extrabold text-foreground">₹{Number(order.total).toFixed(0)}</td>
                        <td className="p-4 text-center">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="p-4 text-center">
                          <button
                            type="button"
                            onClick={() => setSelectedOrderForBilling(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-all hover:bg-primary/5 active:scale-95 text-primary border-primary/20 bg-surface"
                          >
                            <FiEye size={12} />
                            <span>Details</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Drawer: POS Checkout & Settle Overlay */}
        {selectedOrderForBilling && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/60 backdrop-blur-md p-4 animate-fade-in">
            <div
              className="w-full max-w-md h-full rounded-3xl p-6 shadow-2xl border flex flex-col justify-between overflow-hidden"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>POS Checkout & Settle</h3>
                <button
                  type="button"
                  onClick={() => setSelectedOrderForBilling(null)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  style={{ color: "var(--muted)" }}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Scrollable Drawer Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
                <div className="rounded-2xl p-5 border space-y-4 font-medium text-xs" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <div className="flex flex-col items-center text-center border-b border-dashed pb-3 space-y-1" style={{ borderColor: "var(--border)" }}>
                    <h4 className="font-extrabold uppercase font-mono tracking-widest" style={{ color: "var(--foreground)" }}>Invoice Slip</h4>
                    <p className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>{selectedOrderForBilling.id}</p>
                    <span className="rounded-xl font-bold px-2.5 py-1 text-[10px] border mt-2 uppercase tracking-wide bg-surface border-primary/20 text-primary">
                      {selectedOrderForBilling.sourceLabel}
                    </span>
                  </div>

                  {/* Items loop */}
                  <div className="divide-y divide-dashed max-h-[160px] overflow-y-auto pr-1 scrollbar-thin" style={{ borderColor: "var(--border)" }}>
                    {selectedOrderForBilling.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2.5">
                        <div className="min-w-0 flex-1 pr-2">
                          <span className="font-bold text-[11px] truncate block" style={{ color: "var(--foreground)" }}>{i.name}</span>
                          <span className="text-[10px] font-mono" style={{ color: "var(--muted)" }}>₹{i.price} each</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {selectedOrderForBilling.status !== "delivered" ? (
                            <div className="flex items-center gap-1.5 border rounded-lg p-0.5 shadow-sm" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
                              <button
                                type="button"
                                onClick={() => handleModifyActiveOrderQty(i.id, -1)}
                                className="h-4.5 w-4.5 rounded text-slate-500 font-bold flex items-center justify-center cursor-pointer text-xs"
                                style={{ color: "var(--muted)" }}
                              >
                                -
                              </button>
                              <span className="text-[10px] font-extrabold font-mono px-0.5 select-none" style={{ color: "var(--foreground)" }}>{i.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleModifyActiveOrderQty(i.id, 1)}
                                className="h-4.5 w-4.5 rounded text-slate-500 font-bold flex items-center justify-center cursor-pointer text-xs"
                                style={{ color: "var(--muted)" }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <span className="font-mono font-extrabold text-[11px] w-12 text-right" style={{ color: "var(--foreground)" }}>{i.qty}x</span>
                          )}
                          <span className="font-mono font-bold text-[11px] w-12 text-right" style={{ color: "var(--foreground)" }}>
                            ₹{i.price * i.qty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Details */}
                  <div className="border-t pt-3.5 space-y-2" style={{ borderColor: "var(--border)", color: "var(--muted)" }}>
                    <div className="flex justify-between font-semibold">
                      <span>Subtotal</span>
                      <span className="font-mono" style={{ color: "var(--foreground)" }}>₹{subtotal}</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between font-bold" style={{ color: "var(--status-ready)" }}>
                        <span>Promo Discount ({selectedOrderForBilling.couponCode})</span>
                        <span className="font-mono">-₹{discount}</span>
                      </div>
                    )}

                    {applyGst ? (
                      <>
                        <div className="flex justify-between text-[11px]">
                          <span>CGST (2.5%)</span>
                          <span className="font-mono" style={{ color: "var(--foreground)" }}>₹{cgst}</span>
                        </div>

                        <div className="flex justify-between text-[11px] pb-1">
                          <span>SGST (2.5%)</span>
                          <span className="font-mono" style={{ color: "var(--foreground)" }}>₹{sgst}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-[10px] text-amber-500 font-semibold">Taxes not applied (GST Off)</div>
                    )}

                    <div className="flex justify-between border-t border-dashed pt-2.5 font-extrabold text-[13px]" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      <span>Grand Total</span>
                      <span className="font-mono">₹{grandTotal}</span>
                    </div>
                  </div>
                </div>

                {/* GST Toggle checkbox */}
                {selectedOrderForBilling.status !== "delivered" && (
                  <label className="flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer select-none" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}>
                    <input
                      type="checkbox"
                      checked={applyGst}
                      onChange={(e) => setApplyGst(e.target.checked)}
                      className="h-4 w-4 rounded border cursor-pointer"
                    />
                    <div className="text-left">
                      <span className="text-[11px] font-bold block" style={{ color: "var(--foreground)" }}>Apply 5% GST (2.5% CGST + 2.5% SGST)</span>
                      <span className="text-[9px] font-semibold text-muted block mt-0.5">Toggle tax calculations dynamically on final settlement receipt</span>
                    </div>
                  </label>
                )}
              </div>

              {/* Actions Footer */}
              <div className="border-t pt-3.5 space-y-3 shrink-0" style={{ borderColor: "var(--border)" }}>
                {selectedOrderForBilling.status !== "delivered" ? (
                  <button
                    type="button"
                    onClick={handleSettleAndPrintBill}
                    className="w-full flex items-center justify-center py-3.5 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    Settle & Print Invoice
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center py-3.5 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    style={{ backgroundColor: "var(--foreground)", color: "var(--surface)" }}
                  >
                    Re-Print Receipt Slip
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
