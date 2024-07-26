const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const AdminModel = require("../models/AdminModel");
const ReserveModel = require("../models/ReserveModel");
const bcrypt = require("bcrypt");
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
      const passToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });
      const username = user.userName;
      const id = user._id;

      // Direct URL of the company logo image. Copy the id of the drive link paste it after id=
      const companyLogoUrl =
        "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      // HTML content with embedded image and username
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to GDS Booking System</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
                <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
                <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Password Reset</h2>
                <p>Hello ${username},</p>
                <p>Welcome to GDS Booking System! We are excited to have you on board. To access the application, please set up your password by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="https://tiktok.com" style="display: inline-block; padding: 10px 20px; background-color: rgb(234, 88, 12); color: #fff; text-decoration: none; border-radius: 5px;">Set Up Password</a>
                </p>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,</p>
                <p>Management</p>
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
        passToken,
        passId: id
      });
    } else {
      // Send error response indicating user not found
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const ChangeEmail = async (req, res) => {
  try {
    const { _id, email } = req.body;

    const user = await UserModel.findOne({ _id });

    if (user) {
      const emailToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });
      const name = user.firstName + " " + user.surName;
      const id = user._id;

      const companyLogoUrl =
        "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

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
                    <a href="https://tiktok.com" style="display: inline-block; padding: 10px 20px; background-color: rgb(234, 88, 12); color: #fff; text-decoration: none; border-radius: 5px;">Confirm Email Change</a>
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
        emailId: id
      });
    } else {
      // Send error response indicating user not found
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const Approval = async (req, res) => {
  try {
    const { _id, email} = req.body;

    const user = await UserModel.findOne({ email });
    const book = await ReserveModel.findOne({ _id });

    if (user) {
      const name = user.firstName + " " + user.surName;
      const status = book.approval.status;
      const roomName = book.roomName;
      const reason = book.approval.reason;
      const title = book.title;

      const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      const htmlContent = `
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
                <p>Hello ${name},</p>
                <p>Your reservation request for the room ${roomName}, titled "${title}", has been ${
                    status
                      ? "approved. You can proceed with your reservation on the scheduled date."
                      : `rejected. The reason provided is: <span style="color: red;">${reason}</span>. If you have any questions or need further assistance, please contact our support team.`
                  }</p>
                <p>If you have any questions or need further assistance, please contact our support team.</p>
                <p>Best regards,</p>
                <p>Management</p>
            </div>
        </body>
        </html>`;

      await transporter.sendMail({
        from: process.env.GMAIL_SENDER,
        to: email,
        subject: "Reservation Status",
        html: htmlContent,
        replyTo: "",
        disableReplyTo: true,
      });
      res.status(201).json({
        message: "An email has been sent into your account",
      });
    } else {
      // Send error response indicating user not found
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const ValidateUserData = async (req, res) => {
  try {
    const { userName, email } = req.body;

    const userNameUser = await UserModel.findOne({ userName });
    const emailUser = await UserModel.findOne({ email });

    res.status(200).json({
      userName: {
        exists: !!userNameUser,
        userId: userNameUser ? userNameUser._id : null,
      },
      email: {
        exists: !!emailUser,
        userId: emailUser ? emailUser._id : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const LoginUser = async (req, res) => {
  try {
    const { userName, passWord } = req.body;

    // Check if the user exists
    const foundUser = await UserModel.findOne({ userName });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(passWord, foundUser.passWord);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const authToken = jwt.sign({ _id: foundUser._id }, process.env.JWT_SECRET, {
      // expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: foundUser._id,
      },
      authToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const LoginAdmin = async (req, res) => {
  try {
    const { adminUser, adminPass } = req.body;

    // Check if the admin exists
    const foundAdmin = await AdminModel.findOne({ adminUser });
    if (!foundAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(
      adminPass,
      foundAdmin.adminPass
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const authToken = jwt.sign(
      { _id: foundAdmin._id },
      process.env.JWT_SECRET,
      {
        // expiresIn: "1h",
      }
    );

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: foundAdmin._id,
      },
      authToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const ChangeEmailWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await ChangeEmail(req, res);
  });
};
const ApprovalWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await Approval(req, res);
  });
};

module.exports = {
  LogChangePass,
  ChangeEmail,
  Approval,
  ValidateUserData,
  LoginUser,
  LoginAdmin,

  ChangeEmailWithAuth,
  ApprovalWithAuth,
};
