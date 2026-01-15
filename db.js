require("dotenv").config();
const mysql = require("mysql2/promise");

// Create a connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "special_needs",
});

// Initialize database connection
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ MySQL Connected");
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { pool, initializeDatabase };
