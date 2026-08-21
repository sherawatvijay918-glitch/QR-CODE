"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { Coupon } from "@/lib/coupons-data";
import { menuItems } from "@/lib/dummy-data";
import { Plus, Tag, Check, Trash2, Info, Sliders, DollarSign, BarChart3 } from "lucide-react";

export default function CampaignPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState<"flat" | "percent">("flat");
  const [value, setValue] = useState(50);
  const [minOrder, setMinOrder] = useState(150);
  const [targetItemId, setTargetItemId] = useState("");

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCoupons(data);
      }
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const handleToggleActive = async (codeToToggle: string) => {
    const coupon = coupons.find((c) => c.code === codeToToggle);
    if (!coupon) return;

    try {
      const updatedCoupon = { ...coupon, active: !coupon.active };
      await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedCoupon),
      });
      await fetchCoupons();
      triggerToast(`Coupon ${codeToToggle} status updated!`);
    } catch (err) {
      triggerToast("Failed to update status");
    }
  };

  const handleDelete = async (codeToDelete: string) => {
    try {
      await fetch(`/api/coupons?code=${codeToDelete}`, {
        method: "DELETE",
      });
      await fetchCoupons();
      triggerToast(`Coupon ${codeToDelete} deleted successfully!`);
    } catch (err) {
      triggerToast("Failed to delete coupon");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const formattedCode = code.trim().toUpperCase();

    // Check duplicate locally first
    if (coupons.some((c) => c.code === formattedCode)) {
      triggerToast("Error: Coupon code already exists!");
      return;
    }

    const newCoupon: Coupon = {
      code: formattedCode,
      type,
      value: Number(value),
      minOrder: Number(minOrder),
      active: true,
      usageCount: 0,
      itemId: targetItemId || undefined,
    };

    try {
      await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon),
      });
      
      await fetchCoupons();
      setIsModalOpen(false);
      
      // Reset Form
      setCode("");
      setType("flat");
      setValue(50);
      setMinOrder(150);
      setTargetItemId("");

      triggerToast(`Coupon ${formattedCode} created successfully!`);
    } catch (err) {
      triggerToast("Failed to create coupon");
    }
  };

  // Calc totals
  const totalRedemptions = coupons.reduce((sum, c) => sum + Number(c.usageCount || 0), 0);

  return (
    <>
      <Topbar title="Campaigns" />
      <main className="flex-1 space-y-10 p-8 md:p-10 max-w-5xl">
        
        {/* Header Action Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-[17px] font-bold text-zinc-900 dark:text-zinc-50">Coupons & Campaigns (MySQL)</h2>
            <p className="text-[13px] text-zinc-550 dark:text-zinc-450 mt-1">Manage guest discount offers, promo codes, and check conversion metrics.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 hover:shadow-xs active:scale-[0.98] transition-all px-4 py-2 text-[13px] font-medium text-white cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Create Coupon
          </button>
        </div>

        {/* Toast Notify */}
        {toastMessage && (
          <div className="bg-indigo-650 text-white rounded-lg px-5 py-3 text-[13px] font-medium shadow-lg animate-float flex items-center gap-2 max-w-md">
            <Info size={15} strokeWidth={1.5} />
            {toastMessage}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1 (Total Coupons - Hero style) */}
          <div className="rounded-[16px] p-6 border flex items-center gap-4 hover:border-zinc-350 dark:hover:border-zinc-700 hover:scale-[1.01] transition-all bg-surface" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-10 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shrink-0">
              <Tag size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-mono block">Total Coupons</p>
              <p className="text-[19px] font-extrabold mt-1 text-zinc-950 dark:text-zinc-50 font-mono tabular-nums leading-none">{coupons.length} Codes</p>
            </div>
          </div>

          <div className="rounded-[16px] p-6 border flex items-center gap-4 hover:border-zinc-350 dark:hover:border-zinc-700 hover:scale-[1.01] transition-all bg-surface" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-10 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shrink-0">
              <Check size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-mono block">Redeemed Offers</p>
              <p className="text-[19px] font-extrabold mt-1 text-zinc-950 dark:text-zinc-50 font-mono tabular-nums leading-none">{totalRedemptions} Times</p>
            </div>
          </div>

          <div className="rounded-[16px] p-6 border flex items-center gap-4 hover:border-zinc-350 dark:hover:border-zinc-700 hover:scale-[1.01] transition-all bg-surface" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-10 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shrink-0">
              <BarChart3 size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[13px] font-bold uppercase tracking-widest text-zinc-450 dark:text-zinc-500 font-mono block">Avg Savings</p>
              <p className="text-[19px] font-extrabold mt-1 text-zinc-950 dark:text-zinc-50 font-mono tabular-nums leading-none">₹65 / Guest</p>
            </div>
          </div>
        </div>

        {/* Coupons List Table */}
        <div className="rounded-[16px] p-6 border bg-surface overflow-hidden" style={{ borderColor: "var(--border)" }}>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="text-center py-8 text-[13px] font-medium text-zinc-400 dark:text-zinc-500">Loading coupons from MySQL database...</div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left font-bold uppercase text-[11px] tracking-wider border-b pb-2 text-zinc-400 dark:text-zinc-500 font-mono" style={{ borderColor: "var(--border)" }}>
                    <th className="px-4 py-3">Promo Code</th>
                    <th className="px-4 py-3">Applies To</th>
                    <th className="px-4 py-3">Discount Value</th>
                    <th className="px-4 py-3">Min. Order Limit</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Redemptions</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {coupons.map((coupon) => (
                    <tr key={coupon.code} className="transition-colors hover:bg-zinc-50/30 dark:hover:bg-zinc-900/30">
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 border text-[11px] font-medium bg-zinc-50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                          <Tag size={11} strokeWidth={1.5} /> {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: "var(--foreground)" }}>
                        {coupon.itemId ? (
                          <span className="inline-flex rounded px-2 py-0.5 text-[11px] font-semibold max-w-[150px] truncate" style={{ backgroundColor: "var(--surface-inset)", color: "var(--foreground)" }}>
                            Dish: {menuItems.find(m => m.id === coupon.itemId)?.name || coupon.itemId}
                          </span>
                        ) : (
                          <span className="font-medium text-[11px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Entire Cart</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-semibold font-mono text-[13px] text-zinc-900 dark:text-zinc-50">
                        {coupon.type === "flat" ? `₹${Number(coupon.value).toFixed(0)}` : `${Number(coupon.value).toFixed(0)}%`}
                      </td>
                      <td className="px-4 py-3.5 font-semibold font-mono text-zinc-500" style={{ color: "var(--muted)" }}>
                        ₹{Number(coupon.minOrder).toFixed(0)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <button
                          onClick={() => handleToggleActive(coupon.code)}
                          className={`inline-flex rounded-md px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide border cursor-pointer ${
                            coupon.active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-400"
                              : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400"
                          }`}
                        >
                          {coupon.active ? "Active" : "Disabled"}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-zinc-800 dark:text-zinc-200" style={{ color: "var(--foreground)" }}>
                        {coupon.usageCount}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(coupon.code)}
                          className="p-2 text-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/10 rounded-xl transition-all cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {coupons.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center font-medium" style={{ color: "var(--muted)" }}>
                        No discount coupons found. Click "Create Coupon" to add one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Modal: Add Coupon */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl border space-y-4" style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: "var(--border)" }}>
                <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Create New Coupon</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="h-8 w-8 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
                  style={{ color: "var(--muted)" }}
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                {/* Code */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PANEER50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[var(--brass)] focus:border-[var(--brass)]"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-inset)",
                      color: "var(--foreground)",
                    }}
                  />
                </div>

                {/* Target Item Selector */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>Applies To</label>
                  <select
                    value={targetItemId}
                    onChange={(e) => setTargetItemId(e.target.value)}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brass focus:border-brass cursor-pointer font-bold"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-inset)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="" style={{ color: "var(--foreground)", backgroundColor: "var(--surface)" }}>Entire Cart (All Items)</option>
                    {menuItems.map((item) => (
                      <option key={item.id} value={item.id} style={{ color: "var(--foreground)", backgroundColor: "var(--surface)" }}>
                        Specific Item: {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as "flat" | "percent")}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-brass focus:border-brass cursor-pointer"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: "var(--surface-inset)",
                      color: "var(--foreground)",
                    }}
                  >
                    <option value="flat" style={{ color: "var(--foreground)", backgroundColor: "var(--surface)" }}>Flat Price Discount (₹)</option>
                    <option value="percent" style={{ color: "var(--foreground)", backgroundColor: "var(--surface)" }}>Percentage Discount (%)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Value */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>Discount Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={value}
                      onChange={(e) => setValue(Number(e.target.value))}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[var(--brass)] focus:border-[var(--brass)]"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-inset)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>

                  {/* Min Order */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: "var(--muted)" }}>Min. Order Limit</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={minOrder}
                      onChange={(e) => setMinOrder(Number(e.target.value))}
                      className="w-full rounded-xl border px-3.5 py-2.5 text-xs outline-none focus:ring-1 focus:ring-[var(--brass)] focus:border-[var(--brass)]"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: "var(--surface-inset)",
                        color: "var(--foreground)",
                      }}
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[var(--brass)] hover:brightness-110 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md text-center"
                >
                  Create Promotion
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </>
  );
}
