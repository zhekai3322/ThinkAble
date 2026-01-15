require("dotenv").config();
const mysql = require("mysql2/promise");

// Create a connection pool for MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "thinkable",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database tables
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ MySQL Connected");

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'parent', 'student') DEFAULT 'student',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table initialized");

    // Create user_profiles table for additional info
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(20),
        avatar VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ User profiles table initialized");

  } catch (error) {
    console.error("❌ Database initialization error:", error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

module.exports = { pool, initializeDatabase };
