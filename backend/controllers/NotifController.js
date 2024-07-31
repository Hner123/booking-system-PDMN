const mongoose = require("mongoose");
const NotifModel = require("../models/NotifModel"); // Update the path as necessary
const requireAuth = require("../utils/requireAuth");

const GetAllNotifications = async (req, res) => {
  try {
    const notifications = await NotifModel.find({})
      .populate("booking")
      .populate("sender")
      .populate("receiver");
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const GetNotificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await NotifModel.findById(id)
      .populate("booking")
      .populate("sender")
      .populate("receiver");

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const CreateNotification = async (req, res) => {
  try {
    const notif = req.body;

    const result = await NotifModel.create({
      booking: notif.booking,
      message: notif.message,
      sender: notif.sender,
      senderType: notif.senderType,
      receiver: notif.receiver,
      receiverType: notif.receiverType,
      read: false,
      createdAt: new Date(),
    });

    const io = req.app.get('socketio');
    io.to(notif.receiver).emit('newNotification', result);

    res.status(201).json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const UpdateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = req.body;

    const currentNotif = await NotifModel.findById(id);

    if (!currentNotif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    let update = {
      $set: {
        read: notif.read,
      },
    };

    const result = await NotifModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const DeleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notif = await NotifModel.findByIdAndDelete(id);

    if (!notif) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const CreateNotificationWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await CreateNotification(req, res);
  });
};
const GetAllNotificationsWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetAllNotifications(req, res);
  });
};
const GetNotificationByIdWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetNotificationById(req, res);
  });
};
const UpdateNotificationWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await UpdateNotification(req, res);
  });
};
const DeleteNotificationWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await DeleteNotification(req, res);
  });
};

module.exports = {
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
};
