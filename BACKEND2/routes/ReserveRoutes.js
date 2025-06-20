import express from "express";
import { GetAllReserve } from "../controllers/ReserveController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.get("/", verifyAdminToken, GetAllReserve);

export default router;
