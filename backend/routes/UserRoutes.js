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
} = require("../controllers/UserController.js");

router.post("/upload", CreateUser);
router.use(requireAuth);
router.get("/", GetAllUsersWithAuth);
router.get("/:id", GetSpecificUserWithAuth);
router.patch("/update/:id", EditUserWithAuth);
router.delete("/delete/:id", DeleteUserWithAuth);

module.exports = router;