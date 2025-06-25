import express from "express";
import {
  GetAllReserve,
  CreateReserve,
  GetSpecificReserve,
  DeleteReserve,
  EditReserve,
  EditReserveFinal,
} from "../controllers/ReserveController.js";
import { verifyAdminToken } from "../middleware/authMiddleware.js"; // Add auth middleware

const router = express.Router();

// Add authentication middleware to protect the route
router.get("/", verifyAdminToken, GetAllReserve);
router.post("/create", verifyAdminToken, CreateReserve);
router.get("/:id", verifyAdminToken, GetSpecificReserve);
router.delete("/delete/:id", verifyAdminToken, DeleteReserve);
router.patch("/edit/:id", verifyAdminToken, EditReserve);
router.patch("/edit2/:id", verifyAdminToken, EditReserveFinal);

export default router;
