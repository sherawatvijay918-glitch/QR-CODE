"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import ThemeToggle from "./ThemeToggle";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  LogOut,
  Settings,
  Home,
  UtensilsCrossed,
  MapPin,
  MessageSquare,
  Command,
  Sparkles,
  SearchIcon,
  X
} from "lucide-react";

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  manager: "General Manager",
  kitchen: "Kitchen Staff",
  waiter: "Waiter Staff",
};

export default function Topbar({ title }: { title: string }) {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const formatted = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    setCurrentTime(formatted);

    // Keyboard shortcut for Command Palette
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const firstLetter = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const triggerOpenPosKot = () => {
    if (pathname === "/dashboard/orders") {
      window.dispatchEvent(new CustomEvent("open-pos-modal"));
    } else if (pathname === "/dashboard/rough-orders") {
      window.dispatchEvent(new CustomEvent("open-rough-pos-modal"));
    } else {
      router.push("/dashboard/orders?openKot=true");
    }
  };

  const triggerOpenBooking = () => {
    router.push("/dashboard/rooms");
  };

  // Commands search items
  const commands = [
    { label: "Go to Rooms Hub", href: "/dashboard/rooms", category: "Navigation" },
    { label: "Open KOT Orders Hub", href: "/dashboard/orders", category: "Navigation" },
    { label: "Dining Tables Overview", href: "/dashboard/tables", category: "Navigation" },
    { label: "New POS Order (KOT)", action: triggerOpenPosKot, category: "Actions" },
    { label: "Check-In New Guest", action: triggerOpenBooking, category: "Actions" },
    { label: "Configure ERP settings", href: "/dashboard/settings", category: "Management" }
  ];

  const filteredCommands = commands.filter(c =>
    c.label.toLowerCase().includes(commandSearch.toLowerCase())
  );

  return (
    <>
      <header
        className="sticky top-0 z-20 w-full px-6 py-4 transition-all duration-300 backdrop-blur-md bg-opacity-70 bg-background border-b border-border/40"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Breadcrumbs & Multi-Selectors Group */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted font-bold select-none">
              <span className="hover:text-primary transition-colors cursor-pointer">ERP</span>
              <ChevronRight size={10} strokeWidth={3} className="text-muted/65" />
              <span className="text-foreground">{title}</span>
            </div>
          </div>

          {/* Right Actions Block */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-4 select-none w-full md:w-auto min-w-0 flex-1 md:flex-initial">
            
            {/* Date visual */}
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted bg-surface-inset/30 px-3 py-1 rounded-xl border border-border/30">
              <Calendar size={13} strokeWidth={2} className="text-primary/70" />
              <span>{currentTime}</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={triggerOpenPosKot}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all px-4 py-2 text-xs font-bold cursor-pointer shadow-md active:scale-[0.98]"
              >
                <Plus size={13} strokeWidth={2} />
                <span>Add KOT</span>
              </button>
              <button
                onClick={triggerOpenBooking}
                className="flex items-center gap-1.5 rounded-xl bg-foreground hover:opacity-90 active:scale-[0.98] transition-all text-background px-4 py-2 text-xs font-bold cursor-pointer shadow-sm"
              >
                <Plus size={13} strokeWidth={2} />
                <span>Add Booking</span>
              </button>
            </div>

            {/* DIVIDER */}
            <div className="hidden md:block h-5 w-[1px] bg-border/60" />

            {/* SECONDARY CONTROLS GROUP */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Command Palette search box button */}
              <button
                onClick={() => setIsCommandOpen(true)}
                className="flex items-center justify-between w-36 rounded-xl border border-border/80 px-3 py-1.5 text-left text-[11px] text-muted hover:text-foreground hover:bg-surface-inset/50 transition-all font-medium cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Search size={12} strokeWidth={2} />
                  <span>Search...</span>
                </div>
                <div className="flex items-center gap-0.5 text-[9px] bg-surface-inset border border-border/80 px-1 py-0.5 rounded-md font-mono shrink-0 font-bold">
                  <Command size={8} />K
                </div>
              </button>

              {/* Live status Pulse indicator */}
              <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl text-[10px] font-bold border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-mono tracking-wider uppercase text-[9px]">Live Sync</span>
              </div>

              {/* Messaging inbox Icon */}
              <button
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-border/70 bg-surface/50 hover:bg-surface-inset/70 text-muted hover:text-foreground transition-all cursor-pointer shadow-inner"
                aria-label="Inboxes"
              >
                <MessageSquare size={14} strokeWidth={2} />
                <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              </button>

              {/* Notification bell */}
              <button
                className="relative flex h-8.5 w-8.5 items-center justify-center rounded-xl border border-border/70 bg-surface/50 hover:bg-surface-inset/70 text-muted hover:text-foreground transition-all cursor-pointer shadow-inner"
                aria-label="System notifications"
              >
                <Bell size={14} strokeWidth={2} />
                <span className="absolute top-2 right-2 block h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
              </button>

              {/* Theme switcher */}
              <ThemeToggle />

              {/* User profile dropdown triggers */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-1 cursor-pointer p-0.5 rounded-xl hover:bg-surface-inset/60 transition-colors border border-transparent hover:border-border/30"
                  >
                    <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-zinc-800 text-white font-extrabold text-[11px] shadow-sm border border-zinc-700/50">
                      {firstLetter}
                    </div>
                    <ChevronDown size={11} className="text-muted" />
                  </button>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                      <div
                        className="absolute right-0 mt-2.5 w-52 rounded-2xl border p-1.5 shadow-xl z-50 animate-fade-in font-sans glass-panel"
                      >
                        <div className="px-3 py-2.5 border-b border-border/40 mb-1.5">
                          <p className="text-[11px] font-extrabold text-foreground truncate">{user.name}</p>
                          <p className="text-[9px] text-muted truncate mt-1.5 uppercase tracking-widest font-mono font-bold">
                            {ROLE_LABEL[user.role] || user.role}
                          </p>
                        </div>

                        <Link
                          href="/dashboard/settings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-foreground/80 hover:text-foreground hover:bg-surface-inset transition-colors"
                        >
                          <Settings size={14} />
                          <span>System Settings</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Logout Console</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Command Palette Modal redrawn to 2027 design specs */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-md p-4">
          <div className="fixed inset-0" onClick={() => setIsCommandOpen(false)} />
          <div className="relative w-full max-w-lg rounded-3xl border border-border bg-surface p-5 shadow-2xl z-50 glass-panel animate-float max-h-[420px] flex flex-col">
            
            {/* Command Input Header */}
            <div className="flex items-center gap-3 border-b border-border/60 pb-3">
              <Sparkles size={16} className="text-primary animate-pulse" />
              <input
                type="text"
                placeholder="Type a command or search modules..."
                value={commandSearch}
                onChange={(e) => setCommandSearch(e.target.value)}
                className="flex-1 bg-transparent border-none text-sm outline-none text-foreground placeholder:text-muted/70 font-semibold"
                autoFocus
              />
              <button 
                onClick={() => setIsCommandOpen(false)}
                className="h-6 w-6 rounded-lg bg-surface-inset border border-border flex items-center justify-center text-muted hover:text-foreground hover:scale-105 active:scale-95 cursor-pointer"
              >
                <X size={12} />
              </button>
            </div>

            {/* Command Results */}
            <div className="flex-1 overflow-y-auto pt-3.5 pr-1 space-y-3.5">
              {filteredCommands.length > 0 ? (
                <div>
                  <div className="text-[9px] font-extrabold uppercase text-muted tracking-widest px-2 mb-2 font-mono">
                    Actions & Quick Commands
                  </div>
                  <div className="space-y-1">
                    {filteredCommands.map((cmd, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setIsCommandOpen(false);
                          if (cmd.action) cmd.action();
                          else if (cmd.href) router.push(cmd.href);
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold text-foreground/80 hover:text-primary hover:bg-primary/5 transition-all text-left cursor-pointer border border-transparent hover:border-primary/10"
                      >
                        <div className="flex items-center gap-2">
                          <Command size={12} className="text-muted" />
                          <span>{cmd.label}</span>
                        </div>
                        <span className="text-[9px] text-muted font-bold font-mono px-2 py-0.5 rounded-md bg-surface-inset border border-border/60">{cmd.category}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-muted font-medium">
                  No commands match your query.
                </div>
              )}
            </div>

            {/* Command Palette Footer */}
            <div className="border-t border-border/50 pt-3 flex items-center justify-between text-[9px] text-muted font-mono font-bold">
              <span>Press <kbd className="border border-border/70 px-1 py-0.5 rounded-md bg-surface-inset">ESC</kbd> to close</span>
              <span>Use arrow keys to navigate</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
