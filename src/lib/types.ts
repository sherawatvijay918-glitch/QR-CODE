export type Role = "admin" | "manager" | "kitchen" | "waiter";

export type OrderStatus = "pending" | "preparing" | "ready" | "delivered";

export type SourceType = "room" | "table" | "pos";

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  veg: boolean;
}

export interface Order {
  id: string;
  sourceType: SourceType;
  sourceLabel: string; // e.g. "Room 204" or "Table 6"
  items: OrderItem[];
  instructions?: string;
  status: OrderStatus;
  placedAt: string; // ISO
  updatedAt: string;
  total: number;
  couponCode?: string;
  discount?: number;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  status: "occupied" | "vacant" | "cleaning";
  qrCode: string;
  ordersToday: number;
}

export interface RestaurantTable {
  id: string;
  number: string;
  seats: number;
  status: "occupied" | "vacant" | "reserved";
  qrCode: string;
  ordersToday: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  itemCount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  veg: boolean;
  available: boolean;
  description: string;
  image: string;
}

export interface StaffUser {
  id: string;
  name: string;
  role: Role;
  email: string;
  status: "active" | "inactive";
}

export interface SalesPoint {
  label: string;
  revenue: number;
  orders: number;
}
