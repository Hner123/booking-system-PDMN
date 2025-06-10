import { pool } from "../connection.js"; // ← Added .js extension
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; // Add JWT

const JWT_SECRET = process.env.JWT_SECRET;

export const LoginAdmin = async (req, res) => {
  const { adminUser, adminPass } = req.body;

  try {
    // First get the user
    const [rows] = await pool.execute(
      "SELECT * FROM admin WHERE adminUser = ?", 
      [adminUser]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const admin = rows[0];
    
    // Compare password (assuming password is hashed in database)
    const isValidPassword = await bcrypt.compare(adminPass, admin.adminPass);

    if (isValidPassword) {
      console.log("Authentication successful");

            // Generate JWT token
      const authToken = jwt.sign(
        { 
          _id: admin.id, // Use _id to match frontend expectation
          adminUser: admin.adminUser 
        }, 
        JWT_SECRET, 
        { expiresIn: "1h" }
      );

      res.json({ 
        success: true, 
        message: "Login successful",
        user: {
          _id: admin.id,
          adminUser: admin.adminUser // ← Fixed: use adminUser instead of username
        },
        authToken
      });
    } else {
      console.log("Invalid password");
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: error.message });
  }
};