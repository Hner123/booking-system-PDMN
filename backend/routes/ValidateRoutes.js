const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  ChangePass,
  ChangeEmail,
  ValidateUserData,
  LoginUser,
  LoginAdmin,
  Approval,
  CheckPass,

  ChangeEmailWithAuth,
  ApprovalWithAuth,
  CheckPassWithAuth,
} = require("../controllers/Validate");

router.post("/changepass", ChangePass);
router.post("/validate", ValidateUserData);
router.post("/login/user", LoginUser);
router.post("/login/admin", LoginAdmin);
// router.use(requireAuth);
router.post("/changeemail", ChangeEmail);
router.post("/approval", Approval);
router.post("/check", CheckPass);

module.exports = router;
