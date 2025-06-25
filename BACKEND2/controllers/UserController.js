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

export const CreateUser = async (req, res) => {
  try {
    const user = req.body;

    const hashPassWord = await bcrypt.hash(user.passWord, 13);

    // Correct INSERT syntax with all fields
    // Only insert the fields that are provided
    const [result] = await pool.execute("INSERT INTO users (userName, passWord) VALUES (?, ?)", [
      user.userName,
      hashPassWord,
    ]);

    // Check if insert was successful using affectedRows
    if (result.affectedRows > 0) {
      const responseData = {
        id: result.insertId, // Get the auto-generated ID
        userName: user.userName,
        resetPass: false,
        // Don't return the hashed password for security
      };
      res.status(201).json({ result: responseData });
    } else {
      res.status(400).json({ message: "Failed to create user" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const EditUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, email } = req.body;

    // Check if user exists (use 'id' instead of '_id')
    const [currentUser] = await pool.execute("SELECT * FROM users WHERE _id = ?", [id]);

    if (currentUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build dynamic UPDATE query based on provided fields
    const updateFields = [];
    const updateValues = [];

    if (department !== undefined) {
      updateFields.push("department = ?");
      updateValues.push(department);
    }

    if (email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    // If no fields to update
    if (updateFields.length === 0) {
      return res.status(400).json({ message: "No fields provided to update" });
    }

    // Single UPDATE query with dynamic fields
    const updateQuery = `UPDATE users SET ${updateFields.join(", ")} WHERE _id = ?`;
    updateValues.push(id);

    const [result] = await pool.execute(updateQuery, updateValues);

    if (result.affectedRows > 0) {
      // Fetch the updated user data
      const [updatedUser] = await pool.execute("SELECT * FROM users WHERE _id = ?", [id]);
      res.status(201).json(updatedUser[0]); // 200 for updates, not 201
    } else {
      res.status(400).json({ message: "Failed to update user" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists before deleting
    const [currentUser] = await pool.execute("SELECT * FROM users WHERE _id = ?", [id]);

    if (currentUser.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Correct DELETE syntax: DELETE FROM table WHERE condition (no *)
    const [result] = await pool.execute("DELETE FROM users WHERE _id = ?", [id]);

    if (result.affectedRows > 0) {
      // Return the deleted user data (captured before deletion)
      res.status(200).json(currentUser[0]);
    } else {
      res.status(400).json({ message: "Failed to delete user" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const GetSpecificUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const [rows] = await pool.execute("SELECT * FROM users WHERE _id = ?", [id]);

    if (rows.length >= 1) {
      // Return the first admin object, not the array
      return res.status(200).json(rows[0]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
