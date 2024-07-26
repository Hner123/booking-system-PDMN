const express = require("express");
const router = express.Router();
const requireAuth = require('../utils/requireAuth')

const {
  LogChangePass,
  ChangeEmail,
  ValidateUserData,
  LoginUser,
  LoginAdmin,
  Approval,

  ChangeEmailWithAuth,
  ApprovalWithAuth
} = require("../controllers/Validate");

router.post("/changepass", LogChangePass);
router.post("/validate", ValidateUserData);
router.post("/login/user", LoginUser);
router.post("/login/admin", LoginAdmin);
// router.use(requireAuth);
router.post("/changeemail", ChangeEmail);
router.post("/approval", Approval);

module.exports = router;