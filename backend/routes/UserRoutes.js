const express = require("express");
const router = express.Router();
const upload = require("../config/Multer.js");
const requireAuth = require("../utils/requireAuth");

const {
  CreateUser,
  GetAllUsers,
  GetSpecificUser,
  EditUser,
  DeleteUser,

  CreateUserWithAuth,
  GetAllUsersWithAuth,
  GetSpecificUserWithAuth,
  EditUserWithAuth,
  DeleteUserWithAuth
} = require("../controllers/UserController.js");

router.use(requireAuth); 
router.post("/create", CreateUserWithAuth);
router.get("/", GetAllUsersWithAuth);
router.get("/:id", GetSpecificUserWithAuth);
router.patch("/edit/:id", EditUserWithAuth);
router.delete("/delete/:id", DeleteUserWithAuth);

module.exports = router;
