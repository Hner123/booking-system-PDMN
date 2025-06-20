import { pool } from "../connection.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const GetAllUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users");

    // Return success response with proper status
    return res.status(200).json(rows);
  } catch (err) {
    console.error("Error fetching users:", err);

    // Return error response with proper status
    return res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
    });
  }
};
