import express from "express";

import { LoginAdmin, ValidateUserData, LoginUser, CheckPass } from "../controllers/Validate.js";

const router = express.Router();

router.post("/login/admin", LoginAdmin);
router.post("/validate", ValidateUserData);
router.post("/login/user", LoginUser);
router.post("/check", CheckPass);

export default router;
