import { pool } from "../connection.js"; // ← Added .js extension
import jwt from "jsonwebtoken"; // Add JWT
import nodemailer from "nodemailer";

export const ChangeEmail = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SENDER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  try {
    const { _id, email } = req.body;

    const [rows] = await pool.execute("SELECT * FROM users WHERE _id = ?", [_id]);

    if (rows.length >= 1) {
      const user = rows[0];
      const emailToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        // ← Fixed typo: 'procses' to 'process'
        expiresIn: "5m",
      });

      const name = user.firstName + " " + user.surName;
      const emailId = user._id;
      const newEmail = email;

      const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      // ← Fixed URL structure: separated query parameters properly
      // const verificationLink = `http://localhost:5173/verify-success/${emailId}?token=${emailToken}?email=${newEmail}`;

      const verificationLink = `http://localhost:5173/verify-success/${emailId}?token=${emailToken}&email=${encodeURIComponent(
        newEmail
      )}`;

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Change Email - GDS Booking System</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
                <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
                <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Email Change Request</h2>
                <p>Hello ${name},</p>
                <p>We received a request to change the email associated with your GDS Booking System account. If you made this request, please click the button below to confirm your new email address:</p>
                <p style="text-align: center;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: rgb(234, 88, 12); color: #fff; text-decoration: none; border-radius: 5px;">Confirm Email Change</a>
                </p>
                <p>If you did not request this change, please ignore this email or contact our support team immediately.</p>
                <p>Best regards,</p>
                <p>Management</p>
            </div>
        </body>
        </html>`;

      await transporter.sendMail({
        from: process.env.GMAIL_SENDER,
        to: email,
        subject: "Change Email",
        html: htmlContent,
        replyTo: "",
        disableReplyTo: true,
      });

      res.status(201).json({
        message: "An email has been sent into your account",
        emailToken,
        emailId,
        newEmail,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message }); // ← Changed from 404 to 500 for server errors
  }
};

export const PendingApproval = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SENDER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  try {
    const { id } = req.params;

    // const reservation = await ReserveModel.findById(id).populate("user");
    const [result] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);

    // GET user
    const [user] = await pool.execute("SELECT * FROM users WHERE _id = ?", [result[0].user]);

    // GET CAPS
    const [caps] = await pool.execute("SELECT * FROM caps WHERE booking_id = ?", [id]);

    // GET APPROVAL
    const [approval] = await pool.execute("SELECT * FROM approval WHERE booking_id = ?", [id]);
    // GET ATTENDES

    const [attendees] = await pool.execute("SELECT * FROM attendees WHERE booking_id = ?", [id]);
    // GET GUEST
    const [guest] = await pool.execute("SELECT * FROM guest WHERE booking_id = ?", [id]);

    const reservation = {
      _id: id,
      caps: caps[0],
      approval: approval,
      user: user,
      attendees: attendees,
      guest: guest,
      roomName: result[0].roomName,
      title: result[0].title,
      agenda: result[0].agenda,
      scheduleDate: result[0].scheduleDate,
      startTime: result[0].startTime,
      endTime: result[0].endTime,
      confirmation: result[0].confirmation === 1 ? true : false,
    };

    // console.log("CHECK TO:", reservation.caps);

    const calculateReason = (booking) => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      const duration = (endTime - startTime) / (1000 * 60 * 60);
      const roomName = booking.roomName;

      let reason;

      if (roomName === "Palawan and Boracay") {
        if (duration > 1 && booking.caps.pax === "8-More") {
          reason = "Reservation is for more than 1 hour and requires both rooms.";
          if (booking.agenda) {
            reason += ` ${booking.agenda}.`;
          }
          if (booking.caps.reason) {
            reason += ` ${booking.caps.reason}.`;
          }
        } else if (duration > 1) {
          reason = "Reservation is for more than 1 hour.";
          if (booking.agenda) {
            reason += ` ${booking.agenda}.`;
          }
        } else if (booking.caps.pax === "8-More") {
          reason = "Reservation is for both rooms.";
          if (booking.caps.reason) {
            reason += ` ${booking.caps.reason}.`;
          }
        } else {
          reason = "No specific reason provided.";
        }
      } else {
        if (duration > 1 && booking.caps.pax === "1-2") {
          reason = "Reservation is for more than 1 hour and only 1-2 people.";
          if (booking.agenda) {
            reason += ` ${booking.agenda}.`;
          }
          if (booking.caps.reason) {
            reason += ` ${booking.caps.reason}.`;
          }
        } else if (duration > 1) {
          reason = "Reservation is for more than 1 hour.";
          if (booking.agenda) {
            reason += ` ${booking.agenda}.`;
          }
        } else if (booking.caps.pax === "1-2") {
          reason = "Reservation is for only 1-2 people.";
          if (booking.caps.reason) {
            reason += ` ${booking.caps.reason}.`;
          }
        } else {
          reason = "No specific reason provided.";
        }
      }

      return reason;
    };

    if (reservation) {
      const title = reservation.title;
      const room = reservation.roomName;
      const bookedBy = `${reservation.user[0].firstName} ${reservation.user[0].surName}`;
      const date = new Date(reservation.scheduleDate).toLocaleDateString();
      const startTime = new Date(reservation.startTime);
      const endTime = new Date(reservation.endTime);
      const time = `${startTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Manila",
      })} to ${endTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Manila",
      })}`;

      const reason = calculateReason(reservation);
      const email = ["heiner@pdmn.ph", "kolotiner@gmail.com"];

      const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Pending Approval - GDS Booking System</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
                <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
                <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Pending Approval</h2>
                <p>Dear Admin,</p>
                <p>A new reservation titled <strong>'${title}'</strong> for room ${room} is pending approval. Please review the details below:</p>
                <ul>
                    <li><strong>Booked by:</strong> ${bookedBy}</li>
                    <li><strong>Date:</strong> ${date}</li>
                    <li><strong>Time:</strong> ${time}</li>
                    <li><strong>Reason:</strong> ${reason}</li>
                </ul>
                <p>Please log in to the GDS Booking System to review and approve this reservation.</p>
                <p>Best regards,</p>
                <p>Management</p>
            </div>
        </body>
        </html>`;

      await transporter.sendMail({
        from: process.env.GMAIL_SENDER,
        to: email,
        subject: "Pending Approval",
        html: htmlContent,
      });
      res.status(201).json({
        message: "An email has been sent to the admin for approval",
      });
    } else {
      res.status(404).json({ message: "Reservation not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const Approval = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SENDER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  try {
    const { _id, email } = req.body;

    // Validate required fields
    if (!_id || !email) {
      return res.status(400).json({ message: "Missing required fields: _id and email" });
    }

    // Execute database queries with proper error handling
    const [userResult] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    const [bookResult] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [_id]);

    // Check if user and booking exist
    if (!userResult.length) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!bookResult.length) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const user = userResult[0];
    const book = bookResult[0];

    // Use parameterized query for approval lookup
    const [approvalResult] = await pool.execute("SELECT * FROM approval WHERE booking_id = ?", [book._id]);

    if (!approvalResult.length) {
      return res.status(404).json({ message: "Approval record not found" });
    }

    const approval = approvalResult[0];
    const name = user.firstName + " " + user.surName;
    const status = approval.status;
    const roomName = book.roomName;
    const reason = approval.reason;
    const title = book.title;

    const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

    let htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reservation Status - GDS Booking System</title>
      </head>
      <body style="font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
              <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
              <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Reservation Status for ${roomName}</h2>
              <p>Hello ${name},</p>`;

    if (status === "Approved") {
      htmlContent += `
              <p>Your reservation request for the room ${roomName}, titled <strong>"${title}"</strong>, has been approved. You can proceed with your reservation on the scheduled date.</p>`;
    } else if (status === "Declined") {
      htmlContent += `
              <p>Your reservation request for the room ${roomName}, titled <strong>"${title}"</strong>, has been rejected. The reason provided is: <span style="color: red;">${
        reason || "No reason provided"
      }</span>. If you have any questions or need further assistance, please contact our support team.</p>`;
    } else {
      htmlContent += `
              <p>Your reservation request for the room ${roomName}, titled <strong>"${title}"</strong>, is currently under review. Status: ${status}</p>`;
    }

    htmlContent += `
              <p>If you have any questions or need further assistance, please contact our support team.</p>
              <p>Best regards,</p>
              <p>Management</p>
          </div>
      </body>
      </html>`;

    // Send email
    await transporter.sendMail({
      from: process.env.GMAIL_SENDER,
      to: email,
      subject: "Reservation Status",
      html: htmlContent,
      replyTo: "",
      disableReplyTo: true,
    });

    res.status(201).json({
      message: "An email has been sent to your account",
    });
  } catch (error) {
    console.error("Error in Approval function:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const SendInvite = async (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_SENDER,
      pass: process.env.GMAIL_PASSWORD,
    },
  });
  try {
    const { id } = req.params;

    const numId = Number(id);
    if (!Number.isSafeInteger(numId) || numId < 1) {
      return res.status(400).json("Invalid reservation ID");
    }

    // const reservation = await ReserveModel.findById(id).populate("user");
    const [result] = await pool.execute("SELECT * FROM booking WHERE _id = ?", [id]);

    // GET user
    const [user] = await pool.execute("SELECT * FROM users WHERE _id = ?", [result[0].user]);

    // GET CAPS
    const [caps] = await pool.execute("SELECT * FROM caps WHERE booking_id = ?", [id]);

    // GET APPROVAL
    const [approval] = await pool.execute("SELECT * FROM approval WHERE booking_id = ?", [id]);
    // GET ATTENDES

    const [attendeeRows] = await pool.execute("SELECT attendees FROM attendees WHERE booking_id = ?", [id]);
    const attendeeNames = attendeeRows.map((r) => r.attendees);
    // GET GUEST
    const [guest] = await pool.execute("SELECT * FROM guest WHERE booking_id = ?", [id]);

    const reservation = {
      _id: id,
      caps: caps[0],
      approval: approval,
      user: user,
      attendees: attendeeRows.map((r) => r.attendees),
      guest: guest,
      roomName: result[0].roomName,
      title: result[0].title,
      agenda: result[0].agenda,
      scheduleDate: result[0].scheduleDate,
      startTime: result[0].startTime,
      endTime: result[0].endTime,
      confirmation: result[0].confirmation === 1 ? true : false,
    };

    if (reservation.attendees.length === 0) {
      return res.status(200).json({
        ...reservation.toObject(),
        attendees: [],
      });
    }

    const checkUserExistenceAndEmail = async (firstName, surName) => {
      try {
        // const user = await UserModel.findOne({
        //   firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
        //   surName: { $regex: new RegExp(`^${surName}$`, "i") },
        // });

        const [[user]] = await pool.execute(
          "SELECT * FROM users WHERE LOWER(firstName) = LOWER(?) AND LOWER(surName) = LOWER(?)",
          [firstName, surName]
        );

        if (user) {
          return user.email || null;
        }
      } catch (err) {
        console.error(`Error querying the database for "${firstName} ${surName}": ${err.message}`);
      }
      return null;
    };

    const emailPromises = reservation.attendees.map(async (attendeeName) => {
      const nameParts = attendeeName.split(" ");
      for (let i = 1; i < nameParts.length; i++) {
        const firstName = nameParts.slice(0, i).join(" ");
        const surName = nameParts.slice(i).join(" ");
        const email = await checkUserExistenceAndEmail(firstName, surName);
        if (email) {
          return { name: attendeeName, email };
        }
      }
      return { name: attendeeName, email: null };
    });

    const emailResults = await Promise.all(emailPromises);

    const validEmails = emailResults.filter((result) => result.email !== null);

    const title = reservation.title;
    const room = reservation.roomName;
    const date = new Date(reservation.scheduleDate).toLocaleDateString();
    const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";
    const time = `${new Date(reservation.startTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Manila",
    })} to ${new Date(reservation.endTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Manila",
    })}`;

    for (const { name, email } of validEmails) {
      let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Invitation to Reservation - GDS Booking System</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
                <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
                <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Invitation to Reservation: ${title}</h2>
                <p>Hello ${name},</p>
                <p>You are invited to the reservation titled <strong>${title}</strong> in room ${room}, scheduled for ${date} at ${time}.</p>
                <p>If you have any questions or need further assistance, please contact our support team.</p>
                <p>Best regards,</p>
                <p>Management</p>
            </div>
        </body>
        </html>`;

      await transporter.sendMail({
        from: process.env.GMAIL_SENDER,
        to: email,
        subject: "Invitation to Reservation",
        html: htmlContent,
        replyTo: "",
        disableReplyTo: true,
      });
    }

    res.status(201).json({
      message: "Invitation emails have been sent to all attendees",
      validEmails,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
