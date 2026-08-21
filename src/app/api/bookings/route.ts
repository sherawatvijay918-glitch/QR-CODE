import { NextResponse } from "next/server";
import { pool, initDb } from '@/lib/db';
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
  return session?.value === 'authenticated' || false;
}

// GET endpoint
export async function GET(req: Request) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  await ensureDb();
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'all';

    let query = 'SELECT * FROM bookings ORDER BY checkInDate DESC';
    const params: string[] = [];

    if (status !== 'all') {
      query = 'SELECT * FROM bookings WHERE status = ? ORDER BY checkInDate DESC';
      params.push(status);
    }

    const [rows]: any = await pool.query(query, params);

    const formatted = rows.map((row: any) => {
      return {
        ...row,
        coGuests: typeof row.coGuests === 'string' ? JSON.parse(row.coGuests) : row.coGuests
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST endpoint
export async function POST(req: Request) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  await ensureDb();
  try {
    const body = await req.json() as any;

    // Validate required fields
    if (!body.roomId || !body.roomNumber || !body.guestName || !body.mobileNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Convert to proper types
    const payment = Number(body.paymentMode) || 0;
    const advance = Number(body.advancePaid) || 0;
    const gst = Number(body.gst) || 0;
    const discount = Number(body.discount) || 0;

    await pool.query(
      `INSERT INTO bookings (
        roomId, roomNumber, guestName, mobileNumber, idType, idNumber, idPhotoFront, idPhotoBack, passportCountry, address, adults, children, coGuests, checkInDate, checkOutDate, price, paymentMode, advancePaid, bookingSource, tariff, extraCharge, gst, discount
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        body.roomId,
        body.roomNumber,
        body.guestName,
        body.mobileNumber,
        body.idType,
        body.idNumber,
        body.idPhotoFront || null,
        body.idPhotoBack || null,
        body.passportCountry || null,
        body.address || null,
        Number(body.adults) || 1,
        Number(body.children) || 0,
        body.coGuests ? JSON.stringify(body.coGuests) : null,
        body.checkInDate,
        body.checkOutDate,
        Number(body.price) || 0,
        body.paymentMode || payment,
        advance,
        body.bookingSource || 'internal',
        Number(body.tariff) || 0,
        Number(body.extraCharge) || 0,
        gst,
        discount
      ]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT endpoint
export async function PUT(req: Request) {
  if (!await isAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  await ensureDb();
  try {
    const body = await req.json() as { id: string, status: string };

    if (!body.id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    await pool.query(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [body.status, body.id]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
