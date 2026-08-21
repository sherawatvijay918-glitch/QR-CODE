"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import Topbar from "@/components/Topbar";
import {
  TbBed,
  TbCoffee,
  TbShoppingCart,
  TbUsers
} from "react-icons/tb";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  Cell,
  TooltipProps
} from "recharts";
import { rooms, tables, orders } from "@/lib/dummy-data";
import { useRouter } from "next/navigation";

interface Booking {
  id: number;
  roomId: string;
  roomNumber: string;
  guestName: string;
  mobileNumber: string;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  status: "active" | "checked_out";
}

interface Customer {
  id: number;
  name: string;
  totalDue: number;
}

interface Transaction {
  id: string;
  guestName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  time: string;
}

// Mock bookings data
const mockBookings: Booking[] = [
  { id: 1, roomId: "r1", roomNumber: "101", guestName: "Sharma", mobileNumber: "9876543210", checkInDate: new Date().toISOString(), checkOutDate: new Date(Date.now() + 86400000).toISOString(), price: 4150, status: "active" },
  { id: 2, roomId: "r2", roomNumber: "102", guestName: "Patel", mobileNumber: "9123456789", checkInDate: new Date().toISOString(), checkOutDate: new Date(Date.now() + 172800000).toISOString(), price: 5200, status: "active" },
  { id: 3, roomId: "r3", roomNumber: "103", guestName: "Kumar", mobileNumber: "9988776655", checkInDate: new Date().toISOString(), checkOutDate: new Date(Date.now() + 86400000).toISOString(), price: 3800, status: "active" },
  { id: 4, roomId: "r4", roomNumber: "104", guestName: "Desai", mobileNumber: "9876512345", checkInDate: new Date(Date.now() - 86400000).toISOString(), checkOutDate: new Date(Date.now() + 86400000).toISOString(), price: 4500, status: "active" },
  { id: 5, roomId: "r5", roomNumber: "105", guestName: "Verma", mobileNumber: "9123498765", checkInDate: new Date().toISOString(), checkOutDate: new Date(Date.now() + 172800000).toISOString(), price: 2400, status: "checked_out" },
  { id: 6, roomId: "r6", roomNumber: "106", guestName: "Iyer", mobileNumber: "9876543211", checkInDate: new Date(Date.now() - 86400000).toISOString(), checkOutDate: new Date(Date.now() - 43200000).toISOString(), price: 5800, status: "checked_out" },
];

// Mock customers for ledger
const mockCustomers: Customer[] = [
  { id: 1, name: "Sharma", totalDue: 930 },
  { id: 2, name: "Patel", totalDue: 0 },
  { id: 3, name: "Kumar", totalDue: 0 },
  { id: 4, name: "Desai", totalDue: 480 },
  { id: 5, name: "Mehta", totalDue: 0 },
];

// Mock transactions
const mockTransactions: Transaction[] = [
  { id: "TXN-001", guestName: "Sharma", amount: 4150, paymentMethod: "Credit Card", status: "Cleared", time: "14:25" },
  { id: "TXN-002", guestName: "Patel", amount: 2400, paymentMethod: "Cash", status: "Cleared", time: "13:45" },
  { id: "TXN-003", guestName: "Desai", amount: 1200, paymentMethod: "Pending", status: "Pending", time: "12:15" },
  { id: "TXN-004", guestName: "Kumar", amount: 3100, paymentMethod: "Credit Card", status: "Cleared", time: "11:30" },
];

// Weekly revenue data (₹ values)
const weeklyRevenue = [
  { day: "Mon", rooms: 7500, restaurant: 1200 },
  { day: "Tue", rooms: 5000, restaurant: 1850 },
  { day: "Wed", rooms: 10000, restaurant: 2100 },
  { day: "Thu", rooms: 7500, restaurant: 1450 },
  { day: "Fri", rooms: 12500, restaurant: 3200 },
  { day: "Sat", rooms: 15000, restaurant: 4500 },
  { day: "Sun", rooms: 12500, restaurant: 3800 },
];

// Today's KOT activity
const todayKots = [
  { kot: "KOT-1042", location: "Room 204", items: 3, amount: 490, status: "preparing", time: "14:20" },
  { kot: "KOT-1041", location: "Table T4", items: 2, amount: 800, status: "preparing", time: "12:35" },
  { kot: "KOT-1039", location: "Room 301", items: 4, amount: 620, status: "ready", time: "09:15" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate metrics
  const activeBookings = mockBookings.filter(b => b.status === "active");
  const occupiedRoomsCount = rooms.filter(r => r.status === "occupied").length;
  const totalRooms = rooms.length;
  const occupancyPercentage = ((occupiedRoomsCount / totalRooms) * 100).toFixed(1);

  const todayKotCount = orders.filter(o => o.status === "pending" || o.status === "preparing").length;
  const todaySales = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = orders.filter(o => {
    const d = new Date(o.placedAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;

  const pendingDues = mockCustomers.reduce((sum, c) => sum + (c.totalDue || 0), 0);

  const todayRevenue = weeklyRevenue[0].rooms + weeklyRevenue[0].restaurant;
  const roomRevenue = mockBookings.reduce((sum, b) => sum + Number(b.price), 0);
  const restaurantRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const otherRevenue = pendingDues;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "checked_out": return "bg-slate-100 text-slate-600 border-slate-300";
      default: return "bg-slate-100 text-slate-600 border-slate-300";
    }
  };

  const getKotStatusColor = (status: string) => {
    switch (status) {
      case "preparing": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "ready": return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "delivered": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      default: return "bg-slate-100 text-slate-600 border-slate-300";
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "cleared": return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "pending": return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      default: return "bg-slate-100 text-slate-600 border-slate-300";
    }
  };

  const getDayColor = (index: number) => {
    const colors = ["#123B63", "#2563EB", "#3B82F6", "#2F80C0", "#123B63", "#2563EB", "#3B82F6"];
    return colors[index];
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <Topbar title="ERP > Dashboard" />
      <main className="flex-1 overflow-y-auto pb-6">
        <div className="max-w-7xl mx-auto px-6 space-y-6">

          {/* Welcome Section - Compact Blue Header */}
          <section className="bg-primary text-white rounded-md p-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Good Morning, {user?.name || 'Administrator'}!</h2>
              <p className="text-sm opacity-90">Today's hotel operations at a glance.</p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">System Status</div>
              <div className="font-bold">Operational</div>
            </div>
          </section>

          {/* KPI Cards - 4 Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Room Occupancy */}
            <div className="bg-surface border border-border rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Room Occupancy</span>
                  <div className="text-2xl font-bold mt-1">
                    {occupiedRoomsCount} / {totalRooms}
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    {occupancyPercentage}% occupied
                  </div>
                </div>
                <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <TbBed className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Today's Sales */}
            <div className="bg-surface border border-border rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Today's Sales</span>
                  <div className="text-2xl font-bold mt-1">
                    ₹{todaySales.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    {orderCount} orders
                  </div>
                </div>
                <div className="h-10 w-10 rounded-md bg-accent/10 text-accent flex items-center justify-center">
                  <TbShoppingCart className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Pending Dues */}
            <div className="bg-surface border border-border rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Pending Dues</span>
                  <div className="text-2xl font-bold mt-1">
                    ₹{pendingDues.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    Client accounts
                  </div>
                </div>
                <div className="h-10 w-10 rounded-md bg-warning/10 text-warning flex items-center justify-center">
                  <TbUsers className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Active KOTs */}
            <div className="bg-surface border border-border rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-muted uppercase tracking-wider">Active KOTs</span>
                  <div className="text-2xl font-bold mt-1">
                    {todayKotCount}
                  </div>
                  <div className="text-sm text-muted mt-0.5">
                    In kitchen
                  </div>
                </div>
                <div className="h-10 w-10 rounded-md bg-success/10 text-success flex items-center justify-center">
                  <TbCoffee className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Two-Column Operational Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Today's Bookings */}
            <div className="bg-surface border border-border rounded-md shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">Today's Bookings</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-surface-inset">
                      <th className="px-3 py-2 text-xs font-bold text-muted text-left">Guest</th>
                      <th className="px-3 py-2 text-xs font-bold text-muted text-left">Room</th>
                      <th className="px-3 py-2 text-xs font-bold text-muted text-left">Check-in</th>
                      <th className="px-3 py-2 text-xs font-bold text-muted text-left">Check-out</th>
                      <th className="px-3 py-2 text-xs font-bold text-muted text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeBookings.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 hover:bg-surface-inset/50">
                        <td className="px-3 py-2 text-xs font-medium text-foreground">{b.guestName}</td>
                        <td className="px-3 py-2 text-xs text-foreground font-mono">Room {b.roomNumber}</td>
                        <td className="px-3 py-2 text-xs text-muted">Today</td>
                        <td className="px-3 py-2 text-xs text-muted">{b.checkOutDate.split('T')[0]}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${getStatusColor(b.status)}`}>
                            {b.status === 'active' ? 'Checked In' : 'Checked Out'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Room Status */}
            <div className="bg-surface border border-border rounded-md shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">Room Status</h3>
              </div>
              <div className="divide-y divide-border/50">
                {rooms.map((room, idx) => (
                  <div key={room.id} className="flex items-center justify-between px-4 py-2 text-sm">
                    <div className="font-mono font-bold text-foreground">{room.number}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted uppercase">{room.status}</span>
                      <span className={`h-2 w-2 rounded-full ${
                        room.status === 'occupied' ? 'bg-success' :
                        room.status === 'vacant' ? 'bg-warning' :
                        room.status === 'cleaning' ? 'bg-accent' :
                        'bg-muted'
                      }`}></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Kitchen / KOT Activity */}
            <div className="bg-surface border border-border rounded-md shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">Kitchen KOT Activity</h3>
              </div>
              <div className="divide-y divide-border/50">
                {todayKots.map((kot) => (
                  <div key={kot.kot} className="flex items-center justify-between px-4 py-2 text-sm">
                    <div>
                      <div className="font-bold text-foreground font-mono text-xs">{kot.kot}</div>
                      <div className="text-xs text-muted">{kot.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground text-xs">₹{kot.amount}</div>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${getKotStatusColor(kot.status)}`}>
                        {kot.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Revenue */}
            <div className="bg-surface border border-border rounded-md shadow-sm">
              <div className="border-b border-border px-4 py-3">
                <h3 className="text-sm font-bold text-foreground">Today's Revenue</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-muted">Room Revenue</span>
                      <span className="text-sm font-bold text-foreground">₹{roomRevenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-primary/20 rounded-full">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${Math.min((roomRevenue / 15000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-muted">Restaurant</span>
                      <span className="text-sm font-bold text-foreground">₹{restaurantRevenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-accent/20 rounded-full">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${Math.min((restaurantRevenue / 5000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs text-muted">Other</span>
                      <span className="text-sm font-bold text-foreground">₹{otherRevenue.toLocaleString()}</span>
                    </div>
                    <div className="h-2 bg-success/20 rounded-full">
                      <div
                        className="h-full bg-success rounded-full"
                        style={{ width: `${Math.min((otherRevenue / 2000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-surface border border-border rounded-md shadow-sm">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">Recent Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-surface-inset">
                    <th className="px-3 py-2 text-xs font-bold text-muted text-left">Receipt</th>
                    <th className="px-3 py-2 text-xs font-bold text-muted text-left">Guest</th>
                    <th className="px-3 py-2 text-xs font-bold text-muted text-right">Amount</th>
                    <th className="px-3 py-2 text-xs font-bold text-muted text-left">Payment Method</th>
                    <th className="px-3 py-2 text-xs font-bold text-muted text-center">Status</th>
                    <th className="px-3 py-2 text-xs font-bold text-muted text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border/50 hover:bg-surface-inset/50">
                      <td className="px-3 py-2 text-xs font-mono text-foreground">{tx.id}</td>
                      <td className="px-3 py-2 text-xs text-foreground">{tx.guestName}</td>
                      <td className="px-3 py-2 text-xs font-bold text-foreground text-right">₹{tx.amount.toLocaleString()}</td>
                      <td className="px-3 py-2 text-xs text-muted">{tx.paymentMethod}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-bold rounded ${getTransactionStatusColor(tx.status)}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs text-muted">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Weekly Revenue Chart */}
          <div className="bg-surface border border-border rounded-md shadow-sm">
            <div className="border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-foreground">Weekly Revenue</h3>
              <p className="text-xs text-muted">Room and restaurant sales (₹)</p>
            </div>
            <div className="p-4">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={weeklyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="day" stroke="#667085" fontSize={10} />
                  <YAxis stroke="#667085" fontSize={10} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#D0D5DD",
                      borderRadius: "6px",
                      color: "#17202A",
                      fontSize: "11px"
                    }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Bar dataKey="rooms" fill="#123B63" name="Rooms" />
                  <Bar dataKey="restaurant" fill="#2F80C0" name="Restaurant" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}