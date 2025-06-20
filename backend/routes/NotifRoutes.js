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
} = require("../controllers/NotifController");

router.use(requireAuth);
router.post("/new", CreateNotificationWithAuth);
router.get("/", GetAllNotificationsWithAuth);
router.get("/:id", GetNotificationByIdWithAuth);
router.patch("/:id", UpdateNotificationWithAuth);
router.delete("/delete/:id", DeleteNotificationWithAuth);

module.exports = router;
