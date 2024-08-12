const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  ForgotPass,
  
  ChangeEmail,
  Approval,
  SendInvite,
  PendingApproval,

  ApprovalWithAuth,
  SendInviteWithAuth,
  PendingApprovalWithAuth
} = require("../controllers/Emails");

router.post("/forgotpass", ForgotPass);
router.post("/changeemail", ChangeEmail);
// router.use(requireAuth);
router.post("/approval", Approval);
router.post("/invite/:id", SendInvite);
router.post("/pending/:id", PendingApproval)

module.exports = router;
