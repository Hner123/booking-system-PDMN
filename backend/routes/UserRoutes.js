const express = require("express");
const router = express.Router();
const upload = require("../config/Multer.js");
const requireAuth = require("../utils/requireAuth");

const {
  GetAllUsers,
  GetSpecificUser,
  CreateUser,
  EditUser,
  DeleteUser,

  GetAllUsersWithAuth,
  GetSpecificUserWithAuth,
  EditUserWithAuth,
  DeleteUserWithAuth
} = require("../controllers/UserController.js");

// router.use(requireAuth);
router.post("/create", CreateUser);
router.get("/", GetAllUsers);
router.get("/:id", GetSpecificUser);
router.patch("/edit/:id", EditUser);
router.delete("/delete/:id", DeleteUser);

module.exports = router;
