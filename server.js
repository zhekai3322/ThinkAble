require("dotenv").config();

console.log("PORT =", process.env.PORT);
console.log("DB_HOST =", process.env.DB_HOST);

const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db");

// Import routes
const authRoutes = require("./routes/authRoutes");
const progressRoutes = require("./routes/progressRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Initialize database on startup
initializeDatabase();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);

app.get("/", (req, res) => {
  res.send("ThinkAble API running");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ success: false, message: "Server error" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 3000}`);
});
