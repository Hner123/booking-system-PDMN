const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const DriveService = require("../utils/DriveService");
const jwt = require("jsonwebtoken");
const requireAuth = require("../utils/requireAuth")

const GetAllUsers = async (req, res) => {
  try {
    const result = await UserModel.find({});

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetSpecificUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json("No such user");
    }

    const result = await UserModel.findById(id);

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateUser = async (req, res) => {
  try {
    const user = req.body

    const result = await UserModel.create({
      userName: user.userName,
      passWord: user.passWord,
    });

    // const emailToken = jwt.sign(
    //   { _id: result._id },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "3m" }
    // );

    res.status(201).json({ result, emailToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const EditUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.body

    let update = {
      $set: {
        userName: user.userName,
        passWord: user.passWord,
      },
    };

    const result = await UserModel.findByIdAndUpdate(id, update, { new: true });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const DeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json("No user listed");
    }
  
    const user = await UserModel.findById(id);
  
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user document from the database
    const result = await UserModel.findByIdAndDelete(id);
  
    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllUsersWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetAllUsers(req, res);
  });
};
const GetSpecificUserWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetSpecificUser(req, res);
  });
};
const EditUserWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await EditUser(req, res);
  });
};
const DeleteUserWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await DeleteUser(req, res);
  });
};

module.exports = {
  CreateUser,
  GetAllUsersWithAuth,
  GetSpecificUserWithAuth,
  EditUserWithAuth,
  DeleteUserWithAuth,
};
