import express from "express";

import {GetAllUsers } from "../controllers/UserController.js"

const router = express.Router();

router.get("/user", GetAllUsers);

export default router;
