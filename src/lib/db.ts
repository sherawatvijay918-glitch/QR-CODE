import { MongoClient, Db } from "mongodb";
import fs from "fs";
import path from "path";

// Support both STORAGE_URL (injected by Vercel integration) and MONGODB_URI
const mongoUri = process.env.STORAGE_URL || process.env.MONGODB_URI;

let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;
let useLocalFallback = false;

// Local JSON File Database helper for local offline fallback
const LOCAL_DATA_DIR = path.join(process.cwd(), "src", "lib", "data");

function ensureLocalDataDir() {
  if (!fs.existsSync(LOCAL_DATA_DIR)) {
    fs.mkdirSync(LOCAL_DATA_DIR, { recursive: true });
  }
}

function getLocalFilePath(table: string) {
  return path.join(LOCAL_DATA_DIR, `${table}.json`);
}

function readLocalData(table: string): any[] {
  ensureLocalDataDir();
  const filePath = getLocalFilePath(table);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

function writeLocalData(table: string, data: any[]) {
  ensureLocalDataDir();
  const filePath = getLocalFilePath(table);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

// Connect to MongoDB
async function getDb(): Promise<Db | null> {
  if (useLocalFallback) return null;
  if (mongoDb) return mongoDb;

  if (!mongoUri) {
    console.log("No MongoDB URI configured. Falling back to local file database.");
    useLocalFallback = true;
    return null;
  }

  try {
    if (!mongoClient) {
      mongoClient = new MongoClient(mongoUri);
      await mongoClient.connect();
    }
    mongoDb = mongoClient.db();
    console.log("Connected to MongoDB successfully!");
    return mongoDb;
  } catch (err) {
    console.error("MongoDB connection failed. Falling back to local file database.", err);
    useLocalFallback = true;
    return null;
  }
}

// Seed Initial Data
export async function initDb() {
  const db = await getDb();
  if (db) {
    try {
      // 1. Coupons Seed
      const couponsColl = db.collection("coupons");
      const couponsCount = await couponsColl.countDocuments();
      if (couponsCount === 0) {
        await couponsColl.insertMany([
          { code: "VEGPANIER", type: "flat", value: 100.00, minOrder: 400.00, active: 1, usageCount: 12, itemId: null },
          { code: "LUNCH25", type: "percent", value: 25.00, minOrder: 250.00, active: 1, usageCount: 45, itemId: null },
          { code: "FIRSTORDER", type: "flat", value: 50.00, minOrder: 150.00, active: 1, usageCount: 89, itemId: null },
          { code: "PANEER50", type: "flat", value: 50.00, minOrder: 0.00, active: 1, usageCount: 5, itemId: "m_paneer_butter_masala" }
        ]);
      }

      // 2. Orders Seed
      const ordersColl = db.collection("orders");
      const ordersCount = await ordersColl.countDocuments();
      if (ordersCount === 0) {
        await ordersColl.insertMany([
          {
            id: "ORD-4927",
            sourceType: "room",
            sourceLabel: "Room 204",
            status: "pending",
            placedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            total: 475.00,
            couponCode: null,
            discount: null,
            items: [
              { id: "m_paneer_butter_masala", name: "Paneer Butter Masala", qty: 1, price: 310, veg: true },
              { id: "m_tandoori_roti", name: "Tandoori Roti", qty: 2, price: 45, veg: true },
              { id: "m_jeera_rice", name: "Jeera Rice", qty: 1, price: 120, veg: true }
            ],
            instructions: null
          },
          {
            id: "ORD-8812",
            sourceType: "table",
            sourceLabel: "Table T4",
            status: "preparing",
            placedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            total: 355.00,
            couponCode: "FIRSTORDER",
            discount: 50.00,
            items: [
              { id: "m_paneer_tikka", name: "Paneer Tikka", qty: 1, price: 245, veg: true },
              { id: "m_masala_chai", name: "Masala Chai", qty: 2, price: 80, veg: true }
            ],
            instructions: "Make paneer spicy"
          },
          {
            id: "ORD-1049",
            sourceType: "table",
            sourceLabel: "Table T1",
            status: "ready",
            placedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            total: 180.00,
            couponCode: null,
            discount: null,
            items: [
              { id: "m_veg_manchurian", name: "Veg Manchurian", qty: 1, price: 180, veg: true }
            ],
            instructions: null
          }
        ]);
      }

      // 3. Bookings Seed
      const bookingsColl = db.collection("bookings");
      const bookingsCount = await bookingsColl.countDocuments();
      if (bookingsCount === 0) {
        await bookingsColl.insertMany([
          {
            id: 1,
            roomId: "r3",
            roomNumber: "204",
            guestName: "Rohan Gupta",
            mobileNumber: "9876543210",
            idType: "Aadhaar",
            idNumber: "5849-2049-1029",
            idPhotoFront: null,
            idPhotoBack: null,
            passportCountry: null,
            address: "New Delhi, Delhi",
            adults: 2,
            children: 0,
            coGuests: [{ name: "Priya Gupta", idType: "Aadhaar", idNumber: "1940-2094-1049", idPhotoFront: null, idPhotoBack: null }],
            checkInDate: `${new Date().toISOString().split("T")[0]}T12:00`,
            checkOutDate: `${new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]}T11:00`,
            price: 7500.00,
            paymentMode: "UPI",
            advancePaid: 2000.00,
            bookingSource: "Online",
            tariff: 2500.00,
            extraCharge: 0.00,
            gst: 0.00,
            discount: 0.00,
            status: "active"
          },
          {
            id: 2,
            roomId: "r1",
            roomNumber: "101",
            guestName: "Aniket Sharma",
            mobileNumber: "8888888888",
            idType: "Aadhaar",
            idNumber: "9019-3829-1022",
            idPhotoFront: null,
            idPhotoBack: null,
            passportCountry: null,
            address: "Mumbai, Maharashtra",
            adults: 1,
            children: 0,
            coGuests: null,
            checkInDate: `${new Date().toISOString().split("T")[0]}T14:00`,
            checkOutDate: `${new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]}T12:00`,
            price: 3600.00,
            paymentMode: "Cash",
            advancePaid: 0.00,
            bookingSource: "Walk-in",
            tariff: 1800.00,
            extraCharge: 0.00,
            gst: 0.00,
            discount: 0.00,
            status: "active"
          },
          {
            id: 3,
            roomId: "r5",
            roomNumber: "301",
            guestName: "Vikram Singh",
            mobileNumber: "7777777777",
            idType: "Aadhaar",
            idNumber: "3049-1920-4491",
            idPhotoFront: null,
            idPhotoBack: null,
            passportCountry: null,
            address: "Jaipur, Rajasthan",
            adults: 2,
            children: 1,
            coGuests: [
              { name: "Karan Singh", idType: "Aadhaar", idNumber: "4092-2930-1092", idPhotoFront: null, idPhotoBack: null },
              { name: "Suman Singh", idType: "Aadhaar", idNumber: "8920-1920-3301", idPhotoFront: null, idPhotoBack: null }
            ],
            checkInDate: `${new Date().toISOString().split("T")[0]}T13:00`,
            checkOutDate: `${new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]}T11:00`,
            price: 16000.00,
            paymentMode: "Card",
            advancePaid: 5000.00,
            bookingSource: "Travel Agent",
            tariff: 3200.00,
            extraCharge: 0.00,
            gst: 0.00,
            discount: 0.00,
            status: "active"
          }
        ]);
      }

      // 4. Rough Customers & Transactions Seed
      const rCustColl = db.collection("rough_customers");
      const rCustCount = await rCustColl.countDocuments();
      if (rCustCount === 0) {
        const now = new Date().toISOString();
        const rTransColl = db.collection("rough_transactions");

        await rCustColl.insertOne({ id: 1, name: "Suresh Kumar", phone: "9876543201", totalDue: 150.00, createdAt: now, updatedAt: now });
        await rTransColl.insertMany([
          { id: 1, customerId: 1, type: "bill", amount: 450.00, items: [{ name: "Kadai Paneer", qty: 1, price: 250 }, { name: "Butter Naan", qty: 4, price: 50 }], notes: "Dinner bill", createdAt: now },
          { id: 2, customerId: 1, type: "payment", amount: 300.00, items: null, notes: "Paid cash, said will clear rest tomorrow morning", createdAt: now }
        ]);

        await rCustColl.insertOne({ id: 2, name: "Ramesh Uncle", phone: "9822114455", totalDue: -20.00, createdAt: now, updatedAt: now });
        await rTransColl.insertMany([
          { id: 3, customerId: 2, type: "bill", amount: 180.00, items: [{ name: "Masala Chai", qty: 4, price: 45 }], notes: "Evening tea", createdAt: now },
          { id: 4, customerId: 2, type: "payment", amount: 200.00, items: null, notes: "Gave extra 20 rupees, adjust in tomorrow morning tea", createdAt: now }
        ]);

        await rCustColl.insertOne({ id: 3, name: "Dr. Amit Verma", phone: "9911883344", totalDue: 0.00, createdAt: now, updatedAt: now });
        await rTransColl.insertMany([
          { id: 5, customerId: 3, type: "bill", amount: 320.00, items: [{ name: "Veg Biryani", qty: 1, price: 280 }, { name: "Sweet Lassi", qty: 1, price: 40 }], notes: "Lunch", createdAt: now },
          { id: 6, customerId: 3, type: "payment", amount: 320.00, items: null, notes: "Fully paid via UPI", createdAt: now }
        ]);
      }
    } catch (err) {
      console.error("Database seeding failed:", err);
    }
  } else {
    // Local JSON Fallback Seeding
    const seedLocal = (table: string, defaultData: any[]) => {
      const data = readLocalData(table);
      if (data.length === 0) {
        writeLocalData(table, defaultData);
      }
    };

    seedLocal("coupons", [
      { code: "VEGPANIER", type: "flat", value: 100.00, minOrder: 400.00, active: 1, usageCount: 12, itemId: null },
      { code: "LUNCH25", type: "percent", value: 25.00, minOrder: 250.00, active: 1, usageCount: 45, itemId: null },
      { code: "FIRSTORDER", type: "flat", value: 50.00, minOrder: 150.00, active: 1, usageCount: 89, itemId: null },
      { code: "PANEER50", type: "flat", value: 50.00, minOrder: 0.00, active: 1, usageCount: 5, itemId: "m_paneer_butter_masala" }
    ]);

    seedLocal("orders", [
      { id: "ORD-4927", sourceType: "room", sourceLabel: "Room 204", status: "pending", placedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), total: 475.00, couponCode: null, discount: null, items: [{ id: "m_paneer_butter_masala", name: "Paneer Butter Masala", qty: 1, price: 310, veg: true }, { id: "m_tandoori_roti", name: "Tandoori Roti", qty: 2, price: 45, veg: true }, { id: "m_jeera_rice", name: "Jeera Rice", qty: 1, price: 120, veg: true }], instructions: null },
      { id: "ORD-8812", sourceType: "table", sourceLabel: "Table T4", status: "preparing", placedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), total: 355.00, couponCode: "FIRSTORDER", discount: 50.00, items: [{ id: "m_paneer_tikka", name: "Paneer Tikka", qty: 1, price: 245, veg: true }, { id: "m_masala_chai", name: "Masala Chai", qty: 2, price: 80, veg: true }], instructions: "Make paneer spicy" },
      { id: "ORD-1049", sourceType: "table", sourceLabel: "Table T1", status: "ready", placedAt: new Date().toISOString(), updatedAt: new Date().toISOString(), total: 180.00, couponCode: null, discount: null, items: [{ id: "m_veg_manchurian", name: "Veg Manchurian", qty: 1, price: 180, veg: true }], instructions: null }
    ]);

    seedLocal("bookings", [
      { id: 1, roomId: "r3", roomNumber: "204", guestName: "Rohan Gupta", mobileNumber: "9876543210", idType: "Aadhaar", idNumber: "5849-2049-1029", idPhotoFront: null, idPhotoBack: null, passportCountry: null, address: "New Delhi, Delhi", adults: 2, children: 0, coGuests: [{ name: "Priya Gupta", idType: "Aadhaar", idNumber: "1940-2094-1049", idPhotoFront: null, idPhotoBack: null }], checkInDate: `${new Date().toISOString().split("T")[0]}T12:00`, checkOutDate: `${new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]}T11:00`, price: 7500.00, paymentMode: "UPI", advancePaid: 2000.00, bookingSource: "Online", tariff: 2500.00, extraCharge: 0.00, gst: 0.00, discount: 0.00, status: "active" },
      { id: 2, roomId: "r1", roomNumber: "101", guestName: "Aniket Sharma", mobileNumber: "8888888888", idType: "Aadhaar", idNumber: "9019-3829-1022", idPhotoFront: null, idPhotoBack: null, passportCountry: null, address: "Mumbai, Maharashtra", adults: 1, children: 0, coGuests: null, checkInDate: `${new Date().toISOString().split("T")[0]}T14:00`, checkOutDate: `${new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]}T12:00`, price: 3600.00, paymentMode: "Cash", advancePaid: 0.00, bookingSource: "Walk-in", tariff: 1800.00, extraCharge: 0.00, gst: 0.00, discount: 0.00, status: "active" },
      { id: 3, roomId: "r5", roomNumber: "301", guestName: "Vikram Singh", mobileNumber: "7777777777", idType: "Aadhaar", idNumber: "3049-1920-4491", idPhotoFront: null, idPhotoBack: null, passportCountry: null, address: "Jaipur, Rajasthan", adults: 2, children: 1, coGuests: [{ name: "Karan Singh", idType: "Aadhaar", idNumber: "4092-2930-1092", idPhotoFront: null, idPhotoBack: null }, { name: "Suman Singh", idType: "Aadhaar", idNumber: "8920-1920-3301", idPhotoFront: null, idPhotoBack: null }], checkInDate: `${new Date().toISOString().split("T")[0]}T13:00`, checkOutDate: `${new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]}T11:00`, price: 16000.00, paymentMode: "Card", advancePaid: 5000.00, bookingSource: "Travel Agent", tariff: 3200.00, extraCharge: 0.00, gst: 0.00, discount: 0.00, status: "active" }
    ]);

    seedLocal("rough_customers", [
      { id: 1, name: "Suresh Kumar", phone: "9876543201", totalDue: 150.00, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 2, name: "Ramesh Uncle", phone: "9822114455", totalDue: -20.00, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { id: 3, name: "Dr. Amit Verma", phone: "9911883344", totalDue: 0.00, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    ]);

    seedLocal("rough_transactions", [
      { id: 1, customerId: 1, type: "bill", amount: 450.00, items: [{ name: "Kadai Paneer", qty: 1, price: 250 }, { name: "Butter Naan", qty: 4, price: 50 }], notes: "Dinner bill", createdAt: new Date().toISOString() },
      { id: 2, customerId: 1, type: "payment", amount: 300.00, items: null, notes: "Paid cash, said will clear rest tomorrow morning", createdAt: new Date().toISOString() },
      { id: 3, customerId: 2, type: "bill", amount: 180.00, items: [{ name: "Masala Chai", qty: 4, price: 45 }], notes: "Evening tea", createdAt: new Date().toISOString() },
      { id: 4, customerId: 2, type: "payment", amount: 200.00, items: null, notes: "Gave extra 20 rupees, adjust in tomorrow morning tea", createdAt: new Date().toISOString() },
      { id: 5, customerId: 3, type: "bill", amount: 320.00, items: [{ name: "Veg Biryani", qty: 1, price: 280 }, { name: "Sweet Lassi", qty: 1, price: 40 }], notes: "Lunch", createdAt: new Date().toISOString() },
      { id: 6, customerId: 3, type: "payment", amount: 320.00, items: null, notes: "Fully paid via UPI", createdAt: new Date().toISOString() }
    ]);

    console.log("Local File System Mock Database Initialized Successfully!");
  }
}

// SQL to MongoDB Query Router and Emulator
const pool = {
  async getConnection() {
    return {
      query: this.query.bind(this),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  },
  async query(sql: string, params: any[] = []): Promise<any[]> {
    const cleanSql = sql.trim().replace(/\s+/g, " ");

    const db = await getDb();

    // 1. SELECT COUNT(*) as count FROM <table>
    const countMatch = cleanSql.match(/SELECT COUNT\(\*\) as count FROM (\w+)/i);
    if (countMatch) {
      const table = countMatch[1];
      if (db) {
        const count = await db.collection(table).countDocuments();
        return [[{ count }]];
      } else {
        const count = readLocalData(table).length;
        return [[{ count }]];
      }
    }

    // 2. SELECT * FROM <table> ORDER BY <col> ASC/DESC
    const selectAllSortMatch = cleanSql.match(/SELECT \* FROM (\w+) ORDER BY (\w+) (ASC|DESC)/i);
    if (selectAllSortMatch) {
      const table = selectAllSortMatch[1];
      const sortCol = selectAllSortMatch[2];
      const sortDir = selectAllSortMatch[3].toUpperCase() === "DESC" ? -1 : 1;
      if (db) {
        const rows = await db.collection(table).find().sort({ [sortCol]: sortDir }).toArray();
        return [rows];
      } else {
        const rows = readLocalData(table).sort((a, b) => {
          if (a[sortCol] < b[sortCol]) return -sortDir;
          if (a[sortCol] > b[sortCol]) return sortDir;
          return 0;
        });
        return [rows];
      }
    }

    // 3. SELECT * FROM <table> WHERE <col> = ? AND <col2> = ?
    const selectWhereTwoMatch = cleanSql.match(/SELECT \* FROM (\w+) WHERE (\w+) = \? AND (\w+) = \?/i);
    if (selectWhereTwoMatch) {
      const table = selectWhereTwoMatch[1];
      const col1 = selectWhereTwoMatch[2];
      const col2 = selectWhereTwoMatch[3];
      const val1 = params[0];
      const val2 = params[1];
      if (db) {
        const rows = await db.collection(table).find({ [col1]: val1, [col2]: val2 }).toArray();
        return [rows];
      } else {
        const rows = readLocalData(table).filter(r => r[col1] === val1 && r[col2] === val2);
        return [rows];
      }
    }

    // 4. SELECT * FROM <table> WHERE <col> = ?
    const selectWhereMatch = cleanSql.match(/SELECT \* FROM (\w+) WHERE (\w+) = \?/i);
    if (selectWhereMatch) {
      const table = selectWhereMatch[1];
      const col = selectWhereMatch[2];
      const val = params[0];
      if (db) {
        // Handle queries where val is cast as ID or number/string conversion
        let queryVal: any = val;
        if (col === "customerId" || col === "id") {
          const num = Number(val);
          if (!isNaN(num)) queryVal = num;
        }
        const rows = await db.collection(table).find({ [col]: queryVal }).toArray();
        return [rows];
      } else {
        const rows = readLocalData(table).filter(r => String(r[col]) === String(val));
        return [rows];
      }
    }

    // 5. SELECT * FROM <table>
    const selectAllMatch = cleanSql.match(/SELECT \* FROM (\w+)/i);
    if (selectAllMatch) {
      const table = selectAllMatch[1];
      if (db) {
        const rows = await db.collection(table).find().toArray();
        return [rows];
      } else {
        const rows = readLocalData(table);
        return [rows];
      }
    }

    // 6. INSERT INTO <table> (<cols>) VALUES (?, ?)
    const insertMatch = cleanSql.match(/INSERT INTO (\w+) \((.*?)\) VALUES \((.*?)\)/i);
    if (insertMatch) {
      const table = insertMatch[1];
      const cols = insertMatch[2].split(",").map(c => c.trim().replace(/`/g, ""));
      
      const doc: any = {};
      cols.forEach((col, idx) => {
        let val = params[idx];
        // Handle parsing JSON items column
        if (col === "items" || col === "coGuests") {
          try {
            if (typeof val === "string") {
              val = JSON.parse(val);
            }
          } catch {}
        }
        doc[col] = val;
      });

      // Handle auto-increment IDs
      const autoIncrementTables = ["bookings", "rough_customers", "rough_transactions"];
      if (autoIncrementTables.includes(table) && !doc.id) {
        let maxId = 0;
        if (db) {
          const highest = await db.collection(table).find().sort({ id: -1 }).limit(1).toArray();
          if (highest.length > 0) {
            maxId = Number(highest[0].id) || 0;
          }
        } else {
          const rows = readLocalData(table);
          rows.forEach(r => {
            const idNum = Number(r.id);
            if (idNum > maxId) maxId = idNum;
          });
        }
        doc.id = maxId + 1;
      }

      if (db) {
        const res = await db.collection(table).insertOne(doc);
        return [{ insertId: doc.id || res.insertedId }];
      } else {
        const rows = readLocalData(table);
        rows.push(doc);
        writeLocalData(table, rows);
        return [{ insertId: doc.id }];
      }
    }

    // 7. UPDATE <table> SET <col> = ?, <col2> = ? WHERE <col3> = ?
    const updateMatch = cleanSql.match(/UPDATE (\w+) SET (.*?) WHERE (.*?) = \?/i);
    if (updateMatch) {
      const table = updateMatch[1];
      const setsStr = updateMatch[2];
      const whereCol = updateMatch[3].trim().replace(/`/g, "");
      const whereVal = params[params.length - 1];

      // Parse SETs (e.g. usageCount = usageCount + 1 OR totalDue = ? OR name = ?, phone = ?)
      const updateDoc: any = {};
      let isIncrement = false;
      let incCol = "";

      if (setsStr.includes("usageCount = usageCount + 1")) {
        isIncrement = true;
        incCol = "usageCount";
      } else {
        const setPairs = setsStr.split(",").map(s => s.trim());
        setPairs.forEach((pair, idx) => {
          const colName = pair.split("=")[0].trim().replace(/`/g, "");
          updateDoc[colName] = params[idx];
        });
      }

      if (db) {
        let filterVal: any = whereVal;
        if (whereCol === "id" || whereCol === "customerId") {
          const num = Number(whereVal);
          if (!isNaN(num)) filterVal = num;
        }

        const updateOperation = isIncrement 
          ? { $inc: { [incCol]: 1 } }
          : { $set: updateDoc };

        await db.collection(table).updateMany({ [whereCol]: filterVal }, updateOperation);
        return [{ affectedRows: 1 }];
      } else {
        let rows = readLocalData(table);
        let affected = 0;
        rows = rows.map(r => {
          if (String(r[whereCol]) === String(whereVal)) {
            affected++;
            if (isIncrement) {
              r[incCol] = (Number(r[incCol]) || 0) + 1;
            } else {
              Object.keys(updateDoc).forEach(k => {
                r[k] = updateDoc[k];
              });
            }
          }
          return r;
        });
        writeLocalData(table, rows);
        return [{ affectedRows: affected }];
      }
    }

    // 8. DELETE FROM <table> WHERE <col> = ?
    const deleteMatch = cleanSql.match(/DELETE FROM (\w+) WHERE (\w+) = \?/i);
    if (deleteMatch) {
      const table = deleteMatch[1];
      const col = deleteMatch[2];
      const val = params[0];
      if (db) {
        let filterVal: any = val;
        if (col === "id") {
          const num = Number(val);
          if (!isNaN(num)) filterVal = num;
        }
        await db.collection(table).deleteOne({ [col]: filterVal });
        return [{ affectedRows: 1 }];
      } else {
        const rows = readLocalData(table);
        const filtered = rows.filter(r => String(r[col]) !== String(val));
        writeLocalData(table, filtered);
        return [{ affectedRows: rows.length - filtered.length }];
      }
    }

    console.warn(`Fallback: Executing unhandled SQL statement: ${cleanSql}`);
    return [[]];
  }
};

export { pool };
