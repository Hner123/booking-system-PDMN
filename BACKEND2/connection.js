import mysql from "mysql2/promise";

export const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "pdmn_db",
});

// Test the connection
// async function testConnection() {
//   try {
//     const connection = await pool.getConnection();
//     console.log("Database connected successfully!");
//     connection.release(); // Always release the connection back to the pool
//   } catch (error) {
//     console.error("Database connection failed:", error.message);
//   }
// }

// testConnection();