import express from "express";
import { GetSpecificAdmin, GetAllAdmin } from "../controllers/AdminController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.get("/:id", verifyAdminToken, GetSpecificAdmin);
router.get("/", verifyAdminToken, GetAllAdmin);

export default router;
