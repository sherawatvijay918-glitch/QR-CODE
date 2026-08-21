"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";
import { registerOrderListener } from "@/lib/order-dispatcher";
import { playSynthesizedSound, SoundType } from "@/lib/sound-alerts";
import { menuItems, rooms, tables } from "@/lib/dummy-data";
import { dispatchNewOrder } from "@/lib/order-dispatcher";
import { Order } from "@/lib/types";
import { FiBell } from "react-icons/fi";

function triggerLayoutSimulation() {
  const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
  const randomTable = tables[Math.floor(Math.random() * tables.length)];
  const useRoom = Math.random() > 0.5;
  const destLabel = useRoom ? `Room ${randomRoom.number}` : randomTable.number;
  const destType = useRoom ? "room" : "table";

  const itemsCount = Math.floor(1 + Math.random() * 2);
  const orderItems = [];
  let total = 0;

  for (let i = 0; i < itemsCount; i++) {
    const item = menuItems[Math.floor(Math.random() * menuItems.length)];
    const qty = Math.floor(1 + Math.random() * 2);
    orderItems.push({
      id: item.id,
      name: item.name,
      qty,
      price: item.price,
      veg: true,
    });
    total += item.price * qty;
  }

  const mockOrder: Order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    sourceType: destType,
    sourceLabel: destLabel,
    items: orderItems,
    status: "pending",
    placedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    total,
  };

  dispatchNewOrder(mockOrder);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeToast, setActiveToast] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && !user) {
      router.replace("/login");
    }
  }, [isMounted, loading, user, router]);

  // Global New KOT sound listener
  useEffect(() => {
    const unregister = registerOrderListener((order) => {
      let enabled = true;
      let volume = 0.8;
      let tone: SoundType = "alarm";

      // Load settings
      const stored = localStorage.getItem("hotelqr_settings");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.soundEnabled !== undefined) enabled = parsed.soundEnabled;
          if (parsed.soundVolume !== undefined) volume = parsed.soundVolume;
          if (parsed.soundType !== undefined) tone = parsed.soundType;
        } catch {}
      }

      if (enabled) {
        playSynthesizedSound(tone, volume);
      }

      // Show floating notification toast in the sidebar area
      setActiveToast(`New KOT: ${order.sourceLabel} placed a ₹${order.total} order!`);
      setTimeout(() => setActiveToast(null), 4000);
    });

    return () => unregister();
  }, []);

  // Global Simulation interval controller
  useEffect(() => {
    let intervalId: any = null;

    const startSimulation = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        triggerLayoutSimulation();
      }, 35000); // Auto simulation every 35 seconds
    };

    const stopSimulation = () => {
      if (intervalId) clearInterval(intervalId);
    };

    // Check current state on mount
    const stored = localStorage.getItem("hotelqr_settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.autoSimulate) {
          startSimulation();
        }
      } catch {}
    }

    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        startSimulation();
      } else {
        stopSimulation();
      }
    };

    window.addEventListener("toggle-simulation", handleToggle);

    return () => {
      if (intervalId) clearInterval(intervalId);
      window.removeEventListener("toggle-simulation", handleToggle);
    };
  }, []);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative bg-background">
      <Sidebar role={user.role} />
      <div className="flex min-w-0 flex-1 flex-col relative">
        {children}

        {/* Dynamic Float Toast alert overlay - Blue theme */}
        {activeToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#123B63] text-white border border-[#2F80C0]/30 px-5 py-4 rounded-md shadow-md flex items-center gap-3 max-w-sm">
            <div className="h-8 w-8 rounded-md bg-[#2F80C0] flex items-center justify-center text-white shrink-0">
              <FiBell className="animate-pulse" size={15} />
            </div>
            <div className="text-xs font-medium leading-normal pr-2">
              {activeToast}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}