const express = require("express");
const router = express.Router();
const requireAuth = require('../utils/requireAuth')

const {
  CreateAdmin,
  GetAllAdminWithAuth,
  GetSpecificAdminWithAuth,
  EditAdminWithAuth,
  DeleteAdminWithAuth,
} = require("../controllers/AdminController.js");

router.post("/upload", CreateAdmin);
router.use(requireAuth);
router.get("/", GetAllAdminWithAuth);
router.get("/:id", GetSpecificAdminWithAuth);
router.patch("/update/:id", EditAdminWithAuth);
router.delete("/delete/:id", DeleteAdminWithAuth);

module.exports = router;