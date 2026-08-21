import mysql from "mysql2/promise";

const connectionString = process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/hotel_qr_dashboard";

function parseConnectionString(url: string) {
  try {
    const parsed = new URL(url);
    const database = parsed.pathname.substring(1);
    const username = parsed.username ? decodeURIComponent(parsed.username) : "root";
    const password = parsed.password ? decodeURIComponent(parsed.password) : "";
    return {
      host: parsed.hostname || "localhost",
      port: Number(parsed.port) || 3306,
      user: username,
      password: password,
      database: database || "hotel_qr_dashboard"
    };
  } catch {
    return {
      host: "localhost",
      port: 3306,
      user: "root",
      password: "",
      database: "hotel_qr_dashboard"
    };
  }
}

const config = parseConnectionString(connectionString);

// Primary Pool
let pool: mysql.Pool;

declare global {
  var dbPool: mysql.Pool | undefined;
}

if (process.env.NODE_ENV === "production") {
  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} else {
  if (!global.dbPool) {
    global.dbPool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  pool = global.dbPool;
}

// Function to initialize database and tables dynamically
export async function initDb() {
  try {
    // 1. Establish basic connection to check server/create database
    const tempConnection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
    await tempConnection.end();

    // 2. Initialize tables on our primary pool
    const conn = await pool.getConnection();
    try {
      // Table: coupons
      await conn.query(`
        CREATE TABLE IF NOT EXISTS coupons (
          code VARCHAR(50) PRIMARY KEY,
          type VARCHAR(20) NOT NULL,
          value DECIMAL(10,2) NOT NULL,
          minOrder DECIMAL(10,2) NOT NULL,
          active TINYINT(1) DEFAULT 1,
          usageCount INT DEFAULT 0,
          itemId VARCHAR(50) NULL
        );
      `);

      // Seed default coupons if none exist
      const [couponsRows]: any = await conn.query("SELECT COUNT(*) as count FROM coupons");
      if (couponsRows[0].count === 0) {
        await conn.query(`
          INSERT INTO coupons (code, type, value, minOrder, active, usageCount, itemId) VALUES
          ('VEGPANIER', 'flat', 100.00, 400.00, 1, 12, NULL),
          ('LUNCH25', 'percent', 25.00, 250.00, 1, 45, NULL),
          ('FIRSTORDER', 'flat', 50.00, 150.00, 1, 89, NULL),
          ('PANEER50', 'flat', 50.00, 0.00, 1, 5, 'm_paneer_butter_masala');
        `);
      }

      // Table: orders
      await conn.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(50) PRIMARY KEY,
          sourceType VARCHAR(20) NOT NULL,
          sourceLabel VARCHAR(100) NOT NULL,
          status VARCHAR(20) NOT NULL,
          placedAt VARCHAR(50) NOT NULL,
          updatedAt VARCHAR(50) NOT NULL,
          total DECIMAL(10,2) NOT NULL,
          couponCode VARCHAR(50) NULL,
          discount DECIMAL(10,2) NULL,
          items JSON NOT NULL,
          instructions TEXT NULL
        );
      `);

      // Seed mock orders if empty
      const [ordersRows]: any = await conn.query("SELECT COUNT(*) as count FROM orders");
      if (ordersRows[0].count === 0) {
        await conn.query(`
          INSERT INTO orders (id, sourceType, sourceLabel, status, placedAt, updatedAt, total, couponCode, discount, items, instructions) VALUES
          ('ORD-4927', 'room', 'Room 204', 'pending', '${new Date().toISOString()}', '${new Date().toISOString()}', 475.00, NULL, NULL, 
           '[{"id":"m_paneer_butter_masala","name":"Paneer Butter Masala","qty":1,"price":310,"veg":true},{"id":"m_tandoori_roti","name":"Tandoori Roti","qty":2,"price":45,"veg":true},{"id":"m_jeera_rice","name":"Jeera Rice","qty":1,"price":120,"veg":true}]', NULL),
          ('ORD-8812', 'table', 'Table T4', 'preparing', '${new Date().toISOString()}', '${new Date().toISOString()}', 355.00, 'FIRSTORDER', 50.00, 
           '[{"id":"m_paneer_tikka","name":"Paneer Tikka","qty":1,"price":245,"veg":true},{"id":"m_masala_chai","name":"Masala Chai","qty":2,"price":80,"veg":true}]', 'Make paneer spicy'),
          ('ORD-1049', 'table', 'Table T1', 'ready', '${new Date().toISOString()}', '${new Date().toISOString()}', 180.00, NULL, NULL, 
           '[{"id":"m_veg_manchurian","name":"Veg Manchurian","qty":1,"price":180,"veg":true}]', NULL);
        `);
      }

      // Drop old bookings table to update schema dynamically
      await conn.query("DROP TABLE IF EXISTS bookings;");

      // Table: bookings
      await conn.query(`
        CREATE TABLE IF NOT EXISTS bookings (
          id INT AUTO_INCREMENT PRIMARY KEY,
          roomId VARCHAR(50) NOT NULL,
          roomNumber VARCHAR(50) NOT NULL,
          guestName VARCHAR(100) NOT NULL,
          mobileNumber VARCHAR(20) NOT NULL,
          idType VARCHAR(50) NOT NULL,
          idNumber VARCHAR(50) NOT NULL,
          idPhotoFront LONGTEXT NULL,
          idPhotoBack LONGTEXT NULL,
          passportCountry VARCHAR(100) NULL,
          address VARCHAR(255) NULL,
          adults INT DEFAULT 1,
          children INT DEFAULT 0,
          coGuests JSON NULL,
          checkInDate VARCHAR(50) NOT NULL,
          checkOutDate VARCHAR(50) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          paymentMode VARCHAR(50) NOT NULL,
          advancePaid DECIMAL(10,2) DEFAULT 0,
          bookingSource VARCHAR(50) NOT NULL,
          tariff DECIMAL(10,2) NOT NULL,
          extraCharge DECIMAL(10,2) DEFAULT 0,
          gst DECIMAL(10,2) DEFAULT 0,
          discount DECIMAL(10,2) DEFAULT 0,
          status VARCHAR(20) DEFAULT 'active'
        );
      `);

      // Seed mock bookings if empty
      const [bookingsRows]: any = await conn.query("SELECT COUNT(*) as count FROM bookings");
      if (bookingsRows[0].count === 0) {
        await conn.query(`
          INSERT INTO bookings (roomId, roomNumber, guestName, mobileNumber, idType, idNumber, idPhotoFront, idPhotoBack, passportCountry, address, adults, children, coGuests, checkInDate, checkOutDate, price, paymentMode, advancePaid, bookingSource, tariff, extraCharge, gst, discount, status) VALUES
          ('r3', '204', 'Rohan Gupta', '9876543210', 'Aadhaar', '5849-2049-1029', NULL, NULL, NULL, 'New Delhi, Delhi', 2, 0,
           '[{"name":"Priya Gupta","idType":"Aadhaar","idNumber":"1940-2094-1049","idPhotoFront":null,"idPhotoBack":null}]',
           '${new Date().toISOString().split("T")[0]}T12:00', '${new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0]}T11:00', 7500.00, 'UPI', 2000.00, 'Online', 2500.00, 0.00, 0.00, 0.00, 'active'),
          ('r1', '101', 'Aniket Sharma', '8888888888', 'Aadhaar', '9019-3829-1022', NULL, NULL, NULL, 'Mumbai, Maharashtra', 1, 0, NULL,
           '${new Date().toISOString().split("T")[0]}T14:00', '${new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]}T12:00', 3600.00, 'Cash', 0.00, 'Walk-in', 1800.00, 0.00, 0.00, 0.00, 'active'),
          ('r5', '301', 'Vikram Singh', '7777777777', 'Aadhaar', '3049-1920-4491', NULL, NULL, NULL, 'Jaipur, Rajasthan', 2, 1,
           '[{"name":"Karan Singh","idType":"Aadhaar","idNumber":"4092-2930-1092","idPhotoFront":null,"idPhotoBack":null},{"name":"Suman Singh","idType":"Aadhaar","idNumber":"8920-1920-3301","idPhotoFront":null,"idPhotoBack":null}]',
           '${new Date().toISOString().split("T")[0]}T13:00', '${new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0]}T11:00', 16000.00, 'Card', 5000.00, 'Travel Agent', 3200.00, 0.00, 0.00, 0.00, 'active');
      `);
      }

      // Drop old rough_orders if it exists to clean up
      await conn.query("DROP TABLE IF EXISTS rough_orders;");

      // Table: rough_customers
      await conn.query(`
        CREATE TABLE IF NOT EXISTS rough_customers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL UNIQUE,
          phone VARCHAR(20) NULL,
          totalDue DECIMAL(10,2) NOT NULL DEFAULT 0.00,
          createdAt VARCHAR(50) NOT NULL,
          updatedAt VARCHAR(50) NOT NULL
        );
      `);

      // Table: rough_transactions
      await conn.query(`
        CREATE TABLE IF NOT EXISTS rough_transactions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customerId INT NOT NULL,
          type VARCHAR(20) NOT NULL, -- 'bill' or 'payment'
          amount DECIMAL(10,2) NOT NULL,
          items JSON NULL,
          notes TEXT NULL,
          createdAt VARCHAR(50) NOT NULL,
          FOREIGN KEY (customerId) REFERENCES rough_customers(id) ON DELETE CASCADE
        );
      `);

      // Seed mock customers and transactions if none exist
      const [customerCountRows]: any = await conn.query("SELECT COUNT(*) as count FROM rough_customers");
      if (customerCountRows[0].count === 0) {
        const now = new Date().toISOString();
        
        // Suresh Kumar Profile
        const [sureshResult]: any = await conn.query(
          "INSERT INTO rough_customers (name, phone, totalDue, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
          ['Suresh Kumar', '9876543201', 150.00, now, now]
        );
        const sureshId = sureshResult.insertId;
        
        await conn.query(
          "INSERT INTO rough_transactions (customerId, type, amount, items, notes, createdAt) VALUES (?, 'bill', 450.00, ?, 'Dinner bill', ?)",
          [sureshId, JSON.stringify([{name:"Kadai Paneer",qty:1,price:250},{name:"Butter Naan",qty:4,price:50}]), now]
        );
        await conn.query(
          "INSERT INTO rough_transactions (customerId, type, amount, items, notes, createdAt) VALUES (?, 'payment', 300.00, NULL, 'Paid cash, said will clear rest tomorrow morning', ?)",
          [sureshId, now]
        );

        // Ramesh Uncle Profile
        const [rameshResult]: any = await conn.query(
          "INSERT INTO rough_customers (name, phone, totalDue, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
          ['Ramesh Uncle', '9822114455', -20.00, now, now]
        );
        const rameshId = rameshResult.insertId;
        
        await conn.query(
          "INSERT INTO rough_transactions (customerId, type, amount, items, notes, createdAt) VALUES (?, 'bill', 180.00, ?, 'Evening tea', ?)",
          [rameshId, JSON.stringify([{name:"Masala Chai",qty:4,price:45}]), now]
        );
        await conn.query(
          "INSERT INTO rough_transactions (customerId, type, amount, items, notes, createdAt) VALUES (?, 'payment', 200.00, NULL, 'Gave extra 20 rupees, adjust in tomorrow morning tea', ?)",
          [rameshId, now]
        );

        // Dr. Amit Verma Profile
        const [amitResult]: any = await conn.query(
          "INSERT INTO rough_customers (name, phone, totalDue, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
          ['Dr. Amit Verma', '9911883344', 0.00, now, now]
        );
        const amitId = amitResult.insertId;
        
        await conn.query(
          "INSERT INTO rough_transactions (customerId, type, amount, items, notes, createdAt) VALUES (?, 'bill', 320.00, ?, 'Lunch', ?)",
          [amitId, JSON.stringify([{name:"Veg Biryani",qty:1,price:280},{name:"Sweet Lassi",qty:1,price:40}]), now]
        );
        await conn.query(
          "INSERT INTO rough_transactions (customerId, type, amount, items, notes, createdAt) VALUES (?, 'payment', 320.00, NULL, 'Fully paid via UPI', ?)",
          [amitId, now]
        );
      }

      console.log("MySQL Database Initialized Successfully!");
    } finally {
      conn.release();
    }
  } catch (err) {
    console.error("Database connection/init failed:", err);
  }
}

export { pool };
