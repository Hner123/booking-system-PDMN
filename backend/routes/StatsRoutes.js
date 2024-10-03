const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  SaveData,
  GetCacheFile,
  ListJsonFiles
} = require("../controllers/Stats.js");

router.post("/save", SaveData)
router.post("/get", GetCacheFile);
router.get("/getList", ListJsonFiles);

module.exports = router;
