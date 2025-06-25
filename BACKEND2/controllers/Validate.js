import { pool } from "../connection.js"; // ← Added .js extension
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // Add JWT

const JWT_SECRET = process.env.JWT_SECRET;

export const LoginAdmin = async (req, res) => {
  const { adminUser, adminPass } = req.body;

  try {
    // First get the user
    const [rows] = await pool.execute("SELECT * FROM admin WHERE adminUser = ?", [adminUser]);

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
          adminUser: admin.adminUser,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        user: {
          _id: admin._id,
          adminUser: admin.adminUser, // ← Fixed: use adminUser instead of username
        },
        authToken,
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

export const ValidateUserData = async (req, res) => {
  try {
    const { userName, email } = req.body;

    // Handle undefined values - convert to null or skip query entirely
    const [userNameRows] = userName ? await pool.execute("SELECT * FROM users WHERE userName = ?", [userName]) : [[]]; // Empty result if userName is undefined

    const [emailRows] = email ? await pool.execute("SELECT * FROM users WHERE email = ?", [email]) : [[]]; // Empty result if email is undefined

    res.status(200).json({
      userName: {
        exists: userNameRows.length > 0,
        userId: userNameRows.length > 0 ? userNameRows[0]._id : null,
      },
      email: {
        exists: emailRows.length > 0,
        userId: emailRows.length > 0 ? emailRows[0]._id : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { userName, passWord } = req.body;

    // First get the user
    const [rows] = await pool.execute("SELECT * FROM users WHERE userName = ?", [userName]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];

    // Compare password (assuming password is hashed in database)
    const isValidPassword = await bcrypt.compare(passWord, user.passWord);

    if (isValidPassword) {
      console.log("Authentication successful");

      // Generate JWT token
      const authToken = jwt.sign(
        {
          _id: user._id, // Use _id to match frontend expectation
          user: user.userName,
        },
        process.env.JWT_SECRET
        // { expiresIn: "1h" }
      );

      res.json({
        success: true,
        message: "Login successful",
        user: {
          _id: user._id,
        },
        authToken,
      });
    } else {
      console.log("Invalid password");
      res.status(401).json({ message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const CheckPass = async (req, res) => {
  const { currPass, hashedPassword } = req.body;
  try {
    const isMatch = await bcrypt.compare(currPass, hashedPassword);
    res.json({ isMatch });
  } catch (error) {
    res.status(500).json({ error: "Error validating password" });
  }
};
