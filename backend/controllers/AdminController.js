const mongoose = require("mongoose");
const AdminModel = require("../models/AdminModel");
const bcrypt = require("bcryptjs");
const requireAuth = require("../utils/requireAuth");

const GetAllAdmin = async (req, res) => {
  try {
    const result = await AdminModel.find({});

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetSpecificAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json("No such user");
    }

    const result = await AdminModel.findById(id);

    if (!result) {
      return res.status(404).json("User not found");
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const CreateAdmin = async (req, res) => {
  try {
    const admin = req.body;

    const hashPassWord = await bcrypt.hash(admin.adminPass, 13);

    const result = await AdminModel.create({
      adminUser: admin.adminUser,
      adminPass: hashPassWord,
    });

    res.status(201).json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const EditAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = req.body;

    const currentAdmin = await AdminModel.findById(id);

    if (!currentAdmin) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the password has changed
    let hashPassWord = currentAdmin.adminPass;
    if (admin.adminPass && admin.adminPass !== currentAdmin.adminPass) {
      hashPassWord = await bcrypt.hash(admin.adminPass, 13);
    }

    let update = {
      $set: {
        adminUser: admin.adminUser,
        adminPass: hashPassWord,
      },
    };

    const result = await AdminModel.findByIdAndUpdate(id, update, {
      new: true,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const DeleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json("No admin listed");
    }

    const admin = await AdminModel.findById(id);

    if (!admin) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the admin document from the database
    const result = await AdminModel.findByIdAndDelete(id);

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllAdminWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetAllAdmin(req, res);
  });
};
const GetSpecificAdminWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetSpecificAdmin(req, res);
  });
};
const EditAdminWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await EditAdmin(req, res);
  });
};
const DeleteAdminWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await DeleteAdmin(req, res);
  });
};

module.exports = {
  CreateAdmin,

  GetAllAdmin,
  GetSpecificAdmin,
  EditAdmin,
  DeleteAdmin,

  GetAllAdminWithAuth,
  GetSpecificAdminWithAuth,
  EditAdminWithAuth,
  DeleteAdminWithAuth,
};
