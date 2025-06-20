import { pool } from "../connection.js";

export const GetSpecificAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const [rows] = await pool.execute("SELECT * FROM admin WHERE _id = ?", [id]);

    if (rows.length >= 1) {
      // Return the first admin object, not the array
      return res.status(200).json(rows[0]);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error in GetSpecificAdmin:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const GetAllAdmin = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM admin");
    res.status(200).json(rows);
  } catch (err) {
    console.error("Error in GetAllAdmin:", err);
    res.status(500).json({ message: err.message });
  }
};
