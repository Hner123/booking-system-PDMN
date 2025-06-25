import express from "express";
import { GetAllUsers, CreateUser, EditUser, DeleteUser, GetSpecificUser } from "../controllers/UserController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.get("/", verifyAdminToken, GetAllUsers);
router.get("/:id", GetSpecificUser);
router.post("/create", verifyAdminToken, CreateUser);
router.patch("/edit/:id", verifyAdminToken, EditUser);
router.delete("/delete/:id", verifyAdminToken, DeleteUser);

export default router;
