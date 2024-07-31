const express = require("express");
const router = express.Router();
const upload = require("../config/Multer.js");
const requireAuth = require('../utils/requireAuth')

const {
  GetAllUsersWithAuth,
  GetSpecificUserWithAuth,
  CreateUser,
  EditUserWithAuth,
  DeleteUserWithAuth,

  GetAllUsers,
  GetSpecificUser,
  EditUser,
  DeleteUser,

} = require("../controllers/UserController.js");

router.post("/create", CreateUser);
// router.use(requireAuth);
router.get("/", GetAllUsers);
router.get("/:id", GetSpecificUser);
router.patch("/edit/:id", EditUser);
router.delete("/delete/:id", DeleteUser);

module.exports = router;
