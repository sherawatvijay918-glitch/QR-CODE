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

// GET: Fetch transaction history for a specific customer
export async function GET(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  try {
    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId parameter" }, { status: 400 });
    }

    const [rows] = await pool.query(
      "SELECT * FROM rough_transactions WHERE customerId = ? ORDER BY createdAt ASC, id ASC",
      [customerId]
    );

    const formatted = (rows as any[]).map(row => {
      let parsedItems = row.items;
      if (typeof row.items === "string") {
        try {
          parsedItems = JSON.parse(row.items);
        } catch (e) {
          parsedItems = null;
        }
      }
      return {
        ...row,
        items: parsedItems
      };
    });

    return NextResponse.json(formatted);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Log a transaction (bill or payment) under a customer ID
export async function POST(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  const connection = await pool.getConnection();
  try {
    const body = await req.json();
    const { customerId, type, amount, items, notes, createdAt } = body;

    if (!customerId || !type || amount === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (customerId, type, amount)" },
        { status: 400 }
      );
    }

    if (type !== "bill" && type !== "payment") {
      return NextResponse.json(
        { error: "Invalid transaction type (must be 'bill' or 'payment')" },
        { status: 400 }
      );
    }

    const txAmount = Number(amount) || 0;
    const now = new Date().toISOString();
    const txDate = createdAt ? new Date(createdAt).toISOString() : now;

    // Start a transaction on the DB connection to ensure atomicity
    await connection.beginTransaction();

    // 1. Verify customer exists
    const [custRows]: any = await connection.query("SELECT * FROM rough_customers WHERE id = ?", [customerId]);
    if (custRows.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    let txId = null;
    let isMerged = false;

    // Aggregating Quick Add items on the same day to avoid duplicate lines
    if (type === "bill" && notes && notes.startsWith("Quick Add:")) {
      // Find if there is an existing Quick Add transaction today
      const [existingTxs]: any = await connection.query(
        `SELECT * FROM rough_transactions 
         WHERE customerId = ? 
           AND type = 'bill' 
           AND notes LIKE 'Quick Add:%'
           AND DATE(createdAt) = CURDATE()
         ORDER BY id DESC LIMIT 1`,
        [customerId]
      );

      if (existingTxs.length > 0) {
        const existingTx = existingTxs[0];
        txId = existingTx.id;

        // Parse existing items
        let currentItems: any[] = [];
        if (existingTx.items) {
          try {
            currentItems = typeof existingTx.items === "string" 
              ? JSON.parse(existingTx.items) 
              : existingTx.items;
          } catch (e) {
            currentItems = [];
          }
        }

        // Parse new incoming items
        let newItems: any[] = [];
        if (items) {
          try {
            newItems = typeof items === "string" ? JSON.parse(items) : items;
          } catch (e) {}
        }

        // Merge items list
        newItems.forEach((newItem: any) => {
          const match = currentItems.find((it: any) => it.name === newItem.name);
          if (match) {
            match.qty = (match.qty || 0) + (newItem.qty || 1);
          } else {
            currentItems.push({ ...newItem });
          }
        });

        // Reconstruct the aggregated notes string
        const updatedNotes = "Quick Add: " + currentItems.map((it: any) => `${it.name} (x${it.qty})`).join(", ");
        const updatedAmount = Number(existingTx.amount) + txAmount;

        // Update the existing transaction record
        await connection.query(
          `UPDATE rough_transactions 
           SET amount = ?, items = ?, notes = ?, createdAt = ?
           WHERE id = ?`,
          [
            updatedAmount,
            JSON.stringify(currentItems),
            updatedNotes,
            txDate, // Keep it updated to last active time
            txId
          ]
        );

        isMerged = true;
      }
    }

    if (!isMerged) {
      // 2. Insert transaction
      const [txResult]: any = await connection.query(
        `INSERT INTO rough_transactions (customerId, type, amount, items, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          customerId,
          type,
          txAmount,
          items ? JSON.stringify(items) : null,
          notes || null,
          txDate
        ]
      );
      txId = txResult.insertId;
    }

    // 3. Update customer totalDue
    // If it's a bill: totalDue increases. If it's a payment: totalDue decreases.
    const delta = type === "bill" ? txAmount : -txAmount;

    await connection.query(
      "UPDATE rough_customers SET totalDue = totalDue + ?, updatedAt = ? WHERE id = ?",
      [delta, now, customerId]
    );

    await connection.commit();
    return NextResponse.json({ success: true, id: txId });

  } catch (err: any) {
    await connection.rollback();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

// DELETE: Remove a ledger transaction (adjusts customer balance back)
export async function DELETE(req: Request) {
  if (!(await isAuthorized())) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  await ensureDb();
  const connection = await pool.getConnection();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });
    }

    // Start a transaction
    await connection.beginTransaction();

    // 1. Fetch transaction details to know amount and type
    const [txRows]: any = await connection.query("SELECT * FROM rough_transactions WHERE id = ?", [id]);
    if (txRows.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const tx = txRows[0];
    const { customerId, type, amount } = tx;

    // 2. Reverse balance changes
    // If it was a bill: decrease totalDue. If it was a payment: increase totalDue.
    const reverseDelta = type === "bill" ? -Number(amount) : Number(amount);
    const now = new Date().toISOString();

    await connection.query(
      "UPDATE rough_customers SET totalDue = totalDue + ?, updatedAt = ? WHERE id = ?",
      [reverseDelta, now, customerId]
    );

    // 3. Delete transaction row
    await connection.query("DELETE FROM rough_transactions WHERE id = ?", [id]);

    await connection.commit();
    return NextResponse.json({ success: true });

  } catch (err: any) {
    await connection.rollback();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    connection.release();
  }
}
