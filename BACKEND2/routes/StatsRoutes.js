import express from "express";

import {ListJsonFiles } from "../controllers/Stats.js"

const router = express.Router();

router.get("/getList", ListJsonFiles);

export default router;
