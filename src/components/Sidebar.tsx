"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";
import { Role } from "@/lib/types";
import {
  TbSmartHome,
  TbKey,
  TbCalendarStats,
  TbReceipt,
  TbToolsKitchen2,
  TbBook,
  TbDiscount,
  TbNotebook,
  TbHistory,
  TbSettings,
  TbLogout,
  TbChevronLeft,
  TbChevronRight,
  TbSearch
} from "react-icons/tb";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badge?: string;
}

interface CategoryGroup {
  name: string;
  items: NavItem[];
}

const SIDEBAR_GROUPS: CategoryGroup[] = [
  {
    name: "Menu",
    items: [
      { href: "/dashboard", label: "Home", icon: TbSmartHome },
      { href: "/dashboard/rooms", label: "Rooms", icon: TbKey },
      { href: "/dashboard/bookings", label: "Bookings Ledger", icon: TbCalendarStats },
      { href: "/dashboard/orders", label: "QR Orders Desk", icon: TbReceipt, badge: "Live" },
      { href: "/dashboard/tables", label: "Dining Tables", icon: TbToolsKitchen2 },
      { href: "/dashboard/menu", label: "Menu Catalogue", icon: TbBook },
    ],
  },
  {
    name: "Discovery",
    items: [
      { href: "/dashboard/campaign", label: "Coupons & Offers", icon: TbDiscount },
      { href: "/dashboard/rough-orders", label: "Rough Book (Udhar)", icon: TbNotebook },
      { href: "/dashboard/orders/history", label: "All Orders History", icon: TbHistory },
    ],
  },
];

const ROLE_LABEL_WIDGET: Record<string, string> = {
  admin: "System Admin",
  manager: "General Manager",
  kitchen: "Executive Chef",
  waiter: "Dining Floor Supervisor",
};

export default function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  // Neumorphic Shadow Presets
  const sidebarShadow = isDark
    ? "6px 0px 20px rgba(0, 0, 0, 0.45)"
    : "9px 9px 24px rgba(163, 177, 198, 0.45), -9px -9px 24px rgba(255, 255, 255, 0.85)";

  const logoShadow = isDark
    ? "2px 2px 5px rgba(0, 0, 0, 0.4), -2px -2px 5px rgba(255, 255, 255, 0.05)"
    : "4px 4px 8px rgba(163, 177, 198, 0.3), -4px -4px 8px rgba(255, 255, 255, 0.9)";

  const itemHoverInsetShadow = isDark
    ? "inset 3px 3px 6px rgba(0, 0, 0, 0.5), inset -3px -3px 6px rgba(255, 255, 255, 0.04)"
    : "inset 3px 3px 6px rgba(163, 177, 198, 0.35), inset -3px -3px 6px rgba(255, 255, 255, 0.8)";

  const searchInputInsetShadow = isDark
    ? "inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(255, 255, 255, 0.03)"
    : "inset 3px 3px 5px rgba(163, 177, 198, 0.3), inset -3px -3px 5px rgba(255, 255, 255, 0.8)";

  const toggleBtnShadow = isDark
    ? "3px 3px 6px rgba(0, 0, 0, 0.45), -3px -3px 6px rgba(255, 255, 255, 0.02)"
    : "4px 4px 8px rgba(163, 177, 198, 0.35), -4px -4px 8px rgba(255, 255, 255, 0.85)";

  // Filter items by search query
  const getFilteredGroups = () => {
    return SIDEBAR_GROUPS.map((group) => {
      const items = group.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      );
      return { ...group, items };
    }).filter((group) => group.items.length > 0);
  };

  const filteredGroups = getFilteredGroups();

  return (
    <div
      className="hidden md:flex md:sticky md:top-0 md:h-screen z-40 select-none transition-all duration-300 shrink-0"
      style={{
        width: isCollapsed ? "96px" : "280px",
        padding: "16px 8px 16px 16px",
        backgroundColor: isDark ? "#0B0F19" : "#EDF1F5",
      }}
    >
      <aside
        className="flex flex-col h-full w-full relative transition-all duration-300 rounded-[32px] border overflow-hidden"
        style={{
          backgroundColor: isDark ? "#0F1319" : "#EDF1F5",
          borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.7)",
          boxShadow: sidebarShadow,
        }}
      >
        {/* Logo and Collapse Area */}
        <div
          className={`flex items-center justify-between shrink-0 ${
            isCollapsed ? "flex-col gap-5 pt-8" : "px-6 pt-8 pb-4"
          }`}
        >
          {/* Logo Widget */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md bg-white dark:bg-[#151922] font-black text-[#123B63] dark:text-[#2563EB] text-base select-none border"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(163,177,198,0.2)",
                boxShadow: logoShadow,
              }}
            >
              HQ
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-xs font-black tracking-tight text-slate-800 dark:text-white uppercase leading-none">
                  Gravity ERP
                </h1>
                <p className="text-[8px] text-[#123B63] dark:text-[#2563EB] font-extrabold tracking-widest uppercase mt-0.5">
                  MANAGEMENT SUITE
                </p>
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-7.5 w-7.5 items-center justify-center rounded-xl transition-all duration-200 border cursor-pointer hover:scale-105 active:scale-95 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-[#EDF1F5] dark:bg-[#0F1319]"
            style={{
              borderColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.7)",
              boxShadow: toggleBtnShadow,
            }}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <TbChevronRight size={16} />
            ) : (
              <TbChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* Search Box - Inset Neumorphic */}
        {!isCollapsed && (
          <div className="px-5 mb-5 mt-2 shrink-0">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <TbSearch size={14} />
              </div>
              <input
                type="text"
                placeholder="Quick search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border pl-8.5 pr-3 py-2 text-[11px] outline-none transition-all duration-200 placeholder-slate-400 text-slate-800 dark:text-slate-200 font-bold"
                style={{
                  backgroundColor: isDark ? "#0A0D14" : "#E8ECF0",
                  borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(163,177,198,0.2)",
                  boxShadow: searchInputInsetShadow,
                }}
              />
            </div>
          </div>
        )}

        {/* Divider */}
        {!isCollapsed && <div className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800/60 shrink-0 mb-4" />}

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto scrollbar-none pr-1 select-none">
          <div className="space-y-5 px-4 pb-4">
            {filteredGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                {/* Group Heading */}
                {!isCollapsed && (
                  <div className="px-3.5 mb-1 select-none">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                      {group.name}
                    </span>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1.5">
                  {group.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;
                    const isHovered = hoveredItem === item.href;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onMouseEnter={() => setHoveredItem(item.href)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`group flex items-center justify-between rounded-2xl transition-all duration-300 cursor-pointer ${
                          isCollapsed ? "h-12 w-12 justify-center mx-auto" : "px-3.5 py-2 text-xs"
                        }`}
                        style={{
                          backgroundColor: active
                            ? (isDark ? "#2563EB" : "#123B63")
                            : (isHovered ? (isDark ? "#0F1319" : "#EDF1F5") : "transparent"),
                          color: active ? "#FFFFFF" : (isDark ? "#9CA3AF" : "#4B5563"),
                          boxShadow: active
                            ? "0 4px 12px rgba(37, 99, 255, 0.3)"
                            : (isHovered ? itemHoverInsetShadow : "none"),
                        }}
                      >
                        <div className="flex items-center gap-3.5 truncate">
                          {/* Neumorphic Icon Container */}
                          <div
                            className="h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all duration-300 border shrink-0"
                            style={{
                              backgroundColor: active
                                ? "rgba(255, 255, 255, 0.15)"
                                : (isHovered
                                    ? (isDark ? "#10141D" : "#EDF1F5")
                                    : (isDark ? "#141922" : "#E8ECF0")),
                              borderColor: active
                                ? "rgba(255, 255, 255, 0.15)"
                                : (isDark ? "rgba(255,255,255,0.03)" : "rgba(163,177,198,0.25)"),
                              boxShadow: active
                                ? "none"
                                : (isHovered
                                    ? "inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.05)"
                                    : "3px 3px 6px rgba(163, 177, 198, 0.35), -3px -3px 6px rgba(255, 255, 255, 0.8)"),
                            }}
                          >
                            <Icon
                              size={18}
                              strokeWidth={1.8}
                              className={`transition-all duration-300 ${
                                active
                                  ? "text-white"
                                  : (isHovered
                                      ? "text-[#123B63] dark:text-[#2563EB] scale-110"
                                      : "text-slate-500 dark:text-slate-400")
                              }`}
                            />
                          </div>
                          {!isCollapsed && (
                            <span className={`truncate font-extrabold tracking-wide ${active ? "text-white" : ""}`}>
                              {item.label}
                            </span>
                          )}
                        </div>

                        {/* Badges / Indicators */}
                        {!isCollapsed && item.badge && (
                          <span
                            className="inline-flex rounded-lg text-[9px] font-black px-1.5 py-0.5 select-none uppercase tracking-wider animate-pulse"
                            style={{
                              backgroundColor: active ? "rgba(255,255,255,0.2)" : (isDark ? "rgba(229,9,20,0.15)" : "rgba(184,29,36,0.1)"),
                              color: active ? "#FFFFFF" : (isDark ? "#E50914" : "#B81D24"),
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* Divider */}
        <div className="mx-5 h-[1px] bg-slate-200 dark:bg-slate-800/60 shrink-0 mt-2 mb-2" />

        {/* Footer Area - Profile, Settings & Logout */}
        <div className="shrink-0 select-none pb-4 pt-1">
          <div className="space-y-1.5 px-4">
            {/* System Settings Link */}
            {(() => {
              const active = pathname === "/dashboard/settings";
              const isHovered = hoveredItem === "/dashboard/settings";
              return (
                <Link
                  href="/dashboard/settings"
                  onMouseEnter={() => setHoveredItem("/dashboard/settings")}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`group flex items-center justify-between rounded-2xl transition-all duration-300 cursor-pointer ${
                    isCollapsed ? "h-12 w-12 justify-center mx-auto" : "px-3.5 py-2 text-xs"
                  }`}
                  style={{
                    backgroundColor: active
                      ? (isDark ? "#E50914" : "#B81D24")
                      : (isHovered ? (isDark ? "#0F1319" : "#EDF1F5") : "transparent"),
                    color: active ? "#FFFFFF" : (isDark ? "#9CA3AF" : "#4B5563"),
                    boxShadow: active
                      ? "0 4px 12px rgba(184,29,36,0.25)"
                      : (isHovered ? itemHoverInsetShadow : "none"),
                  }}
                >
                  <div className="flex items-center gap-3.5 truncate">
                    {/* Neumorphic Icon Container */}
                    <div
                      className="h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all duration-300 border shrink-0"
                      style={{
                        backgroundColor: active
                          ? "rgba(255, 255, 255, 0.15)"
                          : (isHovered
                              ? (isDark ? "#10141D" : "#EDF1F5")
                              : (isDark ? "#141922" : "#E8ECF0")),
                        borderColor: active
                          ? "rgba(255, 255, 255, 0.15)"
                          : (isDark ? "rgba(255,255,255,0.03)" : "rgba(163,177,198,0.25)"),
                        boxShadow: active
                          ? "none"
                          : (isHovered
                              ? "inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.05)"
                              : "3px 3px 6px rgba(163, 177, 198, 0.35), -3px -3px 6px rgba(255, 255, 255, 0.8)"),
                      }}
                    >
                      <TbSettings
                        size={18}
                        strokeWidth={1.8}
                        className={`transition-all duration-300 ${
                          active
                            ? "text-white"
                            : (isHovered
                                ? "text-[#B81D24] dark:text-[#E50914] scale-110"
                                : "text-slate-500 dark:text-slate-400")
                        }`}
                      />
                    </div>
                    {!isCollapsed && (
                      <span className={`truncate font-extrabold tracking-wide ${active ? "text-white" : ""}`}>
                        Settings
                      </span>
                    )}
                  </div>
                </Link>
              );
            })()}

            {/* Logout Panel */}
            <button
              onClick={logout}
              onMouseEnter={() => setHoveredItem("logout")}
              onMouseLeave={() => setHoveredItem(null)}
              className={`group w-full flex items-center rounded-2xl transition-all duration-300 cursor-pointer text-[#B81D24] dark:text-[#E50914] ${
                isCollapsed ? "h-12 w-12 justify-center mx-auto" : "px-3.5 py-2 text-xs"
              }`}
              style={{
                backgroundColor: hoveredItem === "logout" ? (isDark ? "#0F1319" : "#EDF1F5") : "transparent",
                boxShadow: hoveredItem === "logout" ? itemHoverInsetShadow : "none",
              }}
              aria-label="Logout"
            >
              <div className="flex items-center gap-3.5 truncate">
                {/* Neumorphic Icon Container */}
                <div
                  className="h-8.5 w-8.5 rounded-xl flex items-center justify-center transition-all duration-300 border shrink-0"
                  style={{
                    backgroundColor: hoveredItem === "logout"
                      ? (isDark ? "#10141D" : "#EDF1F5")
                      : (isDark ? "#141922" : "#E8ECF0"),
                    borderColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(163,177,198,0.25)",
                    boxShadow: hoveredItem === "logout"
                      ? "inset 2px 2px 5px rgba(0, 0, 0, 0.4), inset -2px -2px 5px rgba(255, 255, 255, 0.05)"
                      : "3px 3px 6px rgba(163, 177, 198, 0.35), -3px -3px 6px rgba(255, 255, 255, 0.8)",
                  }}
                >
                  <TbLogout size={18} strokeWidth={1.8} className="shrink-0 text-[#B81D24] dark:text-[#E50914]" />
                </div>
                {!isCollapsed && <span className="font-extrabold tracking-wide">Log out</span>}
              </div>
            </button>
          </div>
        </div>

      </aside>
    </div>
  );
}
