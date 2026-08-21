"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiSun, FiMoon, FiArrowRight, FiUser, FiLock, FiInfo } from "react-icons/fi";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "next-themes";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);

  const { login } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Hydrate lockout from localStorage if present
    const lockedUntil = localStorage.getItem("login_lockout_until");
    if (lockedUntil) {
      const timeLeft = Math.ceil((Number(lockedUntil) - Date.now()) / 1000);
      if (timeLeft > 0) {
        setLockoutTime(timeLeft);
        setAttempts(3);
        setError("Too many login attempts. Locked out.");
      } else {
        localStorage.removeItem("login_lockout_until");
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        setLockoutTime((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            localStorage.removeItem("login_lockout_until");
            setAttempts(0);
            setError("");
            return 0;
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTime > 0) return;

    if (username.trim() === "admin" && password === "admin") {
      login("Administrator", "admin");
      localStorage.removeItem("login_lockout_until");
      router.push("/dashboard");
    } else {
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      if (nextAttempts >= 3) {
        const lockoutDuration = 30; // 30 seconds lockout
        const until = Date.now() + lockoutDuration * 1000;
        localStorage.setItem("login_lockout_until", String(until));
        setLockoutTime(lockoutDuration);
        setError("Too many login attempts. Blocked for 30 seconds.");
      } else {
        setError(`Invalid credentials. ${3 - nextAttempts} attempts remaining.`);
      }
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4 sm:p-6 select-none">
      
      {/* Decorative ambient glowing blur spots in background */}
      <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Floating Theme Toggle (Top Right) */}
      {mounted && (
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/80 transition-all bg-surface hover:bg-surface-inset shadow-xs cursor-pointer hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <FiSun size={16} className="text-primary" />
            ) : (
              <FiMoon size={16} className="text-[#0B0F19]" />
            )}
          </button>
        </div>
      )}

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[400px] rounded-[32px] border border-border/60 bg-surface p-8 sm:p-10 shadow-2xl glass-panel animate-float">
        
        {/* Brand/Security Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-black text-base shadow-md">
            HQ
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-foreground">
              Console Sign In
            </h2>
            <p className="mt-1.5 text-xs text-muted font-medium max-w-[280px] mx-auto leading-relaxed">
              Enter your administrative credentials to manage operations.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5 mt-8">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/25 p-3.5 text-xs font-bold text-red-500 flex items-center gap-2">
              <FiInfo size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-muted">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted">
                <FiUser size={15} />
              </div>
              <input
                type="text"
                required
                disabled={lockoutTime > 0}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border pl-10 pr-4 py-3.5 text-xs font-bold outline-none transition-all focus:border-zinc-400 dark:focus:border-zinc-500 bg-surface-inset/40 border-border/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter admin username"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="block text-[9px] font-extrabold uppercase tracking-widest text-muted">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted">
                <FiLock size={15} />
              </div>
              <input
                type="password"
                required
                disabled={lockoutTime > 0}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border pl-10 pr-4 py-3.5 text-xs font-bold outline-none transition-all focus:border-zinc-400 dark:focus:border-zinc-500 bg-surface-inset/40 border-border/80 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter admin password"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={lockoutTime > 0}
            className="group w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-black text-white transition-all bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 active:scale-[0.98] shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{lockoutTime > 0 ? `Locked Out (${lockoutTime}s)` : "Sign In to Console"}</span>
            {lockoutTime === 0 && (
              <FiArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            )}
          </button>
        </form>

        {/* Footer branding */}
        <div className="mt-8 text-center font-mono text-[9px] text-muted tracking-wide">
          Gravity Systems Console • Admin Session
        </div>
        
      </div>
      
    </div>
  );
}
