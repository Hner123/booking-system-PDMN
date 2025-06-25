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
