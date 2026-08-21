"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { menuItems, rooms, tables, categories } from "@/lib/dummy-data";
import { FiShoppingBag, FiPlus, FiMinus, FiCheckCircle, FiChevronRight, FiTrash2, FiAward, FiStar, FiTag, FiX } from "react-icons/fi";
import { TbToolsKitchen2 } from "react-icons/tb";
import VegDot from "@/components/VegDot";
import Link from "next/link";
import { dispatchNewOrder } from "@/lib/order-dispatcher";
import { Order, MenuItem } from "@/lib/types";
import { Coupon } from "@/lib/coupons-data";

function OrderSimulator() {
  const searchParams = useSearchParams();
  const rawId = searchParams.get("id") || "r3"; // Default to Room 204 if none scanned
  
  // Resolve source label
  const resolvedRoom = rooms.find(r => r.id === rawId);
  const resolvedTable = tables.find(t => t.id === rawId);
  
  const sourceLabel = resolvedRoom 
    ? `Room ${resolvedRoom.number}` 
    : resolvedTable 
      ? resolvedTable.number 
      : "Guest Dining";

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [instructions, setInstructions] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDetailItem, setSelectedDetailItem] = useState<MenuItem | null>(null);

  // Coupon States
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState("");

  const [isRoomVacant, setIsRoomVacant] = useState(false);
  const [isLoadingCheckIn, setIsLoadingCheckIn] = useState(false);

  useEffect(() => {
    // Fetch active coupons from MySQL
    fetch("/api/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableCoupons(data);
        }
      })
      .catch((err) => console.error("Error fetching coupons:", err));
  }, []);

  useEffect(() => {
    // If it is a room service scan, check if the room is checked-in
    if (resolvedRoom) {
      setIsLoadingCheckIn(true);
      fetch(`/api/rooms/check-in-status?roomId=${rawId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.checkedIn === false) {
            setIsRoomVacant(true);
          } else {
            setIsRoomVacant(false);
          }
        })
        .catch((err) => {
          console.error("Failed to verify room check-in status:", err);
        })
        .finally(() => {
          setIsLoadingCheckIn(false);
        });
    }
  }, [rawId, resolvedRoom]);

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === "all" || item.categoryId === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [itemId, qty]) => {
      const price = menuItems.find(m => m.id === itemId)?.price || 0;
      return sum + (price * qty);
    }, 0);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setCart(prev => {
      const next = { ...prev };
      const current = next[itemId] || 0;
      const updated = current + delta;
      if (updated <= 0) {
        delete next[itemId];
      } else {
        next[itemId] = updated;
      }

      // Check if coupon remains valid under new total
      const newTotal = Object.entries(next).reduce((sum, [id, qty]) => {
        const price = menuItems.find(m => m.id === id)?.price || 0;
        return sum + (price * qty);
      }, 0);

      if (appliedCoupon && newTotal < appliedCoupon.minOrder) {
        setAppliedCoupon(null);
      }

      return next;
    });
  };

  const getCartCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleApplyCoupon = () => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const match = availableCoupons.find(c => c.code === code);

    if (!match) {
      setCouponError("Invalid coupon code");
      return;
    }
    if (!match.active) {
      setCouponError("Coupon is disabled");
      return;
    }
    if (match.itemId) {
      const itemQty = cart[match.itemId] || 0;
      if (itemQty <= 0) {
        const itemName = menuItems.find(m => m.id === match.itemId)?.name || "the target item";
        setCouponError(`Add ${itemName} to your cart to use this coupon.`);
        return;
      }
    }
    if (getCartTotal() < match.minOrder) {
      setCouponError(`Min order value must be ₹${match.minOrder}`);
      return;
    }

    setAppliedCoupon(match);
    setCouponCode("");
  };

  const getDiscount = () => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.itemId) {
      const qty = cart[appliedCoupon.itemId] || 0;
      const item = menuItems.find(m => m.id === appliedCoupon.itemId);
      if (!item || qty === 0) return 0;
      const itemSubtotal = item.price * qty;
      
      if (appliedCoupon.type === "flat") {
        return Math.min(itemSubtotal, Number(appliedCoupon.value));
      } else {
        return Math.round((itemSubtotal * Number(appliedCoupon.value)) / 100);
      }
    }

    if (appliedCoupon.type === "flat") {
      return Number(appliedCoupon.value);
    } else {
      return Math.round((getCartTotal() * Number(appliedCoupon.value)) / 100);
    }
  };

  const getGrandTotal = () => {
    return Math.max(0, getCartTotal() - getDiscount());
  };

  const handlePlaceOrder = async () => {
    if (getCartCount() === 0) return;
    setIsPlacing(true);
    
    const generatedId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderItems = Object.entries(cart).map(([itemId, qty]) => {
      const item = menuItems.find(m => m.id === itemId)!;
      return {
        id: item.id,
        name: item.name,
        qty,
        price: item.price,
        veg: true,
      };
    });

    const newOrder: Order = {
      id: generatedId,
      sourceType: resolvedRoom ? "room" : "table",
      sourceLabel: sourceLabel,
      items: orderItems,
      instructions: instructions || undefined,
      status: "pending",
      placedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      total: getGrandTotal(),
      couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      discount: appliedCoupon ? getDiscount() : undefined,
    };

    try {
      // POST order to MySQL database
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      // Broadcast order dynamically to active screens for live audio alert chimes
      dispatchNewOrder(newOrder);

      setIsPlacing(false);
      setOrderPlaced(true);
      setPlacedOrderId(generatedId);
      setCart({});
      setInstructions("");
      setAppliedCoupon(null);
    } catch (err) {
      console.error("Failed to place order:", err);
      setIsPlacing(false);
    }
  };

  return (
    <div className="min-h-screen pb-36 relative select-none font-sans" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
      
      {/* 100% Pure Veg Header Banner */}
      <div className="bg-emerald-600 text-white text-center py-2 text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
        100% PURE VEGETARIAN DINING
      </div>

      {isRoomVacant && (
        <div className="bg-rose-100 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 text-center py-4 px-6 text-xs font-bold space-y-1 select-none flex flex-col items-center justify-center">
          <p className="text-sm font-extrabold uppercase tracking-wide">⚠️ Room Ordering Blocked</p>
          <p className="font-medium max-w-md">This room ({sourceLabel}) is currently vacant. Please check-in at the reception desk to activate ordering permissions.</p>
        </div>
      )}

      <div className="max-w-xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Brand Header Banner */}
        <div className="rounded-3xl p-5 border shadow-sm flex items-center justify-between" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 rounded bg-[#EFF6FF] dark:bg-blue-950/20 text-[9px] font-extrabold text-[#3B82F6] px-2 py-0.5 border border-blue-100 dark:border-blue-900/30 uppercase tracking-wide">
              {resolvedRoom ? "Room Service" : "Table Dining"}
            </span>
            <h2 className="text-lg font-extrabold tracking-tight mt-1" style={{ color: "var(--foreground)" }}>
              {sourceLabel} Ordering
            </h2>
            <p className="text-[11px] font-medium" style={{ color: "var(--muted)" }}>
              Welcome to the digital guest ordering menu.
            </p>
          </div>
          <div className="h-11 w-11 rounded-full bg-blue-50 dark:bg-blue-950/20 text-[#3B82F6] border border-blue-100 dark:border-blue-900/50 flex items-center justify-center shrink-0">
            <TbToolsKitchen2 size={18} />
          </div>
        </div>

        {/* Search Bar (Swiggy / Zepto Style) */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <FiShoppingBag className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search for dishes, starters, main course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border pl-11 pr-4 py-3 text-xs outline-none transition-all duration-300 focus:shadow-md font-medium"
            style={{
              borderColor: "var(--border)",
              backgroundColor: "var(--surface)",
              color: "var(--foreground)",
            }}
          />
        </div>


        {/* Food Items List */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted px-1">
            Menu Items ({filteredItems.length})
          </h3>

          <div className="grid grid-cols-1 gap-5">
            {filteredItems.map((item) => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDetailItem(item)}
                  className="rounded-3xl border p-4 shadow-sm flex items-start gap-4 transition-all duration-200 cursor-pointer hover:shadow-md"
                  style={{
                    backgroundColor: qty > 0 ? "var(--surface-inset)" : "var(--surface)",
                    borderColor: qty > 0 ? "#3B82F6" : "var(--border)",
                  }}
                >
                  {/* Left Column: Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <VegDot veg={true} />
                      {item.id === "m_paneer_tikka" && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-[8px] font-extrabold text-amber-700 px-1.5 py-0.5 select-none uppercase tracking-wider">
                          <FiStar size={8} className="fill-amber-500 text-amber-500" /> Bestseller
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-foreground text-sm tracking-tight">{item.name}</h4>
                    <p className="text-xs font-extrabold text-foreground font-mono">₹{item.price}</p>
                    <p className="text-[10px] text-muted line-clamp-3 leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Right Column: Image and Overlapping Button */}
                  <div className="relative w-28 h-28 shrink-0 select-none">
                    <div className="w-full h-full rounded-2xl border overflow-hidden shadow-inner flex items-center justify-center" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}>
                      {item.image && item.image.startsWith("http") ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-4xl">{item.image}</span>
                      )}
                    </div>
                    
                    {/* Overlapping Add Button (Swiggy / Zepto Style) */}
                    {/* Overlapping Add Button (Swiggy / Zepto Style) */}
                    <div 
                      className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-24"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {qty === 0 ? (
                        <button
                          disabled={isRoomVacant}
                          onClick={() => handleUpdateQty(item.id, 1)}
                          className="flex items-center justify-center w-full bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-emerald-200 dark:border-emerald-900/50 py-2 rounded-xl text-xs font-extrabold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer text-center disabled:opacity-50 disabled:pointer-events-none"
                        >
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-full bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80 py-1.5 px-2.5 rounded-xl text-xs font-extrabold shadow-md">
                          <button
                            disabled={isRoomVacant}
                            onClick={() => handleUpdateQty(item.id, -1)}
                            className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">{qty}</span>
                          <button
                            disabled={isRoomVacant}
                            onClick={() => handleUpdateQty(item.id, 1)}
                            className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-xs font-bold rounded-2xl border" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)", color: "var(--muted)" }}>
                No dishes found matching your search. Try another query!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Bottom Cart Bar (Swiggy Style Checkout) */}
      {getCartCount() > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-30 border-t px-6 py-4 shadow-[0_-10px_25px_rgba(0,0,0,0.06)]" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="max-w-xl mx-auto space-y-4">
            
            {/* Special Instructions Input */}
            <div className="flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}>
              <span className="text-muted shrink-0">Note:</span>
              <input
                type="text"
                placeholder="Any special instructions? (e.g. Less spicy, no onion)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-xs font-medium placeholder:text-slate-400"
                style={{ color: "var(--foreground)" }}
              />
            </div>

            {/* Coupon Code Block */}
            <div className="flex flex-col gap-1 border-b pb-3" style={{ borderColor: "var(--border)" }}>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 px-3.5 py-2.5 rounded-2xl text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                    <FiTag size={12} />
                    <span>Coupon "{appliedCoupon.code}" Applied</span>
                    <span className="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase">-₹{getDiscount()}</span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    className="text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Promo Coupon (e.g. VEGPANIER, PANEER50)"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError("");
                      }}
                      className="w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#3B82F6] font-bold uppercase placeholder:normal-case placeholder:font-normal"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-inset)",
                        color: "var(--foreground)",
                      }}
                    />
                    {couponError && (
                      <p className="absolute left-1 -bottom-4 text-[9px] font-bold text-rose-500">{couponError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            {/* Total & Checkout Row */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">{getCartCount()} item{getCartCount() > 1 ? "s" : ""} selected</p>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  {appliedCoupon && (
                    <span className="text-xs text-muted line-through">₹{getCartTotal()}</span>
                  )}
                  <span className="text-base font-extrabold text-foreground font-mono">₹{getGrandTotal()}</span>
                </div>
              </div>
              
              <button
                onClick={() => handlePlaceOrder()}
                disabled={isPlacing}
                className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-50 disabled:pointer-events-none hover:scale-[1.01] active:scale-[0.99] transition-transform duration-200"
              >
                <span>{isPlacing ? "Processing..." : "Place Order"}</span>
                <FiShoppingBag size={14} />
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Success Placed Order Popup Modal */}
      {orderPlaced && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl border border-border/40 text-center space-y-4 pt-8">
            
            <div className="h-16 w-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <FiCheckCircle size={32} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">Order Placed Successfully!</h3>
              <p className="text-xs text-muted max-w-[240px] mx-auto leading-normal">
                Ticket <span className="font-mono font-bold text-foreground">{placedOrderId}</span> has been dispatched to the kitchen.
              </p>
            </div>

            <div className="p-3 bg-surface-inset rounded-2xl border border-border/40 text-xs space-y-1.5 font-medium">
              <div className="flex justify-between text-muted">
                <span>Destination</span>
                <span className="font-bold text-foreground">{sourceLabel}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Status</span>
                <span className="text-[#3B82F6] font-bold">COOKING</span>
              </div>
            </div>

            <button
              onClick={() => setOrderPlaced(false)}
              className="w-full py-3 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
              style={{ backgroundColor: "var(--brass)" }}
            >
              Back to Menu
            </button>

          </div>
        </div>
      )}

      {/* Food Item Detail Popup Modal */}
      {selectedDetailItem && (() => {
        const item = selectedDetailItem;
        const qty = cart[item.id] || 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedDetailItem(null)}>
            <div 
              className="w-full max-w-md rounded-3xl bg-surface overflow-hidden shadow-2xl border border-border/40 flex flex-col relative animate-in fade-in zoom-in-95 duration-200" 
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDetailItem(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/40 hover:bg-slate-900/60 text-white backdrop-blur-md transition-all cursor-pointer"
              >
                <FiX size={16} />
              </button>

              {/* Large Image Header */}
              <div className="relative h-64 w-full bg-slate-100 flex items-center justify-center overflow-hidden border-b" style={{ borderColor: "var(--border)" }}>
                {item.image && item.image.startsWith("http") ? (
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-7xl select-none">{item.image}</span>
                )}
              </div>

              {/* Body Details Area */}
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <VegDot veg={true} />
                    {item.id === "m_paneer_tikka" && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-[8px] font-extrabold text-amber-700 px-1.5 py-0.5 select-none uppercase tracking-wider">
                        <FiStar size={8} className="fill-amber-500 text-amber-500" /> Bestseller
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight">{item.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <FiStar size={12} className="fill-amber-500" /> 4.3
                    </span>
                    <span>•</span>
                    <span>120+ ratings</span>
                  </div>
                  <p className="text-lg font-extrabold text-foreground font-mono mt-2">₹{item.price}</p>
                </div>

                <div className="border-t pt-3 space-y-1" style={{ borderColor: "var(--border)" }}>
                  <h5 className="text-[10px] font-bold text-muted uppercase tracking-wider">Description</h5>
                  <p className="text-xs text-muted leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Modal Footer (Action Panel) */}
              <div className="p-4 bg-surface-inset border-t flex items-center justify-between" style={{ backgroundColor: "var(--surface-inset)", borderColor: "var(--border)" }}>
                <div>
                  <p className="text-[9px] font-bold text-muted uppercase tracking-wider">Price</p>
                  <p className="text-base font-extrabold text-foreground font-mono">₹{item.price}</p>
                </div>

                {/* Add to Cart Actions */}
                <div className="w-28">
                  {qty === 0 ? (
                    <button
                      disabled={isRoomVacant}
                      onClick={() => handleUpdateQty(item.id, 1)}
                      className="flex items-center justify-center w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-extrabold shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                    >
                      ADD TO CART
                    </button>
                  ) : (
                    <div className="flex items-center justify-between w-full bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/80 py-1.5 px-2.5 rounded-xl text-xs font-extrabold shadow-md">
                      <button
                        onClick={() => handleUpdateQty(item.id, -1)}
                        className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <FiMinus size={12} />
                      </button>
                      <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200">{qty}</span>
                      <button
                        onClick={() => handleUpdateQty(item.id, 1)}
                        className="h-5 w-5 rounded-full flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <FiPlus size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}

export default function OrderSimulatorPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Loading menu...</div>}>
      <OrderSimulator />
    </Suspense>
  );
}
