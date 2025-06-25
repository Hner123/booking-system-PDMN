import { pool } from "../connection.js";

export const GetAllReserve = async (req, res) => {
  try {
    // Get all bookings first
    const [bookingRows] = await pool.execute("SELECT * FROM booking");

    if (bookingRows.length === 0) {
      return res.status(200).json([]);
    }

    // Get all booking IDs and user IDs
    const bookingIds = bookingRows.map((booking) => booking._id);
    const userIds = [...new Set(bookingRows.map((booking) => booking.user))]; // Remove duplicates

    const bookingPlaceholders = bookingIds.map(() => "?").join(",");
    const userPlaceholders = userIds.map(() => "?").join(",");

    // Fetch all related data in batch queries
    const [capsRows] = await pool.execute(
      `SELECT * FROM caps WHERE booking_id IN (${bookingPlaceholders})`,
      bookingIds
    );

    const [approvalRows] = await pool.execute(
      `SELECT * FROM approval WHERE booking_id IN (${bookingPlaceholders})`,
      bookingIds
    );

    const [attendeesRows] = await pool.execute(
      `SELECT * FROM attendees WHERE booking_id IN (${bookingPlaceholders})`,
      bookingIds
    );

    const [guestRows] = await pool.execute(
      `SELECT * FROM guest WHERE booking_id IN (${bookingPlaceholders})`,
      bookingIds
    );

    // Fetch user details
    const [userRows] = await pool.execute(`SELECT * FROM users WHERE _id IN (${userPlaceholders})`, userIds);

    // Create lookup maps for O(1) access
    const capsMap = new Map();
    const approvalMap = new Map();
    const attendeesMap = new Map();
    const guestMap = new Map();
    const userMap = new Map();

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

    userRows.forEach((user) => {
      userMap.set(user._id, user);
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
      user: userMap.get(booking.user) || {},
      confirmation: booking.confirmation,
      caps: capsMap.get(booking._id) || {},
      approval: approvalMap.get(booking._id) || {},
      attendees: attendeesMap.get(booking._id) || [],
      guest: guestMap.get(booking._id) || [],
    }));

    res.status(200).json(bookings);

    // const result = await ReserveModel.find({}).populate("user");
    // res.status(200).send(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const CreateReserve = async (req, res) => {
  try {
    const reserve = req.body;

    // Insert booking
    const [result] = await pool.execute("INSERT INTO booking (roomName, user, confirmation) VALUES (?, ?, ?)", [
      reserve.roomName,
      reserve.user,
      1,
    ]);

    const insertedId = result.insertId;
    const status = "Pending";

    // Fixed parameter order for approval insert
    const [resultApproval] = await pool.execute("INSERT INTO approval (archive, status, booking_id) VALUES (?, ?, ?)", [
      0, // archive
      status, // status
      insertedId, // booking_id
    ]);

    // Fetch the complete inserted data
    const [bookingData] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [insertedId]);
    const [approvalData] = await pool.execute("SELECT * FROM approval WHERE booking_id = ?", [insertedId]);

    res.status(201).json({
      result: {
        booking: bookingData[0],
        approval: approvalData[0],
      },
    });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ message: err.message });
  }
};

export const GetSpecificReserve = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid reservation ID" });
    }

    // Simple direct query - just get the booking
    const [result] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);
    const [user] = await pool.execute("SELECT * FROM users WHERE _id = ?", [result[0].user]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    const finalResult = {
      roomName: result[0].roomName,
      title: result[0].title,
      agenda: result[0].agenda,
      scheduleDate: result[0].scheduleDate,
      startTime: result[0].startTime,
      endTime: result[0].endTime,
      user: user[0],
    };

    return res.status(200).json(finalResult);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const DeleteReserve = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid reservation ID" });
    }

    // Check if booking exists (fixed column name)
    const [result] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Delete the booking (fixed column name)
    const [deleteResult] = await pool.execute("DELETE FROM booking WHERE _id = ?", [id]);

    res.status(200).json({
      message: "Reservation deleted successfully",
      deletedId: id, // Use the actual ID that was deleted
      affectedRows: deleteResult.affectedRows, // This shows how many rows were deleted
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const EditReserve = async (req, res) => {
  try {
    const { id } = req.params;
    const reserve = req.body;

    // Check if booking exists
    const [result] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Update the booking - use 'id' from params, not 'reserve.id'
    const [resultBooking] = await pool.execute(
      "UPDATE booking SET scheduleDate = ?, startTime = ?, endTime = ?, agenda = ? WHERE _id = ?",
      [new Date(reserve.scheduleDate).toISOString(), , reserve.startTime, reserve.endTime, reserve.agenda, id] // Changed reserve.id to id
    );

    if (resultBooking.changedRows > 0) {
      // Get updated record
      const [updatedResult] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);

      // Get user using the user field from booking, not the booking id
      const [user] = await pool.execute("SELECT * FROM users WHERE _id = ?", [updatedResult[0].user]);

      const output = {
        agenda: updatedResult[0].agenda,
        scheduleDate: updatedResult[0].scheduleDate,
        startTime: updatedResult[0].startTime,
        endTime: updatedResult[0].endTime,
        user: user[0],
      };

      res.status(200).json(output);
    } else {
      // Handle case where no changes were made
      res.status(200).json({ message: "No changes made to the reservation" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const EditReserveFinal = async (req, res) => {
  try {
    const { id } = req.params;
    const reserve = req.body;

    // console.log(reserve);

    // Check if booking exists FIRST
    const [result] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);
    if (result.length === 0) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // NOW update the title (moved after result is defined)
    const [insertTitle] = await pool.execute("UPDATE booking SET title = ? WHERE _id = ?", [
      reserve.title,
      result[0]._id,
    ]);

    // Insert attendees (only if attendees array exists and has items)
    if (reserve.attendees && reserve.attendees.length > 0) {
      for (const attendee of reserve.attendees) {
        await pool.execute("INSERT INTO attendees (attendees, booking_id) VALUES (?, ?)", [attendee, result[0]._id]);
      }
    }

    // Insert guests (only if guest array exists and has items)
    if (reserve.guest && reserve.guest.length > 0) {
      for (const guest of reserve.guest) {
        await pool.execute("INSERT INTO guest (guest, booking_id) VALUES (?, ?)", [guest, result[0]._id]);
      }
    }

    // Insert caps - handle undefined values
    const [capsresult] = await pool.execute("INSERT INTO caps (pax, reason, booking_id) VALUES (?, ?, ?)", [
      reserve.caps.pax || "", // Use empty string if undefined
      reserve.caps.reason || "", // Use empty string if undefined
      result[0]._id,
    ]);

    // Get user using the user field from booking
    const [user] = await pool.execute("SELECT * FROM users WHERE _id = ?", [result[0].user]);

    // Get the inserted attendees and guests to return them
    const [attendees] = await pool.execute("SELECT attendees FROM attendees WHERE booking_id = ?", [result[0]._id]);
    const [guests] = await pool.execute("SELECT guest FROM guest WHERE booking_id = ?", [result[0]._id]);

    // Get updated booking data to show the new title
    const [updatedResult] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);

    const output = {
      caps: {
        pax: reserve.caps.pax || "",
        reason: reserve.caps.reason || "",
      },
      roomName: updatedResult[0].roomName,
      title: updatedResult[0].title, // Now shows the updated title
      agenda: updatedResult[0].agenda,
      scheduleDate: updatedResult[0].scheduleDate,
      startTime: updatedResult[0].startTime,
      endTime: updatedResult[0].endTime,
      user: user[0],
      attendees: attendees.map((row) => row.attendees),
      guest: guests.map((row) => row.guest),
    };

    res.status(200).json(output);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
