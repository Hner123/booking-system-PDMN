const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  ForgotPass,
  ChangeEmail,
  ValidateUserData,
  LoginUser,
  LoginAdmin,
  Approval,
  CheckPass,
  ResetPassword,

  ChangeEmailWithAuth,
  ApprovalWithAuth,
  CheckPassWithAuth,
  ResetPasswordWithAuth
} = require("../controllers/Validate");

router.post("/forgotpass", ForgotPass);
router.post("/validate", ValidateUserData);
router.post("/login/user", LoginUser);
router.post("/login/admin", LoginAdmin);
// router.use(requireAuth);
router.post("/changeemail", ChangeEmail);
router.post("/approval", Approval);
router.post("/check", CheckPass);
router.patch("/resetpass/:id", ResetPassword);

module.exports = router;
