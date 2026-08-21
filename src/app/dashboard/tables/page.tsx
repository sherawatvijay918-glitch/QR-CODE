"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import StatusBadge from "@/components/StatusBadge";
import { tables } from "@/lib/dummy-data";
import { FiPrinter, FiPlus, FiX, FiLink, FiCheck, FiUsers } from "react-icons/fi";
import { TbQrcode } from "react-icons/tb";
import Link from "next/link";
import { Order } from "@/lib/types";
import QrCodeSvg from "@/components/QrCodeSvg";

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  occupied: { bg: "var(--status-preparing-bg)", color: "var(--status-preparing)" },
  vacant: { bg: "var(--status-ready-bg)", color: "var(--status-ready)" },
  reserved: { bg: "var(--status-pending-bg)", color: "var(--status-pending)" },
};

export default function TablesPage() {
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to load orders for table page:", err);
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = new BroadcastChannel("hotel_orders_channel");
    channel.onmessage = () => {
      fetchOrders();
    };
    return () => channel.close();
  }, []);

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <>
      <Topbar title="Tables" />
      <main className="flex-1 space-y-6 p-6 md:p-8 max-w-7xl mx-auto w-full">
        {toast && (
          <div className="fixed top-20 right-8 text-white rounded-lg px-5 py-3 text-[13px] font-medium shadow-lg animate-float flex items-center gap-2 z-50 bg-primary">
            <FiCheck size={15} />
            {toast}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Dining Tables</h2>
            <p className="text-xs text-muted mt-1">
              {tables.length} active dining tables • Manage QR codes & real-time status
            </p>
          </div>
          <button
            className="flex items-center gap-2 rounded-xl bg-primary hover:bg-primary/90 px-4 py-2.5 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
          >
            <FiPlus size={14} /> Add Table
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tables.map((table) => {
            const hasActiveOrder = orders.some(
              (o) => o.sourceLabel === table.number && o.status !== "delivered"
            );
            const currentStatus = hasActiveOrder ? "occupied" : table.status;
            const style = STATUS_STYLE[currentStatus];
            return (
              <div
                key={table.id}
                className="glass-card glass-card-hover border-l-4 p-5"
                style={{ borderLeftColor: style.color }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-extrabold text-foreground tracking-tight">
                      {table.number}
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-muted mt-2 font-bold font-mono uppercase tracking-wider">
                      <FiUsers size={12} className="text-primary" /> {table.seats} seats capacity
                    </p>
                  </div>
                  <span
                    className="rounded-xl px-3 py-1 text-[9px] font-black uppercase tracking-widest font-mono border"
                    style={{
                      backgroundColor: style.bg,
                      color: style.color,
                      borderColor: `${style.color}15`,
                    }}
                  >
                    {table.status}
                  </span>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4 text-xs font-bold font-mono tracking-wide" style={{ borderColor: "var(--border)" }}>
                  <span className="text-muted uppercase text-[9px] tracking-widest">Served Today</span>
                  <span className="text-foreground text-sm font-black">{table.ordersToday}</span>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTable(table);
                      triggerToast(`QR Code for ${table.number} opened`);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border/80 bg-surface/50 hover:bg-surface-inset text-xs font-bold text-muted hover:text-foreground transition-all duration-200 cursor-pointer py-2"
                  >
                    <TbQrcode size={15} /> View QR Code
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center rounded-xl border border-border/80 bg-surface/50 hover:bg-surface-inset text-muted hover:text-foreground transition-colors cursor-pointer p-2"
                    aria-label="Print QR"
                  >
                    <FiPrinter size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Interactive QR Code Modal Visualizer */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-[24px] bg-surface p-6 shadow-2xl border border-border/60 glass-panel animate-float">

            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedTable(null);
                setCopied(false);
              }}
              className="absolute top-4 right-4 h-7 w-7 rounded-full flex items-center justify-center bg-surface-inset border border-border/60 text-muted hover:text-foreground hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <FiX size={14} />
            </button>

            {/* Modal Content */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 pt-2">
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
                Interactive QR Code
              </span>

              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                Ordering Scanner for {selectedTable.number}
              </h3>

              <p className="text-xs text-muted max-w-[240px] font-medium leading-relaxed">
                Scan to open the 100% vegetarian guest ordering menu.
              </p>

              {/* QR Vector Box */}
              <div className="p-4 bg-white border border-border/80 rounded-2xl shadow-sm">
                <QrCodeSvg value={`${window.location.origin}/order?id=${selectedTable.id}`} size={150} />
              </div>

              {/* URL details */}
              <div className="w-full space-y-2">
                <p className="text-[9px] font-extrabold text-muted uppercase tracking-widest font-mono">Simulator Link</p>
                <div className="flex items-center gap-2 bg-surface-inset border border-border/60 rounded-xl px-3.5 py-2 text-xs">
                  <span className="font-mono text-muted/95 select-all truncate max-w-[200px]">
                    /order?id={selectedTable.id}
                  </span>

                  <div className="flex items-center gap-1.5 ml-auto shrink-0">
                    <button
                      onClick={() => handleCopyLink(`${window.location.origin}/order?id=${selectedTable.id}`)}
                      className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
                      title="Copy URL"
                    >
                      {copied ? <FiCheck size={14} className="text-emerald-500" /> : <FiLink size={14} />}
                    </button>

                    <Link
                      href={`/order?id=${selectedTable.id}`}
                      target="_blank"
                      className="text-muted hover:text-primary transition-colors p-1 cursor-pointer"
                      title="Simulate Guest Ordering"
                    >
                      <TbQrcode size={15} />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 text-xs font-extrabold text-white rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all cursor-pointer shadow-md"
                >
                  Print Ticket
                </button>
                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setCopied(false);
                  }}
                  className="flex-1 border border-border/80 py-3 text-xs font-bold text-muted hover:text-foreground hover:bg-surface-inset rounded-xl transition-all cursor-pointer"
                  style={{ borderColor: "var(--border)" }}
                >
                  Dismiss
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
}