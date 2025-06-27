import express from "express";
import { ChangeEmail, PendingApproval, Approval, SendInvite } from "../controllers/EmailsController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.post("/changeemail", ChangeEmail);
router.post("/pending/:id", PendingApproval);
router.post("/approval", Approval);
router.post("/invite/:id", SendInvite);

export default router;
