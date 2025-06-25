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
  PendingApprovalWithAuth,
} = require("../controllers/Emails");

router.post("/forgotpass", ForgotPass);
router.post("/changeemail", ChangeEmail);
router.use(requireAuth);
router.post("/approval", ApprovalWithAuth);
router.post("/invite/:id", SendInviteWithAuth);
router.post("/pending/:id", PendingApprovalWithAuth);

module.exports = router;
