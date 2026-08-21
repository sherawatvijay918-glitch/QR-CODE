export interface Coupon {
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  active: boolean;
  usageCount: number;
  itemId?: string; // Optional: applies only to this specific dish!
}

export const DEFAULT_COUPONS: Coupon[] = [
  { code: "VEGPANIER", type: "flat", value: 100, minOrder: 400, active: true, usageCount: 12 },
  { code: "LUNCH25", type: "percent", value: 25, minOrder: 250, active: true, usageCount: 45 },
  { code: "FIRSTORDER", type: "flat", value: 50, minOrder: 150, active: true, usageCount: 89 },
  { code: "PANEER50", type: "flat", value: 50, minOrder: 0, active: true, usageCount: 5, itemId: "m_paneer_butter_masala" }, // Specific to Paneer Butter Masala
];

export function getCoupons(): Coupon[] {
  if (typeof window === "undefined") return DEFAULT_COUPONS;
  const stored = localStorage.getItem("hotelqr_coupons");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_COUPONS;
    }
  }
  localStorage.setItem("hotelqr_coupons", JSON.stringify(DEFAULT_COUPONS));
  return DEFAULT_COUPONS;
}

export function saveCoupons(coupons: Coupon[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("hotelqr_coupons", JSON.stringify(coupons));
  }
}
