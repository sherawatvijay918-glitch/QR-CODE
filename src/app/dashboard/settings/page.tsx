"use client";

import { useState, useEffect } from "react";
import Topbar from "@/components/Topbar";
import { playSynthesizedSound, SoundType } from "@/lib/sound-alerts";
import { dispatchNewOrder } from "@/lib/order-dispatcher";
import { menuItems, rooms, tables } from "@/lib/dummy-data";
import { FiVolume2, FiBell, FiPlay, FiCpu, FiPlusCircle, FiCheck, FiInfo } from "react-icons/fi";
import { Order } from "@/lib/types";

export default function SettingsPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundVolume, setSoundVolume] = useState(0.8);
  const [soundType, setSoundType] = useState<SoundType>("alarm");
  const [autoSimulate, setAutoSimulate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("hotelqr_settings");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
          if (parsed.soundVolume !== undefined) setSoundVolume(parsed.soundVolume);
          if (parsed.soundType !== undefined) setSoundType(parsed.soundType);
          if (parsed.autoSimulate !== undefined) setAutoSimulate(parsed.autoSimulate);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // Save settings helper
  const saveSettings = (enabled: boolean, vol: number, tone: SoundType, sim: boolean) => {
    localStorage.setItem(
      "hotelqr_settings",
      JSON.stringify({ soundEnabled: enabled, soundVolume: vol, soundType: tone, autoSimulate: sim })
    );
  };

  const handleSoundToggle = (val: boolean) => {
    setSoundEnabled(val);
    saveSettings(val, soundVolume, soundType, autoSimulate);
  };

  const handleVolumeChange = (val: number) => {
    setSoundVolume(val);
    saveSettings(soundEnabled, val, soundType, autoSimulate);
  };

  const handleTypeChange = (val: SoundType) => {
    setSoundType(val);
    saveSettings(soundEnabled, soundVolume, val, autoSimulate);
    // Play test immediately
    playSynthesizedSound(val, soundVolume);
  };

  const handleAutoSimulateToggle = (val: boolean) => {
    setAutoSimulate(val);
    saveSettings(soundEnabled, soundVolume, soundType, val);
    
    // Dispatch custom window event to start/stop layout-level interval
    window.dispatchEvent(new CustomEvent("toggle-simulation", { detail: val }));
    
    setToastMessage(val ? "Background order simulation started!" : "Simulation stopped.");
    setTimeout(() => setToastMessage(""), 3000);
  };

  const testSound = () => {
    playSynthesizedSound(soundType, soundVolume);
    setToastMessage(`Tested "${soundType}" alert at ${Math.round(soundVolume * 100)}% volume!`);
    setTimeout(() => setToastMessage(""), 2000);
  };

  // Generate a random mock order and dispatch it instantly
  const triggerManualSimulation = () => {
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    const randomTable = tables[Math.floor(Math.random() * tables.length)];
    const useRoom = Math.random() > 0.5;
    const destLabel = useRoom ? `Room ${randomRoom.number}` : randomTable.number;
    const destType = useRoom ? "room" : "table";

    // Build items list
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
    setToastMessage(`Simulated new KOT: ${destLabel} placed a ₹${total} order!`);
    setTimeout(() => setToastMessage(""), 3500);
  };

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex-1 space-y-6 p-6 md:p-8 max-w-4xl">
        
        {/* Page title info */}
        <div>
          <h2 className="text-xl font-bold text-slate-800">Console Settings</h2>
          <p className="text-xs text-slate-400 mt-1">Configure live audio notifications, sound levels, and incoming order simulations.</p>
        </div>

        {/* Status Toast */}
        {toastMessage && (
          <div className="bg-blue-600 text-white rounded-2xl px-5 py-3.5 text-xs font-bold shadow-lg animate-float flex items-center gap-2">
            <FiInfo size={15} />
            {toastMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Box 1: Sound Alerts Settings */}
          <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center">
                <FiBell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Loud Sound Alerts</h3>
                <p className="text-[10px] text-slate-400 font-medium">Trigger alarm noise when a KOT is received</p>
              </div>
            </div>

            {/* Toggle Enable sound */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700">Audio Alerts Status</span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => handleSoundToggle(e.target.checked)}
                className="h-5 w-10 rounded-full border-border/80 border text-blue-500 focus:ring-blue-500/30 accent-[#3B82F6] cursor-pointer"
              />
            </div>

            {/* Sound Level Volume slider */}
            <div className="space-y-2 py-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5"><FiVolume2 size={14} /> Alert Volume</span>
                <span className="font-mono text-[11px]">{Math.round(soundVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                disabled={!soundEnabled}
                value={soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#3B82F6] disabled:opacity-40"
              />
            </div>

            {/* Sound type selectors */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Choose Sound Tone</label>
              
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "alarm", label: "Loud Beep Alarm" },
                  { id: "bell", label: "Ding Dong Bell" },
                  { id: "siren", label: "Emergency Siren" },
                  { id: "chime", label: "Digital Chime" },
                ].map((tone) => {
                  const active = soundType === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      disabled={!soundEnabled}
                      onClick={() => handleTypeChange(tone.id as SoundType)}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                        active
                          ? "border-[#3B82F6] bg-blue-50/50 text-[#3B82F6]"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <span>{tone.label}</span>
                      {active && <FiCheck size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test alert CTA */}
            <button
              onClick={testSound}
              disabled={!soundEnabled}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
            >
              <FiPlay size={13} /> Test Alarm Sound
            </button>

          </div>

          {/* Box 2: Simulator Console */}
          <div className="bg-white border border-border/40 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiCpu size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">KOT Order Simulator</h3>
                <p className="text-[10px] text-slate-400 font-medium">Test sound alerts by triggering incoming orders</p>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs text-slate-500 leading-relaxed font-medium space-y-2 select-none">
              <p>💡 <b>How it works:</b></p>
              <p>When an order is created, the system broadcasts a notification across all open dashboard tabs. Click "Simulate Order Now" to trigger a sound alert immediately.</p>
              <p className="text-slate-400 italic">Autoplay safety note: Browser requires user interaction (clicking the page) before sound is allowed to trigger.</p>
            </div>

            {/* Simulate Random switch */}
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-slate-700 block">Autoplay Simulator Loop</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Spawns a random order every 30 seconds</span>
              </div>
              <input
                type="checkbox"
                checked={autoSimulate}
                onChange={(e) => handleAutoSimulateToggle(e.target.checked)}
                className="h-5 w-10 rounded-full border-border/80 border text-blue-500 focus:ring-blue-500/30 accent-[#3B82F6] cursor-pointer"
              />
            </div>

            {/* Manual simulator trigger CTA */}
            <button
              onClick={triggerManualSimulation}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <FiPlusCircle size={13} /> Simulate Incoming KOT Order
            </button>
          </div>

        </div>

      </main>
    </>
  );
}
