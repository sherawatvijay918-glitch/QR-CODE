"use client";

import { IconType } from "react-icons";

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: IconType | any;
  accent?: string;
  status?: "pending" | "preparing" | "ready" | "delivered" | "error";
}

export default function StatCard({
  label,
  value,
  sub,
  icon,
  accent = "var(--primary)",
  status = "pending"
}: StatCardProps) {
  const isDark = typeof window !== 'undefined' && document.documentElement?.classList?.contains('dark');

  // Enhanced status styling
  const statusClasses = {
    pending: 'text-amber-600',
    preparing: 'text-blue-500',
    ready: 'text-emerald-500',
    delivered: 'text-violet-500',
    error: 'text-red-500'
  };

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border p-6 transition-all duration-350 hover:-translate-y-3 hover:shadow-lg hover:shadow-primary/30 border-primary/20 bg-surface-variant hover:border-primary/40"
      style={{
        backgroundColor: status === "pending" ? "rgba(251, 191, 36, 0.05)" :
                         status === "preparing" ? "rgba(59, 130, 246, 0.05)" :
                         status === "ready" ? "rgba(52, 211, 153, 0.05)" :
                         status === "delivered" ? "rgba(167, 139, 250, 0.05)" :
                         "var(--surface)",
        borderColor: status === "pending" ? "rgba(251, 191, 36, 0.2)" :
                    status === "preparing" ? "rgba(59, 130, 246, 0.2)" :
                    status === "ready" ? "rgba(52, 211, 153, 0.2)" :
                    status === "delivered" ? "rgba(167, 139, 250, 0.2)" : "var(--border)",
      }}
    >
      {/* Enhanced hover effect */}
      <div className="absolute top-0 left-0 right-0 h-1 transition-all duration-350 group-hover:animate-pulse"
           style={{
             background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`
           }} />

      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          {/* Enhanced label styling */}
          <p className="text-[9px] font-bold uppercase tracking-wider text-muted bg-primary-light px-3 py-1 rounded-full border border-primary-light/20 mb-1.5">
            {label}
          </p>

          {/* Enhanced metric value with proper sizing */}
          <p className="font-display text-2xl font-extrabold text-foreground tracking-tight capitalize mb-1.5">
            {value}
          </p>

          {/* Enhanced subtext styling */}
          {sub && (
            <p className="text-[10px] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex items-center justify-center">
                <span className={`flex items-center justify-center h-2.5 w-2 rounded-full ${sub.toLowerCase() === 'green' ? 'bg-emerald-400' : sub.toLowerCase() === 'amber' ? 'bg-amber-400' : sub.toLowerCase() === 'blue' ? 'bg-blue-400' : sub.toLowerCase() === 'violet' ? 'bg-violet-400' : 'bg-red-400'}`}></span>
              </span>
              <span className="font-medium text-[10px]">
                {sub}
              </span>
            </p>
          )}
        </div>

        {/* Enhanced icon container */}
        <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-350 group-hover:scale-105 shadow-sm hover:shadow-md group-hover:shadow-primary/50 text-primary group-hover:text-accent">
          <div className="flex items-center justify-center">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}