import { NextResponse } from "next/server";
import { pool, initDb } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");

  if (!roomId) {
    return NextResponse.json({ error: "Missing roomId" }, { status: 400 });
  }

  await initDb();

  try {
    // Check if there is an active check-in booking for this roomId
    const [rows]: any = await pool.query(
      "SELECT * FROM bookings WHERE roomId = ? AND status = 'active'",
      [roomId]
    );

    if (rows.length > 0) {
      return NextResponse.json({
        checkedIn: true,
        guestName: rows[0].guestName,
        bookingId: rows[0].id
      });
    } else {
      return NextResponse.json({
        checkedIn: false
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
