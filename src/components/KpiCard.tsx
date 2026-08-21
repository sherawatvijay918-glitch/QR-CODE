"use client";

import { ReactNode } from "react";

interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: ReactNode;
  gradient?: boolean;
  onClick?: () => void;
}

export default function KpiCard({
  label,
  value,
  change,
  positive = true,
  icon,
  gradient = false,
  onClick,
}: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300
                 hover:-translate-y-1 hover:shadow-lg cursor-pointer select-none"
      style={{
        background: gradient
          ? "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)"
          : "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
      }}
    >
      {/* Top gradient bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, var(--accent) 0%, var(--primary) 100%)`,
        }}
      />

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p
            className="text-[10px] font-bold uppercase tracking-wider text-muted bg-silver-200 px-2 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: "rgba(108, 117, 125, 0.08)" }}
          >
            {label}
          </p>
          <h3
            className="text-xl font-black text-foreground tracking-tight mb-1"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {value}
          </h3>
          {change && (
            <span
              className={`text-[11px] font-bold ${
                positive ? "text-emerald-600" : "text-rose-500"
              }`}
            >
              {change}
            </span>
          )}
        </div>

        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft border border-accent/20"
          style={{
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            borderColor: "rgba(245, 158, 11, 0.2)",
          }}
        >
          <div style={{ color: "var(--accent)" }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}