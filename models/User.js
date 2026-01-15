const { pool } = require("../db");
const bcrypt = require("bcrypt");

// Create a new user
async function createUser(email, password, role = "student") {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await connection.execute(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashedPassword, role]
    );
    
    return {
      id: result.insertId,
      email,
      role,
    };
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Find user by email
async function findUserByEmail(email) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Find user by ID
async function findUserById(id) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT id, email, role, createdAt FROM users WHERE id = ?",
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Verify password
async function verifyPassword(inputPassword, hashedPassword) {
  try {
    return await bcrypt.compare(inputPassword, hashedPassword);
  } catch (error) {
    throw error;
  }
}

// Get all users (admin only)
async function getAllUsers() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(
      "SELECT id, email, role, createdAt FROM users"
    );
    return rows;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Delete user by ID
async function deleteUserById(id) {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(
      "DELETE FROM users WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
  getAllUsers,
  deleteUserById,
};
