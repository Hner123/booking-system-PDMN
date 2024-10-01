const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const AdminModel = require("../models/AdminModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const requireAuth = require("../utils/requireAuth");

const ResetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { passWord } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: "Invalid ID" });
    }

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (passWord && passWord !== user.passWord) {
      const hashPassWord = await bcrypt.hash(passWord, 13);
      
      await UserModel.findByIdAndUpdate(
        id,
        { passWord: hashPassWord },
        { new: true }
      );

      return res.status(200).json({ message: "Password reset successfully" });
    }

    res.status(400).json({ message: "No new password provided or same as the current password" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  ResetPassword,
  CheckPass,

  ValidateUserData,
  LoginUser,
  LoginAdmin,
  
  CheckPassWithAuth,
  ResetPasswordWithAuth,
};
