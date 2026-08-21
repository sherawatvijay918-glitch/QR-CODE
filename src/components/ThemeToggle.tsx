"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-9 w-9 rounded-lg border animate-pulse"
        style={{ borderColor: "var(--border)", backgroundColor: "var(--surface)" }}
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20"
      style={{
        borderColor: isHovered ? "var(--primary)" : "var(--border)",
        backgroundColor: isHovered ? "var(--primary-light)" : "var(--surface)"
      }}
      aria-label="Toggle theme"
    >
      <div className="relative transition-transform duration-300">
        {isDark ? (
          <FiSun
            size={16}
            className="text-amber-500 transition-all duration-300"
            style={{
              filter: isHovered ? "drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))" : "none"
            }}
          />
        ) : (
          <FiMoon
            size={16}
            className="text-primary transition-all duration-300"
            style={{
              filter: isHovered ? "drop-shadow(0 0 8px rgba(30, 41, 59, 0.4))" : "none"
            }}
          />
        )}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            background: isDark ? "rgba(251, 191, 36, 0.1)" : "rgba(30, 41, 59, 0.05)",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease"
          }}
        />
      </div>
    </button>
  );
}
