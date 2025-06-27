import { pool } from "../connection.js";

export const GetAllNotifications = async (req, res) => {
  try {
    // Get all notifications first
    const [notifsRows] = await pool.execute("SELECT * FROM notifs");

    if (notifsRows.length === 0) {
      return res.status(200).json([]);
    }

    // Get all bookings
    const [bookingRows] = await pool.execute("SELECT * FROM booking");

    // Get all unique user and admin IDs from notifications
    const userIds = [
      ...new Set(
        notifsRows
          .filter((notif) => notif.senderType === "user" || notif.receiverType === "user")
          .flatMap((notif) => [
            notif.senderType === "user" ? notif.sender_id : null,
            notif.receiverType === "user" ? notif.receiver_id : null,
          ])
          .filter((id) => id)
      ),
    ];

    const adminIds = [
      ...new Set(
        notifsRows
          .filter((notif) => notif.senderType === "admin" || notif.receiverType === "admin")
          .flatMap((notif) => [
            notif.senderType === "admin" ? notif.sender_id : null,
            notif.receiverType === "admin" ? notif.receiver_id : null,
          ])
          .filter((id) => id)
      ),
    ];

    // Fetch users and admins data
    let usersRows = [];
    let adminsRows = [];

    if (userIds.length > 0) {
      const userPlaceholders = userIds.map(() => "?").join(",");
      [usersRows] = await pool.execute(`SELECT * FROM users WHERE _id IN (${userPlaceholders})`, userIds);
    }

    if (adminIds.length > 0) {
      const adminPlaceholders = adminIds.map(() => "?").join(",");
      [adminsRows] = await pool.execute(`SELECT * FROM admin WHERE _id IN (${adminPlaceholders})`, adminIds);
    }

    // Get booking IDs that have notifications
    const bookingIds = notifsRows.map((notif) => notif.booking_id).filter((id) => id);

    if (bookingIds.length === 0) {
      // Return notifications without booking data
      const notifications = notifsRows.map((notif) => ({
        _id: notif._id,
        booking: null,
        message: notif.message,
        sender: notif.sender,
        senderType: notif.senderType,
        receiver: notif.receiver,
        receiverType: notif.receiverType,
        read: notif.read_, // Fixed: Use consistent field name
        createdAt: notif.created_at, // Fixed: Use consistent field name
      }));
      return res.status(200).json(notifications);
    }

    const placeholders = bookingIds.map(() => "?").join(",");

    // Fetch all related booking data in batch queries
    const [capsRows] = await pool.execute(`SELECT * FROM caps WHERE booking_id IN (${placeholders})`, bookingIds);

    const [approvalRows] = await pool.execute(
      `SELECT * FROM approval WHERE booking_id IN (${placeholders})`,
      bookingIds
    );

    const [attendeesRows] = await pool.execute(
      `SELECT * FROM attendees WHERE booking_id IN (${placeholders})`,
      bookingIds
    );

    const [guestRows] = await pool.execute(`SELECT * FROM guest WHERE booking_id IN (${placeholders})`, bookingIds);

    // Create lookup maps for O(1) access
    const bookingMap = new Map();
    const capsMap = new Map();
    const approvalMap = new Map();
    const attendeesMap = new Map();
    const guestMap = new Map();
    const usersMap = new Map();
    const adminsMap = new Map();

    // Build user and admin lookup maps
    usersRows.forEach((user) => {
      usersMap.set(user._id, user);
    });

    adminsRows.forEach((admin) => {
      adminsMap.set(admin._id, admin);
    });

    // Build booking lookup map
    bookingRows.forEach((booking) => {
      bookingMap.set(booking._id, booking);
    });

    capsRows.forEach((cap) => {
      capsMap.set(cap.booking_id, cap);
    });

    approvalRows.forEach((approval) => {
      approvalMap.set(approval.booking_id, approval);
    });

    attendeesRows.forEach((attendee) => {
      if (!attendeesMap.has(attendee.booking_id)) {
        attendeesMap.set(attendee.booking_id, []);
      }
      attendeesMap.get(attendee.booking_id).push(attendee.attendees || attendee.name);
    });

    guestRows.forEach((guest) => {
      if (!guestMap.has(guest.booking_id)) {
        guestMap.set(guest.booking_id, []);
      }
      guestMap.get(guest.booking_id).push(guest.guest || guest.name);
    });

    // Build final notifications with booking data
    const notifications = notifsRows.map((notif) => {
      const booking = bookingMap.get(notif.booking_id);

      let bookingData = null;
      if (booking) {
        bookingData = {
          _id: booking._id,
          roomName: booking.roomName,
          title: booking.title,
          agenda: booking.agenda,
          scheduleDate: booking.scheduleDate,
          startTime: booking.startTime,
          endTime: booking.endTime,
          user: booking.user,
          confirmation: booking.confirmation === 1 ? true : false,
          caps: capsMap.get(booking._id) || {},
          approval: approvalMap.get(booking._id) || {},
          attendees: attendeesMap.get(booking._id) || [],
          guest: guestMap.get(booking._id) || [],
        };
      }

      // Get sender data based on senderType
      let senderData = null;
      if (notif.sender_id) {
        if (notif.senderType === "user") {
          senderData = usersMap.get(notif.sender_id);
        } else if (notif.senderType === "admin") {
          senderData = adminsMap.get(notif.sender_id);
        }
      }

      // Get receiver data based on receiverType
      let receiverData = null;
      if (notif.receiver_id) {
        if (notif.receiverType === "user") {
          receiverData = usersMap.get(notif.receiver_id);
        } else if (notif.receiverType === "admin") {
          receiverData = adminsMap.get(notif.receiver_id);
        }
      }

      return {
        _id: notif._id,
        booking: bookingData,
        message: notif.message,
        sender: senderData,
        senderType: notif.senderType,
        receiver: receiverData,
        receiverType: notif.receiverType,
        read: notif.read_ === 0 ? false : true, // Fixed: Use consistent field name
        createdAt: notif.created_at, // Fixed: Use consistent field name
      };
    });

    res.status(200).json(notifications);
  } catch (err) {
    console.error("Error in GetAllNotifications:", err); // Added error logging
    res.status(500).json({ message: err.message });
  }
};

export const CreateNotification = async (req, res) => {
  try {
    const notif = req.body;

    // FOR DEBUGING ITO
    // console.log("Received notification data:", notif);
    // console.log("booking:", notif.booking);
    // console.log("message:", notif.message);
    // console.log("sender:", notif.sender);
    // console.log("receiver:", notif.receiver);

    // Validate required fields
    if (!notif.booking || !notif.message || !notif.sender || !notif.receiver) {
      return res.status(400).json({
        message: "Missing required fields",
        received: {
          booking: notif.booking,
          message: notif.message,
          sender: notif.sender,
          receiver: notif.receiver,
        },
      });
    }

    // Insert notification
    const [result] = await pool.execute(
      "INSERT INTO notifs (booking_id, message, sender_id, senderType, receiver_id, receiverType, read_) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [notif.booking, notif.message, notif.sender, notif.senderType, notif.receiver, notif.receiverType, 0]
    );

    const insertedId = result.insertId;

    const [savedResult] = await pool.execute("SELECT * FROM notifs WHERE _id = ?", [insertedId]);

    const io = req.app.get("socketio");
    io.to(notif.receiver).emit("newNotification", savedResult[0]);

    res.status(201).json(savedResult[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
