import express from "express";
import { GetAllNotifications, CreateNotification } from "../controllers/NotifController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.get("/", verifyAdminToken, GetAllNotifications);
router.post("/new", verifyAdminToken, CreateNotification);

export default router;
