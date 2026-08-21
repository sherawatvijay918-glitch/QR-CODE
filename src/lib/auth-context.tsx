"use client";

import { createContext, useContext, ReactNode } from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Role } from "./types";
import { validateCredentials } from "./auth-service";

interface AuthUser {
  name: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (name: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);  // Explicitly define context

const STORAGE_KEY = "hotelqr_auth";
const SESSION_COOKIE = "hotelqr_session=authenticated; path=/; max-age=86400; SameSite=Strict; Secure; HttpOnly";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
        // Auto-restore the cookie if missing so existing sessions continue working on localhost
        if (!document.cookie.includes("hotelqr_session=authenticated")) {
          document.cookie = "hotelqr_session=authenticated; path=/; max-age=86400; SameSite=Lax";
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (name: string, password: string) => {
    try {
      const role = await validateCredentials(name, password);
      if (role) {
        const authUser = { name, role: role as Role };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        setUser(authUser);
        document.cookie = "hotelqr_session=authenticated; path=/; max-age=86400; SameSite=Lax";
        router.push("/dashboard");
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (err) {
      setError("Invalid credentials. Please try again.");
      throw err;
    }
  };

  const logout = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    // In session-based auth, server would need to invalidate the session
    // Client can't fully invalidate server-side sessions without server cooperation
    document.cookie = "hotelqr_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}