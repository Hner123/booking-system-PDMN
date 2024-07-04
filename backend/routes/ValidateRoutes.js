const express = require("express");
const router = express.Router();
const requireAuth = require('../utils/requireAuth')

const {
  LogChangePass,
  ValidateUserData,
  LoginUser,
  LoginAdmin,
} = require("../controllers/Validate");

router.post("/email", LogChangePass);
router.post("/validate", ValidateUserData)
router.post("/login/user", LoginUser)
router.post("/login/admin", LoginAdmin)

module.exports = router;