const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  CreateNotification,
  GetAllNotifications,
  GetNotificationById,
  UpdateNotification,
  DeleteNotification,

  CreateNotificationWithAuth,
  GetAllNotificationsWithAuth,
  GetNotificationByIdWithAuth,
  UpdateNotificationWithAuth,
  DeleteNotificationWithAuth,
} = require('../controllers/NotifController');

// router.use(requireAuth);
router.post("/new", CreateNotification);
router.get("/", GetAllNotifications);
router.get("/:id", GetNotificationById);
router.patch("/:id", UpdateNotification);
router.delete("/delete/:id", DeleteNotification);

module.exports = router;
