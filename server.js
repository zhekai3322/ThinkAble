require("dotenv").config();

console.log("PORT =", process.env.PORT);

const express = require("express");
const cors = require("cors");
const { pool, initializeDatabase } = require("./db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("."));
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: "Server error" });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    await createTablesIfNotExist();
    await seedDefaultAdmin();
    
    app.listen(process.env.PORT || 3000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Create database tables if they don't exist
async function createTablesIfNotExist() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'parent', 'admin') DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Users table created or already exists");
    
    // Create progress table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        worksheet_id INT,
        score INT DEFAULT 0,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log("✅ Progress table created or already exists");
    
  } catch (error) {
    console.error("Error creating tables:", error);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Seed default admin account
async function seedDefaultAdmin() {
  let connection;
  try {
    const bcrypt = require("bcrypt");
    connection = await pool.getConnection();
    
    // Check if admin account already exists
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      ["admin@thinkable.com"]
    );
    
    if (rows.length === 0) {
      // Create admin account
      const hashedPassword = await bcrypt.hash("admin", 10);
      await connection.execute(
        "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
        ["admin@thinkable.com", hashedPassword, "admin"]
      );
      console.log("✅ Default admin account created: admin@thinkable.com / admin");
    } else {
      console.log("✅ Admin account already exists");
    }
  } catch (error) {
    console.error("Error seeding admin account:", error);
  } finally {
    if (connection) connection.release();
  }
}

startServer();
