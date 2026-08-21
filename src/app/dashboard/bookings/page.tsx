"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { FiSearch, FiCalendar, FiUser, FiInfo, FiTag, FiDollarSign, FiUsers, FiFilter, FiCheckCircle, FiXCircle, FiGrid, FiFileText, FiPhone, FiShield, FiMapPin, FiPrinter, FiX } from "react-icons/fi";

interface Booking {
  id: number;
  roomId: string;
  roomNumber: string;
  guestName: string;
  mobileNumber: string;
  idType: string;
  idNumber: string;
  idPhotoFront: string | null;
  idPhotoBack: string | null;
  passportCountry: string | null;
  address: string | null;
  adults: number;
  children: number;
  coGuests: any[] | null;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  paymentMode: string;
  advancePaid: number;
  bookingSource: string;
  tariff: number;
  extraCharge: number;
  gst: number;
  discount: number;
  status: "active" | "checked_out";
}

export default function BookingsLedgerPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "checked_out">("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [toast, setToast] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings?status=all");
      const data = await res.json();
      if (Array.isArray(data)) {
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to load bookings ledger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();

    const channel = new BroadcastChannel("hotel_orders_channel");
    channel.onmessage = () => {
      fetchBookings();
    };
    return () => channel.close();
  }, []);

  const handleCheckout = async (id: number, roomNumber: string) => {
    if (!confirm(`Are you sure you want to checkout Room ${roomNumber}?`)) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "checked_out" }),
      });

      if (res.ok) {
        triggerToast(`Room ${roomNumber} checked out successfully!`);
        setSelectedBooking(null);
        await fetchBookings();

        // Broadcast to trigger room status updates
        const channel = new BroadcastChannel("hotel_orders_channel");
        channel.postMessage("guest_checkout_sync");
        channel.close();
      }
    } catch (err) {
      triggerToast("Checkout failed");
    }
  };

  // Helper formatting functions
  const formatDateString = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return iso;
    }
  };

  const getStayDuration = (inDate: string, outDate: string) => {
    try {
      const diff = new Date(outDate).getTime() - new Date(inDate).getTime();
      const hours = diff / (3600 * 1000);
      const days = Math.ceil(hours / 24);
      return days <= 0 ? 1 : days;
    } catch {
      return 1;
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch = 
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mobileNumber.includes(searchQuery) ||
      b.roomNumber.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate Aggregates
  const totalStaysCount = bookings.length;
  const activeStaysCount = bookings.filter(b => b.status === "active").length;
  const completedStaysCount = bookings.filter(b => b.status === "checked_out").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.price || 0), 0);

  return (
    <>
      <Topbar title="Bookings Ledger" />
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6 select-none font-sans">
        
        {/* Header Text */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">Guest Check-In Register</h2>
            <p className="text-xs text-muted mt-1">Audit active stays, complete guest check-outs, and review booking billing details.</p>
          </div>
        </div>

        {/* Toast Notifier */}
        {toast && (
          <div className="fixed top-20 right-8 bg-zinc-900 border border-zinc-800 text-white rounded-2xl px-5 py-3.5 text-xs font-bold shadow-lg animate-float flex items-center gap-2 z-50">
            <FiInfo size={15} />
            {toast}
          </div>
        )}

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="rounded-[16px] p-6 border flex items-center gap-4 bg-surface" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-10 rounded-xl bg-zinc-500/5 text-zinc-500 flex items-center justify-center border border-border/80 shrink-0">
              <FiCalendar size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted font-mono">Total Bookings</p>
              <p className="text-[18px] font-extrabold mt-1 text-foreground font-mono leading-none">{totalStaysCount} Records</p>
            </div>
          </div>

          <div className="rounded-[16px] p-6 border flex items-center gap-4 bg-surface" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/5 text-emerald-500 flex items-center justify-center border border-emerald-500/10 shrink-0 animate-pulse">
              <FiCheckCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted font-mono">Active Stays</p>
              <p className="text-[18px] font-extrabold mt-1 text-emerald-500 font-mono leading-none">{activeStaysCount} Guests</p>
            </div>
          </div>

          <div className="rounded-[16px] p-6 border flex items-center gap-4 bg-surface" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-10 rounded-xl bg-blue-500/5 text-blue-500 flex items-center justify-center border border-blue-500/10 shrink-0">
              <FiXCircle size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted font-mono">Checked Out</p>
              <p className="text-[18px] font-extrabold mt-1 text-blue-500 font-mono leading-none">{completedStaysCount} Stays</p>
            </div>
          </div>

          <div className="rounded-[16px] p-6 border flex items-center gap-4 bg-surface" style={{ borderColor: "var(--border)" }}>
            <div className="h-10 w-10 rounded-xl bg-amber-500/5 text-amber-500 flex items-center justify-center border border-amber-500/10 shrink-0">
              <FiDollarSign size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted font-mono">Total Billing</p>
              <p className="text-[18px] font-extrabold mt-1 text-amber-500 font-mono leading-none">₹{totalRevenue.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border/60">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted">
              <FiSearch size={15} />
            </div>
            <input
              type="text"
              placeholder="Search by name, room #, mobile number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-xs font-bold outline-none transition-all focus:border-zinc-400 bg-surface-inset/40 border-border/80 text-foreground"
            />
          </div>

          {/* Status Segment Filters */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider hidden sm:inline">Filter Status:</span>
            <div className="flex bg-surface-inset/60 border border-border/60 rounded-xl p-0.5">
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "checked_out", label: "Checked Out" }
              ].map((filter) => {
                const active = statusFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id as any)}
                    className={`rounded-lg px-4.5 py-1.5 text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer ${
                      active
                        ? "bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-100 dark:border-zinc-100 dark:text-zinc-950 shadow-xs"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface rounded-3xl border border-border/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto scrollbar-thin">
            {isLoading ? (
              <div className="text-center py-16 text-xs text-muted font-bold animate-pulse">
                Syncing ledger entries from server...
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-[9px] font-bold uppercase tracking-widest text-muted bg-surface-inset/30 font-mono">
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4">Primary Guest</th>
                    <th className="px-6 py-4">Check-In Duration</th>
                    <th className="px-6 py-4">Billing Summary</th>
                    <th className="px-6 py-4">Booking Source</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  {filteredBookings.map((b) => {
                    const days = getStayDuration(b.checkInDate, b.checkOutDate);
                    return (
                      <tr key={b.id} className="hover:bg-surface-inset/10 transition-colors font-medium">
                        <td className="px-6 py-4 font-mono font-black text-foreground">
                          Room {b.roomNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{b.guestName}</div>
                          <div className="text-[10px] text-muted font-mono mt-0.5">{b.mobileNumber}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{days} Night{days > 1 ? "s" : ""}</div>
                          <div className="text-[10px] text-muted mt-0.5 font-mono">
                            {b.checkInDate.split("T")[0]} to {b.checkOutDate.split("T")[0]}
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <div className="font-bold text-foreground">₹{Number(b.price).toLocaleString("en-IN")}</div>
                          <div className="text-[9px] text-muted uppercase mt-0.5 font-sans font-bold">{b.paymentMode}</div>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span className="inline-flex rounded-lg bg-surface-inset px-2 py-0.5 text-[9px] font-bold text-foreground border border-border/40">
                            {b.bookingSource}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                            b.status === "active"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              : "bg-zinc-500/10 border-zinc-500/20 text-muted"
                          }`}>
                            {b.status === "active" ? "Active" : "Checked Out"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-inset text-[10px] font-bold text-muted hover:text-foreground transition-all cursor-pointer"
                            >
                              Details
                            </button>
                            {b.status === "active" && (
                              <button
                                onClick={() => handleCheckout(b.id, b.roomNumber)}
                                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-[10px] font-bold hover:bg-zinc-800 transition-all cursor-pointer"
                              >
                                Checkout
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredBookings.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center text-muted font-bold bg-surface/30">
                        No check-in register entries found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Detailed Booking Folio Modal */}
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4">
            <div className="w-full max-w-[460px] rounded-[32px] bg-surface p-6 sm:p-7 shadow-2xl border border-border/60 space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none animate-float relative">
              
              {/* Close Button */}
              <button
                onClick={() => setSelectedBooking(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-surface-inset flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer border border-border/40"
              >
                <FiX size={15} />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3.5 pt-2">
                <div className="h-11 w-11 rounded-xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-md">
                  <FiFileText size={20} />
                </div>
                <div>
                  <h3 className="text-[15px] font-extrabold text-foreground tracking-tight">Room Stay Folio</h3>
                  <p className="text-[10px] text-muted font-mono mt-0.5">Booking REF #{selectedBooking.id}</p>
                </div>
              </div>

              {/* Guest Details Panel */}
              <div className="space-y-4 pt-1">
                <div className="p-5 bg-surface-inset/40 rounded-2xl border border-border/60 space-y-3.5 relative overflow-hidden">
                  
                  {/* Top Badge Row */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono font-black text-sm text-foreground">Room {selectedBooking.roomNumber}</span>
                    <span className="inline-flex rounded-lg bg-surface-inset px-2.5 py-0.5 text-[9px] font-bold text-foreground border border-border/40 uppercase tracking-wide">
                      {selectedBooking.bookingSource}
                    </span>
                  </div>
                  
                  <div className="border-t border-border/40 my-2" />
                  
                  {/* Guest Info Lines with Icons */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5 text-muted">
                      <FiUser className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" size={14} />
                      <div className="flex-1 flex justify-between">
                        <span className="font-semibold">Guest Name:</span>
                        <span className="font-bold text-foreground">{selectedBooking.guestName}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-muted">
                      <FiPhone className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" size={14} />
                      <div className="flex-1 flex justify-between">
                        <span className="font-semibold">Mobile Number:</span>
                        <span className="font-mono text-foreground">{selectedBooking.mobileNumber}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2.5 text-muted">
                      <FiShield className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" size={14} />
                      <div className="flex-1 flex justify-between">
                        <span className="font-semibold">ID Verified:</span>
                        <span className="font-bold text-foreground">{selectedBooking.idType} ({selectedBooking.idNumber})</span>
                      </div>
                    </div>

                    {selectedBooking.address && (
                      <div className="flex items-start gap-2.5 text-muted">
                        <FiMapPin className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" size={14} />
                        <div className="flex-1 flex justify-between">
                          <span className="font-semibold">Address:</span>
                          <span className="font-medium text-foreground text-right max-w-[200px] truncate" title={selectedBooking.address}>
                            {selectedBooking.address}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-2.5 text-muted">
                      <FiUsers className="text-zinc-400 dark:text-zinc-500 shrink-0 mt-0.5" size={14} />
                      <div className="flex-1 flex justify-between">
                        <span className="font-semibold">Occupants:</span>
                        <span className="font-bold text-foreground">
                          {selectedBooking.adults} Adult{selectedBooking.adults > 1 ? "s" : ""}, {selectedBooking.children} Child{selectedBooking.children > 1 ? "ren" : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Co-guests lists if present */}
                {(() => {
                  const coGuestsList = typeof selectedBooking.coGuests === "string" 
                    ? JSON.parse(selectedBooking.coGuests) 
                    : (Array.isArray(selectedBooking.coGuests) ? selectedBooking.coGuests : []);
                  
                  if (!coGuestsList || coGuestsList.length === 0) return null;

                  return (
                    <div className="p-4 bg-surface-inset/40 rounded-2xl border border-border/60 space-y-3">
                      <p className="text-[10px] font-bold text-muted uppercase tracking-wider block font-mono">Companion Guest Details</p>
                      <div className="space-y-3">
                        {coGuestsList.map((cg: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-xs border-l-2 border-border/80 pl-3">
                            <div>
                              <p className="font-bold text-foreground">{cg.name}</p>
                              <p className="text-[9px] text-muted font-mono mt-0.5">{cg.idType} - {cg.idNumber}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Folio Billing Perforated Slip Visual */}
                <div className="ticket-perforated bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-3.5 font-mono text-xs shadow-xs relative overflow-hidden">
                  
                  {/* Decorative Invoice Stamp */}
                  <div className="absolute -right-2 -bottom-2 opacity-5 select-none pointer-events-none transform -rotate-12">
                    <FiFileText size={100} />
                  </div>

                  <div className="flex justify-between pb-2 border-b border-dashed border-amber-500/20">
                    <span className="font-extrabold uppercase text-foreground">Folio Bill Receipt</span>
                    <span className="text-[10px] text-muted">{formatDateString(selectedBooking.checkInDate).split(",")[0]}</span>
                  </div>

                  <div className="space-y-2 py-1">
                    <div className="flex justify-between text-muted">
                      <span>Room Tariff</span>
                      <span className="font-bold text-foreground">₹{selectedBooking.tariff}</span>
                    </div>
                    {selectedBooking.extraCharge > 0 && (
                      <div className="flex justify-between text-muted">
                        <span>Extra Bed Charge</span>
                        <span className="font-bold text-foreground">₹{selectedBooking.extraCharge}</span>
                      </div>
                    )}
                    {selectedBooking.gst > 0 && (
                      <div className="flex justify-between text-muted">
                        <span>GST Tax</span>
                        <span className="font-bold text-foreground">₹{selectedBooking.gst}</span>
                      </div>
                    )}
                    {selectedBooking.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                        <span>Promo Discount</span>
                        <span>-₹{selectedBooking.discount}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-dashed border-amber-500/20 pt-2.5 flex justify-between font-bold text-foreground text-sm">
                    <span>TOTAL PRICE</span>
                    <span className="text-amber-500 font-extrabold text-base">₹{Number(selectedBooking.price).toLocaleString("en-IN")}</span>
                  </div>

                  <div className="flex justify-between text-muted text-[10px] pt-1">
                    <span>Advance Paid:</span>
                    <span className="font-bold text-foreground">₹{selectedBooking.advancePaid}</span>
                  </div>

                  <div className="flex justify-between text-muted text-[10px] pb-1">
                    <span>Settle Mode:</span>
                    <span className="font-bold uppercase text-foreground">{selectedBooking.paymentMode}</span>
                  </div>

                  {/* Scannable Barcode SVG */}
                  <div className="flex flex-col items-center gap-1.5 mt-3 pt-3 border-t border-dashed border-amber-500/20 font-sans">
                    <svg className="h-5 w-36 text-foreground/20" fill="currentColor" viewBox="0 0 100 20">
                      <rect x="0" y="0" width="2" height="20" />
                      <rect x="4" y="0" width="1" height="20" />
                      <rect x="7" y="0" width="3" height="20" />
                      <rect x="12" y="0" width="1" height="20" />
                      <rect x="15" y="0" width="2" height="20" />
                      <rect x="19" y="0" width="4" height="20" />
                      <rect x="25" y="0" width="1" height="20" />
                      <rect x="28" y="0" width="2" height="20" />
                      <rect x="32" y="0" width="3" height="20" />
                      <rect x="37" y="0" width="1" height="20" />
                      <rect x="40" y="0" width="2" height="20" />
                      <rect x="44" y="0" width="4" height="20" />
                      <rect x="50" y="0" width="1" height="20" />
                      <rect x="53" y="0" width="3" height="20" />
                      <rect x="58" y="0" width="2" height="20" />
                      <rect x="62" y="0" width="1" height="20" />
                      <rect x="65" y="0" width="4" height="20" />
                      <rect x="71" y="0" width="1" height="20" />
                      <rect x="74" y="0" width="2" height="20" />
                      <rect x="78" y="0" width="3" height="20" />
                      <rect x="83" y="0" width="1" height="20" />
                      <rect x="86" y="0" width="2" height="20" />
                      <rect x="90" y="0" width="4" height="20" />
                      <rect x="96" y="0" width="2" height="20" />
                    </svg>
                    <span className="text-[7.5px] text-muted tracking-[0.25em] font-mono select-none">REF-{selectedBooking.roomNumber}-{selectedBooking.id}</span>
                  </div>
                </div>

                {/* Footer Action buttons inside modal */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      window.print();
                      triggerToast("Folio receipt printed!");
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 border border-border bg-surface hover:bg-surface-inset text-foreground rounded-xl text-xs font-bold transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <FiPrinter size={15} /> Print Invoice
                  </button>

                  {selectedBooking.status === "active" && (
                    <button
                      onClick={() => handleCheckout(selectedBooking.id, selectedBooking.roomNumber)}
                      className="flex-[1.5] flex items-center justify-center gap-2 py-3.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <FiCheckCircle size={15} /> Complete Check-Out
                    </button>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </>
  );
}
