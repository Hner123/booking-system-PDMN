import express from "express";

import { LoginAdmin } from "../controllers/Validate.js";

const router = express.Router();

router.post("/login/admin", LoginAdmin);

export default router;