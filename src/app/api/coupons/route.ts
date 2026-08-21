import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { cookies } from "next/headers";

interface CouponBody {
  id?: number;
  name: string;
  value: number;
  type: string;
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
    const [rows]: any = await pool.query("SELECT * FROM coupons");
    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  try {
    const body = await req.json() as CouponBody;

    if (!body.name || !body.value || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const value = Number(body.value) || 0;

    await pool.query(
      "INSERT INTO coupons (name, value, type) VALUES (?, ?, ?)",
      [body.name, value, body.type]
    );

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
    const body = await req.json() as CouponBody;
    const { id, name, value, type } = body;

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });
    }

    await pool.query(
      "UPDATE coupons SET name = ?, value = ?, type = ? WHERE id = ?",
      [name, Number(value) || 0, type, id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}