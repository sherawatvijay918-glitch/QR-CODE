"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import VegDot from "@/components/VegDot";
import KpiCard from "@/components/KpiCard";
import { Order, OrderStatus, Room, RestaurantTable, MenuCategory } from "@/lib/types";
import { menuItems, rooms, tables, categories } from "@/lib/dummy-data";
import {
  FiMessageSquare, FiPrinter, FiCheck, FiPlus, FiInfo, FiCreditCard, FiX, FiTag, FiEye, FiPlusCircle
} from "react-icons/fi";

const FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "All Status" },
  { id: "pending", label: "Pending" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready" },
  { id: "delivered", label: "Delivered (Settled)" },
];

function timeAgo(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
}

export default function OrdersPage() {
  const [sourceTypeTab, setSourceTypeTab] = useState<"room" | "table">("room");
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState("");

  // Dynamic Floor Board lists
  const [localRooms, setLocalRooms] = useState<Room[]>(rooms);
  const [localTables, setLocalTables] = useState<RestaurantTable[]>(tables);

  // Add Table/Room Modal States
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [newSourceType, setNewSourceType] = useState<"room" | "table">("table");
  const [newSourceNumber, setNewSourceNumber] = useState("");
  const [newSourceCapacity, setNewSourceCapacity] = useState("4");

  // Menu Search & Dynamic Categories States
  const [localCategories, setLocalCategories] = useState<MenuCategory[]>(categories);
  const [menuSearchQuery, setMenuSearchQuery] = useState("");

  // Settlement Drawer States
  const [selectedOrderForBilling, setSelectedOrderForBilling] = useState<Order | null>(null);
  const [paymentMode, setPaymentMode] = useState<"cash" | "upi" | "card">("cash");
  const [applyGst, setApplyGst] = useState(true);

  // Create POS Order Modal States
  const [isPosModalOpen, setIsPosModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [activeMenuCategory, setActiveMenuCategory] = useState<string>("all");
  const [posSourceType, setPosSourceType] = useState<"room" | "table" | "pos">("table");
  const [posSourceId, setPosSourceId] = useState("t1");
  const [posCart, setPosCart] = useState<Record<string, number>>({});
  const [posInstructions, setPosInstructions] = useState("");
  const [activePosCategory, setActivePosCategory] = useState<string>("all");
  const [posSearchQuery, setPosSearchQuery] = useState("");
  const [posShortCode, setPosShortCode] = useState("");
  const [posPaymentMode, setPosPaymentMode] = useState<"not_paid" | "upi" | "cash" | "card">("not_paid");
  const [posGuestName, setPosGuestName] = useState("");
  const [posGuestCount, setPosGuestCount] = useState("1");


  useEffect(() => {
    if (isPosModalOpen) {
      setPosCart({});
      setPosInstructions("");
      setActivePosCategory("all");
      setPosSearchQuery("");
      setPosShortCode("");
      setPosPaymentMode("not_paid");
      setPosGuestName("");
      setPosGuestCount("1");
      if (posSourceType === "table" && localTables.length > 0) {
        setPosSourceId(localTables[0].id);
      } else if (posSourceType === "room" && localRooms.length > 0) {
        setPosSourceId(localRooms[0].id);
      }
    }
  }, [isPosModalOpen]);

  const posCartItemsArray = Object.entries(posCart);
  const posCalculatedTotal = posCartItemsArray.reduce((sum, [itemId, qty]) => {
    const item = menuItems.find(m => m.id === itemId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceNumber.trim()) return;

    if (newSourceType === "room") {
      const newRoomItem: Room = {
        id: `r_${Date.now()}`,
        number: newSourceNumber,
        floor: Number(newSourceCapacity) || 1,
        status: "vacant",
        qrCode: `QR-ROOM-${newSourceNumber}`,
        ordersToday: 0,
      };
      setLocalRooms((prev) => [...prev, newRoomItem]);
      triggerToast(`Room #${newSourceNumber} added successfully to Floor Board!`);
    } else {
      const newTableItem: RestaurantTable = {
        id: `t_${Date.now()}`,
        number: `Table ${newSourceNumber}`,
        seats: Number(newSourceCapacity) || 4,
        status: "vacant",
        qrCode: `QR-TABLE-${newSourceNumber}`,
        ordersToday: 0,
      };
      setLocalTables((prev) => [...prev, newTableItem]);
      triggerToast(`Table ${newSourceNumber} added successfully to Floor Board!`);
    }

    setNewSourceNumber("");
    setIsAddSourceModalOpen(false);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders:", err);
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

  // Check for trigger queries to auto-open POS KOT Modal
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("openKot") === "true") {
        setIsPosModalOpen(true);
        // Clean URL to prevent repeated trigger on re-render/refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const handleOpenPosModalEvent = () => setIsPosModalOpen(true);
      window.addEventListener("open-pos-modal", handleOpenPosModalEvent);
      return () => {
        window.removeEventListener("open-pos-modal", handleOpenPosModalEvent);
      };
    }
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

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const todayOrders = orders.filter(o => isToday(o.placedAt));

  // Dual-Layer Filters: First by source type, then by status
  const sourceFiltered = todayOrders.filter((o) => o.sourceType === sourceTypeTab);
  const filtered = filter === "all" ? sourceFiltered : sourceFiltered.filter((o) => o.status === filter);

  // Billing & Tax Calculations
  const subtotal = selectedOrderForBilling ? selectedOrderForBilling.items.reduce((s, i) => s + (i.price * i.qty), 0) : 0;
  const discount = selectedOrderForBilling ? Number(selectedOrderForBilling.discount || 0) : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const cgst = applyGst ? Math.round(taxableAmount * 0.025) : 0; // 2.5% CGST
  const sgst = applyGst ? Math.round(taxableAmount * 0.025) : 0; // 2.5% SGST
  const grandTotal = taxableAmount + cgst + sgst;

  // Manual POS Cart actions
  const handleUpdatePosQty = (itemId: string, delta: number) => {
    setPosCart((prev) => {
      const next = { ...prev };
      const curr = next[itemId] || 0;
      const updated = curr + delta;
      if (updated <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = updated;
      }
      return next;
    });
  };

  const handleModifyActiveOrderQty = async (itemId: string, delta: number) => {
    if (!selectedOrderForBilling) return;

    const updatedItems = selectedOrderForBilling.items.map((i) => {
      if (i.id === itemId) {
        return { ...i, qty: i.qty + delta };
      }
      return i;
    }).filter((i) => i.qty > 0);

    // Compute subtotal
    const newSubtotal = updatedItems.reduce((s, i) => s + (i.price * i.qty), 0);

    // Re-evaluate coupon discount
    let newDiscount = 0;
    if (selectedOrderForBilling.couponCode) {
      const codeObj = selectedOrderForBilling.couponCode.toUpperCase();
      if (codeObj === "VEGPANIER" || codeObj.includes("VEG")) {
        newDiscount = Math.min(100, Math.round(newSubtotal * 0.2));
      } else if (codeObj === "PANEER50") {
        const paneer = updatedItems.find(i => i.name.includes("Paneer"));
        if (paneer) {
          newDiscount = Math.round(paneer.price * paneer.qty * 0.5);
        }
      }
    }

    const newTotal = Math.max(0, newSubtotal - newDiscount);

    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForBilling.id,
          items: updatedItems,
          total: newTotal,
          discount: newDiscount
        }),
      });

      await fetchOrders();
      triggerToast("Order items updated!");

      const channel = new BroadcastChannel("hotel_orders_channel");
      channel.postMessage("order_items_updated");
      channel.close();
    } catch (err) {
      console.error("Failed to update active order item quantities:", err);
    }
  };

  const handleAddDishToActiveOrder = async (dishId: string) => {
    if (!selectedOrderForBilling) return;

    const item = menuItems.find(m => m.id === dishId);
    if (!item) return;

    const exists = selectedOrderForBilling.items.find(i => i.id === dishId);
    let updatedItems = [];

    if (exists) {
      updatedItems = selectedOrderForBilling.items.map(i => {
        if (i.id === dishId) {
          return { ...i, qty: i.qty + 1 };
        }
        return i;
      });
    } else {
      updatedItems = [
        ...selectedOrderForBilling.items,
        {
          id: item.id,
          name: item.name,
          qty: 1,
          price: item.price,
          veg: true
        }
      ];
    }

    // Compute subtot
    const newSubtotal = updatedItems.reduce((s, i) => s + (i.price * i.qty), 0);

    // Re-evaluate coupon discount
    let newDiscount = 0;
    if (selectedOrderForBilling.couponCode) {
      const codeObj = selectedOrderForBilling.couponCode.toUpperCase();
      if (codeObj === "VEGPANIER" || codeObj.includes("VEG")) {
        newDiscount = Math.min(100, Math.round(newSubtotal * 0.2));
      } else if (codeObj === "PANEER50") {
        const paneer = updatedItems.find(i => i.name.includes("Paneer"));
        if (paneer) {
          newDiscount = Math.round(paneer.price * paneer.qty * 0.5);
        }
      }
    }

    const newTotal = Math.max(0, newSubtotal - newDiscount);

    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedOrderForBilling.id,
          items: updatedItems,
          total: newTotal,
          discount: newDiscount
        }),
      });

      await fetchOrders();
      triggerToast(`Added ${item.name} to order!`);

      const channel = new BroadcastChannel("hotel_orders_channel");
      channel.postMessage("order_items_updated");
      channel.close();
    } catch (err) {
      console.error("Failed to add new dish to active order:", err);
    }
  };

  const handleCreatePosOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const cartItems = Object.entries(posCart);
    if (cartItems.length === 0) {
      triggerToast("Please add items to the cart first!");
      return;
    }

    let label = "POS Walk-in";
    if (posSourceType === "room") {
      const room = localRooms.find(r => r.id === posSourceId);
      label = room ? `Room ${room.number}` : "Room service";
    } else if (posSourceType === "table") {
      const table = localTables.find(t => t.id === posSourceId);
      label = table ? table.number : "Dining Table";
    } else if (posSourceType === "pos") {
      label = posGuestName.trim() ? `POS — ${posGuestName}` : "POS Walk-in";
    }

    const generatedId = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderItems = cartItems.map(([itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId)!;
      return {
        id: item.id,
        name: item.name,
        qty,
        price: item.price,
        veg: item.veg,
      };
    });

    const calculatedTotal = orderItems.reduce((sum, i) => sum + (i.price * i.qty), 0);
    const orderStatus = posPaymentMode === "not_paid" ? "ready" : "delivered";

    const newOrder: Order = {
      id: generatedId,
      sourceType: posSourceType,
      sourceLabel: label,
      items: orderItems,
      instructions: posInstructions || undefined,
      status: orderStatus,
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      total: calculatedTotal,
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      await fetchOrders();
      setIsPosModalOpen(false);
      setPosCart({});
      setPosInstructions("");

      // Broadcast changes
      const channel = new BroadcastChannel("hotel_orders_channel");
      channel.postMessage("new_order_placed");
      channel.close();

      if (posPaymentMode === "not_paid") {
        setSelectedOrderForBilling(newOrder); // Open invoice desk directly for new POS entry
        triggerToast(`POS Order ${generatedId} created!`);
      } else {
        // Trigger quick print and show alert
        setSelectedOrderForBilling(newOrder);
        triggerToast(`POS Order ${generatedId} settled via ${posPaymentMode.toUpperCase()}!`);
        setTimeout(() => {
          window.print();
          setSelectedOrderForBilling(null);
        }, 300);
      }
    } catch (err) {
      triggerToast("Failed to create POS order");
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

  const getStatusColors = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return { border: "border-l-[var(--status-preparing)]", text: "text-[var(--status-preparing)]", bg: "bg-[var(--status-preparing-bg)]" };
      case "preparing":
        return { border: "border-l-[var(--status-ready)]", text: "text-[var(--status-ready)]", bg: "bg-[var(--status-ready-bg)]" };
      case "ready":
        return { border: "border-l-[var(--status-delivered)]", text: "text-[var(--status-delivered)]", bg: "bg-[var(--status-delivered-bg)]" };
      case "delivered":
        return { border: "border-l-[var(--status-pending)]", text: "text-[var(--status-pending)]", bg: "bg-[var(--status-pending-bg)]" };
      default:
        return { border: "border-l-[var(--border)]", text: "text-[var(--muted)]", bg: "bg-[var(--surface-inset)]" };
    }
  };



  return (
    <>
      <Topbar title="QR Orders" />
      <main className="flex-1 space-y-10 p-8 md:p-10 max-w-6xl">

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-20 right-8 text-white rounded-lg px-5 py-3 text-[13px] font-medium shadow-lg animate-float flex items-center gap-2 z-50 bg-primary">
            <FiInfo size={15} />
            {toast}
          </div>
        )}

        {/* POS Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-[17px] font-bold text-foreground">QR Code Orders Desk</h2>
                <p className="text-[13px] text-muted mt-1">Track room and table kitchen tickets generated via guest QR code scans.</p>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setIsAddSourceModalOpen(true)}
                  className="rounded-lg border px-4 py-2 text-[13px] font-medium transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] cursor-pointer bg-surface border-primary/20 text-primary hover:bg-primary/5"
                >
                  Add Table/Room
                </button>

                <button
                  type="button"
                  onClick={() => setIsPosModalOpen(true)}
                  className="rounded-lg text-white px-4 py-2 bg-primary hover:bg-primary/90 active:scale-[0.98] text-[13px] font-medium transition-all cursor-pointer hover:shadow-lg"
                >
                  New POS Order
                </button>
              </div>
            </div>

            {/* Main Source Type Tabs */}
            <div className="flex border-b gap-6" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={() => {
                  setSourceTypeTab("room");
                  setFilter("all");
                }}
                className="pb-3 text-[13px] font-semibold tracking-wider uppercase font-mono transition-all relative cursor-pointer"
                style={{
                  color: sourceTypeTab === "room" ? "var(--primary)" : "var(--muted)"
                }}
              >
                Room Service Orders
                {sourceTypeTab === "room" && (
                  <div className="absolute bottom-0 inset-x-0 h-[2px] rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceTypeTab("table");
                  setFilter("all");
                }}
                className="pb-3 text-[13px] font-semibold tracking-wider uppercase font-mono transition-all relative cursor-pointer"
                style={{
                  color: sourceTypeTab === "table" ? "var(--primary)" : "var(--muted)"
                }}
              >
                Dining Table Orders
                {sourceTypeTab === "table" && (
                  <div className="absolute bottom-0 inset-x-0 h-[2px] rounded-full" style={{ backgroundColor: "var(--primary)" }} />
                )}
              </button>
            </div>

            {/* Sub-Filters: Order status tags */}
            <div className="flex flex-wrap gap-1 pt-1">
              {FILTERS.map((f) => {
                const active = filter === f.id;
                const count = sourceFiltered.filter(o => f.id === "all" ? true : o.status === f.id).length;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilter(f.id)}
                    className={`rounded-lg border px-3.5 py-1.5 text-[13px] font-medium transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] cursor-pointer border-border/40 ${
                      active
                        ? "bg-primary text-white shadow-lg border-primary/40"
                        : "bg-transparent text-muted hover:text-primary hover:bg-primary/10 border-transparent"
                    }`}
                  >
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-xs font-bold rounded-3xl border animate-pulse" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}>
                Loading floor layout from MySQL database...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {(sourceTypeTab === "room" ? localRooms : localTables)
                  .filter((item) => {
                    const matchLabel = sourceTypeTab === "room" ? `Room ${item.number}` : item.number;
                    const activeOrder = todayOrders.find(
                      (o) =>
                        o.status !== "delivered" &&
                        o.sourceType === sourceTypeTab &&
                        o.sourceLabel === matchLabel
                    );
                    if (filter === "all") return true;
                    return activeOrder?.status === filter;
                  })
                  .map((item) => {
                    // Find active order matching room/table label
                    const matchLabel = sourceTypeTab === "room" ? `Room ${item.number}` : item.number;
                    const activeOrder = todayOrders.find(
                      (o) =>
                        o.status !== "delivered" &&
                        o.sourceType === sourceTypeTab &&
                        o.sourceLabel === matchLabel
                    );

                    if (activeOrder) {
                      const statusCol = getStatusColors(activeOrder.status);
                      const totalItems = activeOrder.items.reduce((sum, i) => sum + i.qty, 0);

                      return (
                        <div
                          key={item.id}
                          className="ticket-perforated p-6 border-l-4 hover:shadow-lg hover:-translate-y-[-2px] transition-all duration-300 flex flex-col justify-between gap-4 bg-surface"
                          style={{
                            borderColor: "var(--border)",
                            borderLeftColor: statusCol.border
                          }}
                        >
                          {/* Top: Header block */}
                          <div className="flex items-start justify-between min-w-0 pb-2.5 border-b border-dashed" style={{ borderColor: "var(--border)" }}>
                            <div className="min-w-0">
                              <span className="text-[13px] font-semibold uppercase tracking-wider block font-mono text-foreground">
                                {sourceTypeTab === "room" ? `Room #${item.number}` : item.number}
                              </span>
                              <span className="text-[11px] font-mono block mt-0.5 text-muted">
                                ID: {activeOrder.id}
                              </span>
                            </div>
                            <span
                              className="rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide border shrink-0"
                              style={{
                                backgroundColor: statusCol.bg,
                                color: statusCol.text,
                                borderColor: "transparent"
                              }}
                            >
                              {activeOrder.status}
                            </span>
                          </div>

                          {/* Mid: Stats Summary pill */}
                          <div className="flex items-center justify-between text-[13px] rounded-lg p-2.5 border bg-surface/50">
                            <span className="font-semibold text-muted">{totalItems} items</span>
                            <span className="font-mono font-semibold text-foreground">
                              ₹{Number(activeOrder.total).toFixed(0)}
                            </span>
                          </div>

                          {/* Bottom: Action Grid */}
                          <div className="grid grid-cols-2 gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderForBilling(activeOrder);
                              }}
                              title="Settle & Print invoice copy"
                              className="h-8 rounded-lg text-white flex items-center justify-center text-[11px] font-medium transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] cursor-pointer w-full bg-primary hover:bg-primary/90"
                            >
                              Settle
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderForBilling(activeOrder);
                                setActiveMenuCategory("all");
                                setIsMenuModalOpen(true);
                              }}
                              title="Append KOT items"
                              className="h-8 rounded-lg border flex items-center justify-center text-[11px] font-medium transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] cursor-pointer w-full bg-surface border-primary/20 text-primary hover:bg-primary/10"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      );
                    }

                    // Vacant Room / Table Grid Block
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-dashed p-6 flex flex-col justify-between gap-4 transition-all hover:scale-[1.01] duration-200 hover:border-primary/30 dark:hover:border-primary/40 bg-surface"
                        style={{
                          borderColor: "var(--border)"
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-semibold text-foreground uppercase tracking-widest block font-mono">
                              {sourceTypeTab === "room" ? "Guest Room" : "Dining Table"}
                            </span>
                            <h4 className="font-bold text-[13px] mt-0.5 text-foreground">
                              {sourceTypeTab === "room" ? `Room ${item.number}` : item.number}
                            </h4>
                          </div>
                          <span
                            className="rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide border border-primary/20 bg-primary/10 text-primary"
                          >
                            Vacant
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPosSourceType(sourceTypeTab);
                            setPosSourceId(item.id);
                            setPosCart({});
                            setPosInstructions("");
                            setIsPosModalOpen(true);
                          }}
                          className="w-full h-8 rounded-lg border border-dashed flex items-center justify-center text-[11px] font-medium transition-all cursor-pointer bg-transparent border-primary/20 text-primary hover:bg-primary/10"
                        >
                          POS Order
                        </button>
                      </div>
                    );
                  })}
              </div>
            )}

        {selectedOrderForBilling && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/60 backdrop-blur-md p-4">
            <div
              className="w-full max-w-md h-full rounded-3xl p-6 shadow-2xl border flex flex-col justify-between overflow-hidden"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >

              {/* Drawer Header (Fixed at top) */}
              <div className="flex items-center justify-between pb-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>POS Checkout & Settle</h3>
                <button
                  onClick={() => setSelectedOrderForBilling(null)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-inset)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Scrollable Drawer Body */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
                {/* Receipt template wrapper */}
                <div className="rounded-2xl p-5 border space-y-4 font-medium text-xs" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}>
                  <div className="flex flex-col items-center text-center border-b border-dashed pb-3 space-y-1" style={{ borderColor: "var(--border)" }}>
                    <h4 className="font-extrabold uppercase font-mono tracking-widest" style={{ color: "var(--foreground)" }}>Invoice Slip</h4>
                    <p className="font-mono text-[10px]" style={{ color: "var(--muted)" }}>{selectedOrderForBilling.id}</p>
                    <span className="rounded-xl font-bold px-2.5 py-1 text-[10px] border mt-2 uppercase tracking-wide bg-surface border-primary/20 text-primary">
                      {selectedOrderForBilling.sourceLabel}
                    </span>
                  </div>

                  {/* Items loop with scroll limit and clean receipt layout */}
                  <div className="divide-y divide-dashed max-h-[160px] overflow-y-auto pr-1 scrollbar-thin" style={{ borderColor: "var(--border)" }}>
                    {selectedOrderForBilling.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2.5 animate-fade-in">
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
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-inset)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                              >
                                -
                              </button>
                              <span className="text-[10px] font-extrabold font-mono px-0.5 select-none" style={{ color: "var(--foreground)" }}>{i.qty}</span>
                              <button
                                type="button"
                                onClick={() => handleModifyActiveOrderQty(i.id, 1)}
                                className="h-4.5 w-4.5 rounded text-slate-500 font-bold flex items-center justify-center cursor-pointer text-xs"
                                style={{ color: "var(--muted)" }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-inset)"}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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

                  {/* Pricing and CGST/SGST details */}
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
                      <div className="flex justify-between text-[11px] pb-1 italic">
                        <span>GST Tax (5%)</span>
                        <span>Exempted (0%)</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-dashed text-sm font-extrabold" style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
                      <span>Grand Total</span>
                      <span className="font-mono text-base" style={{ color: "var(--foreground)" }}>₹{grandTotal}</span>
                    </div>
                  </div>

                  {/* Add Dishes Button (Outside Slip) */}
                  {selectedOrderForBilling.status !== "delivered" && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenuCategory("all"); // Reset category filter
                        setIsMenuModalOpen(true);
                      }}
                      className="w-full flex items-center justify-center py-2.5 border-2 border-dashed rounded-2xl text-xs font-bold transition-all cursor-pointer bg-transparent border-primary/20 text-primary hover:bg-primary/10"
                    >
                      Add Items to Order
                    </button>
                  )}

                  {/* GST Toggle Switch Selector */}
                  {selectedOrderForBilling.status !== "delivered" && (
                    <div className="flex items-center justify-between rounded-2xl p-3 border" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold" style={{ color: "var(--foreground)" }}>Apply GST (5%)</span>
                        <span className="text-[9px]" style={{ color: "var(--muted)" }}>Add CGST & SGST taxes on checkouts</span>
                      </div>
                      <button
                        onClick={() => setApplyGst(!applyGst)}
                        type="button"
                        className="relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none"
                        style={{
                          backgroundColor: applyGst ? "var(--primary)" : "var(--border)"
                        }}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            applyGst ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  )}

                  {/* Mode selector if order not already settled */}
                  {selectedOrderForBilling.status !== "delivered" ? (
                    <div className="space-y-2 rounded-2xl p-3 border" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider" style={{ color: "var(--muted)" }}>Payment Settlement Mode</p>
                      <div className="grid grid-cols-3 gap-2">
                        {["cash", "upi", "card"].map((mode) => {
                          const active = paymentMode === mode;
                          return (
                            <button
                              key={mode}
                              onClick={() => setPaymentMode(mode as any)}
                              className="rounded-xl border py-2 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer"
                              style={{
                                backgroundColor: active ? "var(--primary)" : "var(--surface)",
                                borderColor: active ? "var(--primary)" : "var(--border)",
                                color: active ? "var(--surface)" : "var(--muted)"
                              }}
                            >
                              {mode}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold" style={{ backgroundColor: "var(--status-ready-bg)", borderColor: "var(--status-ready)", color: "var(--status-ready)" }}>
                      <FiCheck size={16} /> Bill fully settled and paid via {paymentMode.toUpperCase()}.
                    </div>
                  )}
                </div>

                {/* Settlement Desk Actions (Fixed at bottom) */}
                <div className="pt-4 border-t shrink-0" style={{ borderColor: "var(--border)" }}>
                  {selectedOrderForBilling.status !== "delivered" ? (
                    <button
                      onClick={handleSettleAndPrintBill}
                      className="w-full flex items-center justify-center py-3.5 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                      style={{ backgroundColor: "var(--primary)" }}
                    >
                      Settle & Print Invoice
                    </button>
                  ) : (
                    <button
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
          </div>
        )}

        {/* Modal: New POS Order */}
        {isPosModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4">
              <form
                onSubmit={handleCreatePosOrder}
                className="w-full max-w-[95vw] h-[90vh] max-h-[90vh] rounded-3xl shadow-2xl border flex flex-col overflow-hidden"
                style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
              >
                {/* POS Top Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b shrink-0 bg-surface" style={{ borderColor: "var(--border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
                    <h3 className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>
                      7 Blue Hills POS Terminal
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-[10px] font-bold text-muted bg-surface-inset px-3 py-1.5 rounded-xl border border-border">
                      🧾 Manual KOT Panel
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPosModalOpen(false)}
                      className="h-8 w-8 rounded-xl flex items-center justify-center transition-all cursor-pointer font-extrabold text-base"
                      style={{ color: "var(--muted)", backgroundColor: "var(--surface-inset)" }}
                    >
                      &times;
                    </button>
                  </div>
                </div>

                {/* POS Grid Body */}
                <div className="flex-1 flex overflow-hidden">
                  {/* 1. Left Sidebar: Categories list */}
                  <div className="w-[18%] border-r flex flex-col overflow-y-auto shrink-0 bg-surface" style={{ borderColor: "var(--border)" }}>
                    <button
                      type="button"
                      onClick={() => setActivePosCategory("all")}
                      className={`px-4 py-3.5 text-left text-xs font-bold transition-all border-l-4 border-t-0 border-b-0 border-r-0 cursor-pointer ${
                        activePosCategory === "all"
                          ? "border-red-600 bg-red-500/10 text-red-600 dark:text-red-400"
                          : "border-transparent text-foreground hover:bg-surface-inset"
                      }`}
                    >
                      All Items
                    </button>
                    {localCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActivePosCategory(cat.id)}
                        className={`px-4 py-3.5 text-left text-xs font-bold transition-all border-l-4 border-t-0 border-b-0 border-r-0 cursor-pointer ${
                          activePosCategory === cat.id
                            ? "border-red-600 bg-red-500/10 text-red-600 dark:text-red-400"
                            : "border-transparent text-foreground hover:bg-surface-inset"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  {/* 2. Middle Section: Dishes Selector */}
                  <div className="flex-1 flex flex-col min-w-0" style={{ backgroundColor: "var(--surface-inset)" }}>
                    {/* Search box & short code row */}
                    <div className="p-3 border-b flex gap-3 items-center bg-surface shrink-0" style={{ borderColor: "var(--border)" }}>
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Search food item by name..."
                          value={posSearchQuery}
                          onChange={(e) => setPosSearchQuery(e.target.value)}
                          className="w-full rounded-xl border pl-8 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 font-semibold"
                          style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        />
                        <span className="absolute left-3 top-2.5 text-muted text-xs">🔍</span>
                      </div>
                      <div className="w-1/4 relative">
                        <input
                          type="text"
                          placeholder="Short Code (ID)"
                          value={posShortCode}
                          onChange={(e) => setPosShortCode(e.target.value)}
                          className="w-full rounded-xl border px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 font-semibold"
                          style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}
                        />
                      </div>
                    </div>

                    {/* Dishes Cards Grid */}
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 align-content-start">
                      {menuItems
                        .filter((item) => {
                          if (activePosCategory === "all") return true;
                          return item.categoryId === activePosCategory;
                        })
                        .filter((item) => {
                          const matchesSearch = item.name.toLowerCase().includes(posSearchQuery.toLowerCase());
                          const matchesShortCode = !posShortCode || item.id.toLowerCase().includes(posShortCode.toLowerCase());
                          return matchesSearch && matchesShortCode;
                        })
                        .map((item) => {
                          const qtyInCart = posCart[item.id] || 0;
                          const isSelected = qtyInCart > 0;

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleUpdatePosQty(item.id, 1)}
                              className={`relative flex gap-3 p-3 bg-surface border rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-[0.98] select-none ${
                                isSelected ? "border-red-500 ring-1 ring-red-500/30" : "border-border"
                              }`}
                              style={{ 
                                backgroundColor: "var(--surface)",
                                borderColor: isSelected ? "red" : "var(--border)"
                              }}
                            >
                              {/* Dish Image */}
                              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border bg-surface-inset" style={{ borderColor: "var(--border)" }}>
                                {item.image && item.image.startsWith("http") ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold bg-zinc-100">
                                    🍔
                                  </div>
                                )}
                              </div>

                              {/* Dish Info */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                <div>
                                  <div className="flex items-center gap-1.5 justify-between">
                                    <p className="text-[11px] font-bold truncate" style={{ color: "var(--foreground)" }}>
                                      {item.name}
                                    </p>
                                    <VegDot veg={item.veg} />
                                  </div>
                                  <p className="text-[9px] text-muted line-clamp-1 mt-0.5" style={{ color: "var(--muted)" }}>
                                    {item.description}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-extrabold" style={{ color: "var(--foreground)" }}>
                                    ₹{item.price}
                                  </span>
                                  {isSelected && (
                                    <span className="bg-red-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                                      {qtyInCart}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* 3. Right Section: Cart Summary */}
                  <div className="w-[30%] border-l flex flex-col justify-between shrink-0 bg-surface" style={{ borderColor: "var(--border)" }}>
                    {/* Order Type Selector */}
                    <div className="grid grid-cols-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setPosSourceType("table");
                          if (localTables.length > 0) setPosSourceId(localTables[0].id);
                        }}
                        className={`py-3 text-[10px] font-extrabold transition-all border-b-2 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          posSourceType === "table"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-muted hover:bg-surface-inset"
                        }`}
                      >
                        <span className="text-sm">🍽️</span>
                        <span>Dine In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPosSourceType("room");
                          if (localRooms.length > 0) setPosSourceId(localRooms[0].id);
                        }}
                        className={`py-3 text-[10px] font-extrabold transition-all border-b-2 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          posSourceType === "room"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-muted hover:bg-surface-inset"
                        }`}
                      >
                        <span className="text-sm">🛎️</span>
                        <span>Room Service</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPosSourceType("pos");
                          setPosSourceId("walkin");
                        }}
                        className={`py-3 text-[10px] font-extrabold transition-all border-b-2 flex flex-col items-center justify-center gap-1 cursor-pointer ${
                          posSourceType === "pos"
                            ? "border-red-600 text-red-600 dark:text-red-400"
                            : "border-transparent text-muted hover:bg-surface-inset"
                        }`}
                      >
                        <span className="text-sm">🛍️</span>
                        <span>Pick Up</span>
                      </button>
                    </div>

                    {/* Context-Specific Selectors */}
                    <div className="p-3 border-b space-y-2 bg-surface-inset/30 shrink-0" style={{ borderColor: "var(--border)" }}>
                      {posSourceType === "table" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-muted uppercase">Select Table</label>
                            <select
                              value={posSourceId}
                              onChange={(e) => setPosSourceId(e.target.value)}
                              className="w-full rounded-lg border px-2 py-1 text-xs outline-none bg-surface font-semibold mt-0.5"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              {localTables.map(t => <option key={t.id} value={t.id}>{t.number}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted uppercase">Guests</label>
                            <input
                              type="number"
                              min="1"
                              value={posGuestCount}
                              onChange={(e) => setPosGuestCount(e.target.value)}
                              className="w-full rounded-lg border px-2 py-1 text-xs outline-none bg-surface font-semibold mt-0.5"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            />
                          </div>
                        </div>
                      )}

                      {posSourceType === "room" && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[9px] font-bold text-muted uppercase">Select Room</label>
                            <select
                              value={posSourceId}
                              onChange={(e) => setPosSourceId(e.target.value)}
                              className="w-full rounded-lg border px-2 py-1 text-xs outline-none bg-surface font-semibold mt-0.5"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            >
                              {localRooms.map(r => <option key={r.id} value={r.id}>Room #{r.number}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-muted uppercase">Guest Name</label>
                            <input
                              type="text"
                              placeholder="e.g. John Doe"
                              value={posGuestName}
                              onChange={(e) => setPosGuestName(e.target.value)}
                              className="w-full rounded-lg border px-2 py-1 text-xs outline-none bg-surface font-semibold mt-0.5"
                              style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                            />
                          </div>
                        </div>
                      )}

                      {posSourceType === "pos" && (
                        <div>
                          <label className="text-[9px] font-bold text-muted uppercase">Guest Name / Mobile</label>
                          <input
                            type="text"
                            placeholder="e.g. Walk-in Customer"
                            value={posGuestName}
                            onChange={(e) => setPosGuestName(e.target.value)}
                            className="w-full rounded-lg border px-2 py-1.5 text-xs outline-none bg-surface font-semibold mt-0.5"
                            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Cart Items List */}
                    {posCartItemsArray.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none opacity-50">
                        <svg className="w-12 h-12 text-muted mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <p className="text-[11px] font-bold text-foreground">No Item Selected</p>
                        <p className="text-[9px] text-muted mt-0.5">Please Select Item from Left Menu Item</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-surface">
                        {posCartItemsArray.map(([itemId, qty]) => {
                          const item = menuItems.find(m => m.id === itemId);
                          if (!item) return null;
                          return (
                            <div key={item.id} className="flex items-center justify-between p-2 rounded-xl border bg-surface-inset/30" style={{ borderColor: "var(--border)" }}>
                              <div className="min-w-0 flex-1 pr-2">
                                <p className="text-[11px] font-bold text-foreground truncate">{item.name}</p>
                                <p className="text-[9px] text-muted font-bold mt-0.5">₹{item.price} &times; {qty}</p>
                              </div>
                              <div className="flex items-center gap-1.5 border rounded-full p-0.5 bg-surface shrink-0" style={{ borderColor: "var(--border)" }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePosQty(item.id, -1)}
                                  className="h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs text-foreground cursor-pointer hover:bg-surface-inset"
                                >
                                  -
                                </button>
                                <span className="text-[10px] font-bold font-mono px-0.5 select-none text-foreground">{qty}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePosQty(item.id, 1)}
                                  className="h-5 w-5 rounded-full flex items-center justify-center font-bold text-xs text-foreground cursor-pointer hover:bg-surface-inset"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* KOT Instructions */}
                    <div className="p-3 border-t bg-surface-inset/10 shrink-0" style={{ borderColor: "var(--border)" }}>
                      <label className="text-[9px] font-bold text-muted uppercase block mb-1">KOT Notes / Instructions</label>
                      <input
                        type="text"
                        placeholder="e.g. Non-spicy, Extra butter"
                        value={posInstructions}
                        onChange={(e) => setPosInstructions(e.target.value)}
                        className="w-full rounded-lg border px-2 py-1.5 text-xs outline-none bg-surface"
                        style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
                      />
                    </div>

                    {/* Total Display */}
                    <div className="px-3 py-2 border-t flex justify-between items-center bg-surface-inset/30 shrink-0" style={{ borderColor: "var(--border)" }}>
                      <span className="text-[10px] font-bold text-muted">Total Amount</span>
                      <span className="text-sm font-extrabold text-foreground" style={{ color: "var(--foreground)" }}>₹{posCalculatedTotal}</span>
                    </div>

                    {/* Payment Selectors */}
                    <div className="p-2.5 border-t grid grid-cols-2 gap-1.5 bg-surface shrink-0" style={{ borderColor: "var(--border)" }}>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMode("not_paid")}
                        className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          posPaymentMode === "not_paid"
                            ? "border-red-600 bg-red-500/10 text-red-600"
                            : "border-border text-foreground hover:bg-surface-inset"
                        }`}
                      >
                        <span>❌</span>
                        <span>Not Paid</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMode("upi")}
                        className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          posPaymentMode === "upi"
                            ? "border-red-600 bg-red-500/10 text-red-600"
                            : "border-border text-foreground hover:bg-surface-inset"
                        }`}
                      >
                        <span>📱</span>
                        <span>UPI</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPosPaymentMode("cash")}
                        className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          posPaymentMode === "cash"
                            ? "border-red-600 bg-red-500/10 text-red-600"
                            : "border-border text-foreground hover:bg-surface-inset"
                      }`}
                    >
                      <span>💵</span>
                      <span>Cash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosPaymentMode("card")}
                      className={`py-1.5 text-[9px] font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        posPaymentMode === "card"
                          ? "border-red-600 bg-red-500/10 text-red-600"
                          : "border-border text-foreground hover:bg-surface-inset"
                      }`}
                    >
                      <span>💳</span>
                      <span>Card</span>
                    </button>
                  </div>

                  {/* Submit Actions */}
                  <div className="p-3 border-t grid grid-cols-2 gap-2 bg-surface-inset/50 shrink-0" style={{ borderColor: "var(--border)" }}>
                    <button
                      type="button"
                      onClick={() => setIsPosModalOpen(false)}
                      className="py-2 rounded-xl border text-xs font-bold text-foreground bg-surface hover:bg-surface-inset transition-all cursor-pointer"
                      style={{ borderColor: "var(--border)" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="py-2 rounded-xl text-white text-xs font-bold bg-red-600 hover:bg-red-700 shadow-md transition-all cursor-pointer text-center"
                    >
                      {posPaymentMode === "not_paid" ? "Generate POS" : "Save & Settle"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Table / Room */}
        {isAddSourceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 animate-fade-in">
            <div
              className="w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-sm font-extrabold" style={{ color: "var(--foreground)" }}>Add New Room / Table</h3>
                <button
                  onClick={() => setIsAddSourceModalOpen(false)}
                  className="h-8 w-8 rounded-xl flex items-center justify-center transition-all font-bold cursor-pointer"
                  style={{ color: "var(--muted)" }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-inset)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleAddSource} className="space-y-4">
                {/* Type Selection */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>Service Type</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => {
                      setNewSourceType(e.target.value as "room" | "table");
                      setNewSourceCapacity(e.target.value === "room" ? "1" : "4"); // Floor for room, seats for table
                    }}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/20 cursor-pointer font-bold"
                    style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  >
                    <option value="table">Dining Table</option>
                    <option value="room">Room Service</option>
                  </select>
                </div>

                {/* Name / Number Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                    {newSourceType === "room" ? "Room Number (e.g. 303)" : "Table Number/ID (e.g. T7)"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={newSourceType === "room" ? "303" : "T7"}
                    value={newSourceNumber}
                    onChange={(e) => setNewSourceNumber(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>

                {/* Capacity / Floor Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>
                    {newSourceType === "room" ? "Floor Level" : "Seating Capacity"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSourceCapacity}
                    onChange={(e) => setNewSourceCapacity(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-primary/20"
                    style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full py-3 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-md text-center hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: "var(--primary)" }}
                >
                  Add to Floor Plan
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Menu Items Overlay (POS Style) */}
        {isMenuModalOpen && selectedOrderForBilling && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4 animate-fade-in">
            <div
              className="w-full max-w-4xl rounded-3xl p-6 shadow-2xl border flex flex-col justify-between max-h-[85vh] overflow-hidden"
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >

              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b shrink-0" style={{ borderColor: "var(--border)" }}>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold font-display animate-shine" style={{ color: "var(--foreground)" }}>POS Menu Desk — {selectedOrderForBilling.sourceLabel}</h3>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: "var(--muted)" }}>Customize quantities or append items directly to this order tab</p>
                </div>

                {/* Search Input bar */}
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <input
                    type="text"
                    placeholder="Search dishes... (e.g. Paneer)"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="rounded-xl border px-3.5 py-1.5 text-[11px] outline-none focus:ring-1 focus:ring-primary/20 focus:border-primary/20 font-semibold"
                    style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)", color: "var(--foreground)" }}
                  />
                  <button
                    onClick={() => setIsMenuModalOpen(false)}
                    className="h-8 w-8 rounded-xl flex items-center justify-center transition-all font-extrabold text-base cursor-pointer"
                    style={{ color: "var(--muted)" }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "var(--surface-inset)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    &times;
                  </button>
                </div>

                {/* Body: Categories (Left) & Food Grid (Right) */}
                <div className="flex-1 flex gap-5 overflow-hidden my-4">

                  {/* Items Grid */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto max-h-[50vh] p-1 scrollbar-thin">
                    {(activeMenuCategory === "all"
                      ? menuItems
                      : menuItems.filter((m) => m.categoryId === activeMenuCategory)
                    )
                      .filter((item) =>
                        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
                      )
                      .map((item) => {
                        const orderItem = selectedOrderForBilling.items.find((i) => i.id === item.id);
                        const qtyInOrder = orderItem ? orderItem.qty : 0;

                        return (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3.5 border rounded-2xl shadow-sm hover:shadow-md transition-all group animate-fade-in"
                            style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate" style={{ color: "var(--foreground)" }}>{item.name}</p>
                                <p className="text-[10px] font-bold mt-0.5" style={{ color: "var(--muted)" }}>₹{item.price}</p>
                              </div>
                            </div>

                            {qtyInOrder > 0 ? (
                              <div className="flex items-center gap-2 text-white rounded-full p-0.5 shrink-0 shadow-sm shadow-primary/10" style={{ backgroundColor: "var(--primary)" }}>
                                <button
                                  type="button"
                                  onClick={() => handleModifyActiveOrderQty(item.id, -1)}
                                  className="h-5.5 w-5.5 rounded-full flex items-center justify-center hover:bg-white/10 text-white font-extrabold cursor-pointer text-xs"
                                >
                                  -
                                </button>
                              <span className="text-[10px] font-extrabond font-mono px-0.5 select-none">{qtyInOrder}</span>
                              <button
                                type="button"
                                onClick={() => handleModifyActiveOrderQty(item.id, 1)}
                                className="h-5.5 w-5.5 rounded-full flex items-center justify-center hover:bg-white/10 text-white font-extrabold cursor-pointer text-xs"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleAddDishToActiveOrder(item.id)}
                              className="rounded-full px-3 py-1 text-[10px] font-extrabond transition-all border border-primary/20 bg-primary/10 text-primary hover:bg-primary/10"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Footer: Live Cart Summary / View options */}
                <div className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border shrink-0" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold" style={{ color: "var(--muted)" }}>Total Items:</span>
                      <span className="font-extrabold font-mono" style={{ color: "var(--foreground)" }}>
                        {selectedOrderForBilling.items.reduce((s, i) => s + i.qty, 0)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold" style={{ color: "var(--muted)" }}>Subtotal:</span>
                      <span className="font-extrabold font-mono" style={{ color: "var(--foreground)" }}>₹{subtotal}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex items-center gap-1.5 font-bold" style={{ color: "var(--status-ready)" }}>
                        <span className="font-semibold">Discount:</span>
                        <span className="font-extrabold font-mono">-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5" style={{ color: "var(--foreground)" }}>
                      <span className="font-semibold">Estimated Bill Total:</span>
                      <span className="font-extrabold font-mono text-sm">₹{grandTotal}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMenuModalOpen(false)}
                    className="w-full sm:w-auto rounded-xl px-6 py-2.5 text-xs font-bold transition-all cursor-pointer text-center shadow-md shadow-black/5 hover:brightness-110"
                    style={{ backgroundColor: "var(--foreground)", color: "var(--surface)" }}
                  >
                    Save & Close
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}