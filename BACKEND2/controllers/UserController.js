import { pool } from "../connection.js"; // ← Added .js extension
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Add JWT

export const GetAllUsers = async (req, res) => {
  try {

    const [rows] = await pool.execute("SELECT * FROM users");
    res.json(rows);
    } catch (err) {
        res.send(err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};