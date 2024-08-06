const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  GenerateMonthlyPDF,
  GenerateUserPDF
} = require("../controllers/File");

router.get('/monthly', GenerateMonthlyPDF);
router.get('/user/:id', GenerateUserPDF);

module.exports = router;