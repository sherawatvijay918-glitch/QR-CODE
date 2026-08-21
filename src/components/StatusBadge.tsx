import { OrderStatus } from "@/lib/types";
import { ReactNode } from "react";

const STATUS_CONFIG: Record<OrderStatus | "cancelled", { label: string; color: string; bg: string }> = {
  pending: { label: "Pending", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  preparing: { label: "Preparing", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)" },
  ready: { label: "Ready", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  delivered: { label: "Served", color: "#8b5cf6", bg: "rgba(139, 92, 246, 0.12)" },
  cancelled: { label: "Cancelled", color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
};

const STATUS_ICONS: Record<OrderStatus | "cancelled", ReactNode> = {
  pending: (
    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 16 16">
      <circle cx="8" cy="8" r="5" />
    </svg>
  ),
  preparing: (
    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 0a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h1z" />
    </svg>
  ),
  ready: (
    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 16 16">
      <path d="M12 10.93A4.001 4.001 0 0 1 8 15a4.001 4.001 0 0 1-4.93-7.07h9.86z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  delivered: (
    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m3.646-8.54L7.207 8.207a.5.5 0 0 0 0 .858l3 3 .858-.858a.5.5 0 0 0-.858-.858L8 9.146V5.5a.5.5 0 0 0-1 0v4.646l-1.854-1.854a.5.5 0 0 0-.858.708l3 3" />
    </svg>
  ),
  cancelled: (
    <svg className="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 16 16">
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 5.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 6l2.647 2.646a.5.5 0 0 1-.708.708L8 7.707 5.354 9.354a.5.5 0 0 1-.708-.708L7.293 6 4.646 5.354a.5.5 0 0 1 0-.708" />
    </svg>
  ),
};

export default function StatusBadge({ status }: { status: OrderStatus | "cancelled" }) {
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
      style={{
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.color}20`,
      }}
    >
      <span className="flex h-3.5 w-3.5 items-center justify-center" style={{ color: cfg.color }}>
        {STATUS_ICONS[status]}
      </span>
      <span className="whitespace-nowrap">{cfg.label}</span>
    </span>
  );
}