import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { cookies } from "next/headers";

interface OrderRequestBody {
  id: string;
  sourceType: string;
  sourceLabel: string;
  items: any[];
  instructions?: string;
  status: string;
  placedAt: string;
  updatedAt?: string;
  total: number | string;
  couponCode?: string;
  discount?: number | string;
}

interface OrderUpdateBody {
  id: string;
  status?: string;
  items?: any[];
  total?: number | string;
  discount?: number | string;
}

let isInitialized = false;
async function ensureDb() {
  if (!isInitialized) {
    await initDb();
    isInitialized = true;
  }
}

async function isAuthorized() {
  const cookieStore = await cookies();
  const session = cookieStore.get("hotelqr_session");
  return session?.value === "authenticated";
}

export async function GET(_req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  try {
    const [rows] = await pool.query("SELECT * FROM orders ORDER BY placedAt DESC");

    const formatted = (rows as any[]).map(row => ({
      ...row,
      items: typeof row.items === "string" ? JSON.parse(row.items) : row.items
    }));

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Allow public POST requests for guests placing orders from QR codes
  await ensureDb();
  try {
    const body = await req.json() as OrderRequestBody;
    const {
      id,
      sourceType,
      sourceLabel,
      items,
      instructions,
      status,
      placedAt,
      updatedAt,
      total,
      couponCode,
      discount
    } = body;

    // Validate required fields
    if (!id || !sourceType || !items || !placedAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO orders (
        id, sourceType, sourceLabel, items, instructions,
        status, placedAt, updatedAt, total, couponCode, discount
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sourceType,
        sourceLabel,
        JSON.stringify(items),
        instructions || null,
        status || "pending",
        placedAt,
        updatedAt || new Date().toISOString(),
        Number(total) || 0,
        couponCode || null,
        Number(discount) || 0
      ]
    );

    // Increment coupon usage counts if code applied
    if (couponCode) {
      await pool.query("UPDATE coupons SET usageCount = usageCount + 1 WHERE code = ?", [couponCode]);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  try {
    const body = await req.json() as OrderUpdateBody;
    const { id, status, items, total, discount } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID parameter is required" },
        { status: 400 }
      );
    }

    // Handle items update
    if (items !== undefined) {
      await pool.query(
        "UPDATE orders SET items = ?, total = ?, discount = ?, updatedAt = ? WHERE id = ?",
        [
          JSON.stringify(items),
          total !== undefined ? Number(total) : 0,
          discount !== undefined ? Number(discount) : 0,
          new Date().toISOString(),
          id
        ]
      );
    }
    // Handle status update
    else if (status !== undefined) {
      await pool.query(
        "UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?",
        [status, new Date().toISOString(), id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
