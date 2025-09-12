import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Mysql@9530",
  database: process.env.DB_NAME || "projectpfcard",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database connection wrapper
export const db = {
  // Execute query with parameters (prepared statements)
  async query(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },

  // Simple query without prepared statements (for transactions)
  async simpleQuery(sql) {
    try {
      const [rows] = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  },

  // Get connection for transactions
  async getConnection() {
    return await pool.getConnection();
  },

  // Test database connection
  async testConnection() {
    try {
      const connection = await pool.getConnection();
      console.log("✅ Database connected successfully");
      connection.release();
      return true;
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
      return false;
    }
  },
};

export default db;
