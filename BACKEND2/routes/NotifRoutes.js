import express from "express";
import { GetAllNotifications } from "../controllers/NotifController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.get("/", verifyAdminToken, GetAllNotifications);

export default router;
