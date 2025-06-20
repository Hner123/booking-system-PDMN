import { pool } from "../connection.js";

export const GetAllReserve = async (req, res) => {
  try {
    // Get all bookings first
    const [bookingRows] = await pool.execute("SELECT * FROM booking");

    if (bookingRows.length === 0) {
      return res.status(200).json([]);
    }

    // Get all booking IDs
    const bookingIds = bookingRows.map((booking) => booking._id);
    const placeholders = bookingIds.map(() => "?").join(",");

    // Fetch all related data in batch queries
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
    const capsMap = new Map();
    const approvalMap = new Map();
    const attendeesMap = new Map();
    const guestMap = new Map();

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
      attendeesMap.get(attendee.booking_id).push(attendee.attendees);
    });

    guestRows.forEach((guest) => {
      if (!guestMap.has(guest.booking_id)) {
        guestMap.set(guest.booking_id, []);
      }
      guestMap.get(guest.booking_id).push(guest.guest);
    });

    // Build final result
    const bookings = bookingRows.map((booking) => ({
      _id: booking._id,
      roomName: booking.roomName,
      title: booking.title,
      agenda: booking.agenda,
      scheduleDate: booking.scheduleDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      user: booking.user,
      confirmation: booking.confirmation,
      caps: capsMap.get(booking._id) || {},
      approval: approvalMap.get(booking._id) || {},
      attendees: attendeesMap.get(booking._id) || [],
      guest: guestMap.get(booking._id) || [],
    }));

    res.status(200).json(bookings);

    // const result = await ReserveModel.find({}).populate("user");
    // res.status(200).json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
