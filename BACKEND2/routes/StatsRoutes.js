import express from "express";

import { ListJsonFiles, GetCacheFile } from "../controllers/Stats.js";

const router = express.Router();

router.get("/getList", ListJsonFiles);
router.post("/get", GetCacheFile);

export default router;
