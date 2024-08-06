const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const AdminModel = require("../models/AdminModel");
const ReserveModel = require("../models/ReserveModel");
const bcrypt = require("bcryptjs");
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

const ForgotPass = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });

    if (user) {
      const passToken = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "5m",
      });
      const name = user.firstName + " " + user.surName;
      const passId = user._id;

      const companyLogoUrl =
        "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Change - GDS Booking System</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; color: #000; font-size: 16px;">
                <img src="${companyLogoUrl}" alt="Company Logo" style="max-width: 200px; margin: 0 auto 20px; display: block;">
                <h2 style="margin-bottom: 20px; text-align: center; color: #000;">Password Change Request</h2>
                <p>Hello ${name},</p>
                <p>We received a request to change the password associated with your GDS Booking System account. If you made this request, please click the button below to reset your password:</p>
                <p style="text-align: center;">
                    <a href="https://gdsbooking.netlify.app/reset-pass" style="display: inline-block; padding: 10px 20px; background-color: rgb(234, 88, 12); color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                </p>
                <p>If you did not request this change, please ignore this email or contact our support team immediately.</p>
                <p>Best regards,</p>
                <p>Management</p>
            </div>
        </body>
        </html>`;

      await transporter.sendMail({
        from: process.env.GMAIL_SENDER,
        to: user.email,
        subject: "Reset Password",
        html: htmlContent,
        replyTo: "",
        disableReplyTo: true,
      });
      res.status(201).json({
        message: "An email has been sent into your account",
        passToken,
        passId,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const ResetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid ID" });
    }

    const user = await UserModel.findById(id);

    if (user) {
      const { passWord } = req.body;
      user.passWord = passWord;
      await user.save();
      return res.status(200).json({ message: "Password reset successfully" });
    }

    res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      const emailId = user._id;
      const newEmail = email;

      const companyLogoUrl =
        "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

      const verificationLink = `https://gdsbooking.netlify.app/verify-success/${emailId}?token=${emailToken}?email=${newEmail}`;

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
    res.status(404).json({ message: error.message });
  }
};

const Approval = async (req, res) => {
  try {
    const { _id, email } = req.body;

    const user = await UserModel.findOne({ email });
    const book = await ReserveModel.findOne({ _id });

    if (user) {
      const name = user.firstName + " " + user.surName;
      const status = book.approval.status;
      const roomName = book.roomName;
      const reason = book.approval.reason;
      const title = book.title;

      const companyLogoUrl =
        "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";

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
                <p>Your reservation request for the room ${roomName}, titled "${title}", has been approved. You can proceed with your reservation on the scheduled date.</p>`;
      } else if (status === "Declined") {
        htmlContent += `
                <p>Your reservation request for the room ${roomName}, titled "${title}", has been rejected. The reason provided is: <span style="color: red;">${reason}</span>. If you have any questions or need further assistance, please contact our support team.</p>`;
      }

      htmlContent += `
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
        message: "An email has been sent to your account",
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const SendInvite = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json("Invalid reservation ID");
    }

    const reservation = await ReserveModel.findById(id).populate("user");
    if (!reservation) {
      return res.status(404).json("Reservation not found");
    }

    if (reservation.attendees.length === 0) {
      return res.status(200).json({
        ...reservation.toObject(),
        attendees: []
      });
    }

    const checkUserExistenceAndEmail = async (firstName, surName) => {
      try {
        const user = await UserModel.findOne({
          firstName: { $regex: new RegExp(`^${firstName}$`, 'i') },
          surName: { $regex: new RegExp(`^${surName}$`, 'i') }
        });
        if (user) {
          return user.email || null;
        }
      } catch (err) {
        console.error(`Error querying the database for "${firstName} ${surName}": ${err.message}`);
      }
      return null;
    };

    const emailPromises = reservation.attendees.map(async attendeeName => {
      const nameParts = attendeeName.split(' ');
      for (let i = 1; i < nameParts.length; i++) {
        const firstName = nameParts.slice(0, i).join(' ');
        const surName = nameParts.slice(i).join(' ');
        const email = await checkUserExistenceAndEmail(firstName, surName);
        if (email) {
          return { name: attendeeName, email };
        }
      }
      return { name: attendeeName, email: null };
    });

    const emailResults = await Promise.all(emailPromises);

    const validEmails = emailResults.filter(result => result.email !== null);

    const title = reservation.title;
    const date = new Date(reservation.scheduleDate).toLocaleDateString();
    const companyLogoUrl = "https://drive.google.com/uc?id=108JoeqEjPR7HKfbNjXdV30wvvy9oDk_B";
    const time = `${new Date(reservation.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to ${new Date(reservation.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

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
                <p>You are invited to the reservation titled "${title}" scheduled on ${date} at ${time}.</p>
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
      validEmails
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
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

    const foundUser = await UserModel.findOne({ userName });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(passWord, foundUser.passWord);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

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

const CheckPass = async (req, res) => {
  const { currPass, hashedPassword } = req.body;
  try {
    const isMatch = await bcrypt.compare(currPass, hashedPassword);
    res.json({ isMatch });
  } catch (error) {
    res.status(500).json({ error: "Error validating password" });
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
const CheckPassWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await CheckPass(req, res);
  });
};
const ResetPasswordWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await ResetPassword(req, res);
  });
};

module.exports = {
  ForgotPass,
  ChangeEmail,
  Approval,
  ValidateUserData,
  LoginUser,
  LoginAdmin,
  CheckPass,
  ResetPassword,
  SendInvite,

  ChangeEmailWithAuth,
  ApprovalWithAuth,
  CheckPassWithAuth,
  ResetPasswordWithAuth,
};
