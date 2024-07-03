const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");
const mailer = require("nodemailer");
const requireAuth = require("../utils/requireAuth");

const transporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_SENDER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const LogChangePass = async (req, res) => {
  try {
    const { email } = req.body;

    // Check for existing user in UserModel
    const user = await UserModel.findOne({ email });

    // If user is found in UserModel
    if (user) {
      const emailToken = jwt.sign(
        { _id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "5m" }
      );
      const username = user.userName;
      const id = user._id;

      // Direct URL of the company logo image
      const companyLogoUrl =
        "https://drive.google.com/uc?id=1wc0kK6tHtpDCuPszIRimda3xX_Ctd9bG";

      // HTML content with embedded image and username
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
                <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
                <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Password Reset</h2>
                <p>${username}, We have received a request to reset your password. If you did not make this request, please ignore this email.</p>
                <p style="text-align: center;">To reset your password, click the button below:</p>
                <p style="text-align: center;">
                    <a href="google.com" style="display: inline-block; padding: 10px 20px; background-color: rgb(234, 88, 12); color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </p>
                <p>If you did not request a password reset, no further action is required.</p>
                <p>Thank you,</p>
                <p>QUIRCOM</p>
            </div>
        </body>
        </html>`;

      // Sending email without attachment and disable reply to this email
      await transporter.sendMail({
        from: process.env.GMAIL_SENDER,
        to: user.email,
        subject: "Reset Password",
        html: htmlContent,
        replyTo: "", // Set an empty reply-to address to disable reply functionality
        disableReplyTo: true,
      });
      res.status(201).json({
        message: "An email has been sent into your account",
        emailToken,
      });
    } else {
      // Send error response indicating user not found
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  LogChangePass,
};
