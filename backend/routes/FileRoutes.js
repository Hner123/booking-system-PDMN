const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  SendAdminAttachment,
  SendAllAttachment,
  SendUserAttachment,
} = require("../controllers/File");

router.get('/attachment-admin', SendAdminAttachment);
router.get('/attachment-all', SendAllAttachment);
router.get('/attachment-user/:id', SendUserAttachment);

module.exports = router;