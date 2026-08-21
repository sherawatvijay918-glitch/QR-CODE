import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";
import { cookies } from "next/headers";

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

// GET: Fetch all ledger customers
export async function GET(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "all";
    const search = searchParams.get("search") || "";

    let query = "SELECT * FROM rough_customers";
    const params: any[] = [];
    const conditions: string[] = [];

    if (status === "pending") {
      conditions.push("totalDue > 0");
    } else if (status === "excess") {
      conditions.push("totalDue < 0");
    } else if (status === "settled") {
      conditions.push("totalDue = 0");
    }

    if (search) {
      conditions.push("(name LIKE ? OR phone LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY updatedAt DESC";

    const [rows] = await pool.query(query, params);

    return NextResponse.json(rows);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Add a new customer account
export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  try {
    const body = await req.json();
    const { name, phone } = body;

    if (!name) {
      return NextResponse.json({ error: "Customer Name is required" }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Check if customer with this exact name already exists
    const [existing]: any = await pool.query("SELECT * FROM rough_customers WHERE name = ?", [name.trim()]);
    if (existing.length > 0) {
      return NextResponse.json({ 
        success: true, 
        id: existing[0].id, 
        message: "Customer already exists, returned existing profile",
        customer: existing[0] 
      });
    }

    const [result]: any = await pool.query(
      `INSERT INTO rough_customers (name, phone, totalDue, createdAt, updatedAt)
       VALUES (?, ?, 0.00, ?, ?)`,
      [name.trim(), phone || null, now, now]
    );

    return NextResponse.json({ 
      success: true, 
      id: result.insertId,
      customer: {
        id: result.insertId,
        name: name.trim(),
        phone: phone || null,
        totalDue: 0.00,
        createdAt: now,
        updatedAt: now
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
