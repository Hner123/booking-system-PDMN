const mongoose = require("mongoose");
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const requireAuth = require("../utils/requireAuth");

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
      return res.status(400).json("No such user");
    }

    const result = await UserModel.findById(id);

    if (!result) {
      return res.status(404).json("User not found");
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const CreateUser = async (req, res) => {
  try {
    const user = req.body;

    const hashPassWord = await bcrypt.hash(user.passWord, 13);

    const result = await UserModel.create({
      firstName: user.firstName,
      surName: user.surName,
      userName: user.userName,
      passWord: hashPassWord,
      email: user.email,
      department: user.department,
      resetPass: false,
    });

    res.status(201).json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const EditUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.body;
    const currentUser = await UserModel.findById(id);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    let hashPassWord = currentUser.passWord;
    if (user.passWord && user.passWord !== currentUser.passWord) {
      hashPassWord = await bcrypt.hash(user.passWord, 13);
    }

    let update = {
      $set: {
        firstName: user.firstName,
        surName: user.surName,
        userName: user.userName,
        passWord: hashPassWord,
        email: user.email,
        department: user.department,
        resetPass: user.resetPass,
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

    const result = await UserModel.findByIdAndDelete(id);

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateUserWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await CreateUser(req, res);
  });
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
  GetAllUsers,
  GetSpecificUser,
  EditUser,
  DeleteUser,

  CreateUserWithAuth,
  GetAllUsersWithAuth,
  GetSpecificUserWithAuth,
  EditUserWithAuth,
  DeleteUserWithAuth,
};
