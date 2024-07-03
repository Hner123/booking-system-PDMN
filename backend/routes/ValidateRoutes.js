const express = require("express");
const router = express.Router();
const requireAuth = require('../utils/requireAuth')

const {
  LogChangePass
} = require("../controllers/Validate");

router.post("/email", LogChangePass);

module.exports = router;