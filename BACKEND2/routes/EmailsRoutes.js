import express from "express";
import { ChangeEmail } from "../controllers/EmailsController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.post("/changeemail", ChangeEmail);

export default router;
