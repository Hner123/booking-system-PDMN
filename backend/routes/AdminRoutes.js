const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  CreateAdmin,
  GetAllAdmin,
  GetSpecificAdmin,
  EditAdmin,
  DeleteAdmin,

  CreateAdminWithAuth,
  GetAllAdminWithAuth,
  GetSpecificAdminWithAuth,
  EditAdminWithAuth,
  DeleteAdminWithAuth,
} = require("../controllers/AdminController.js");

router.use(requireAuth);
router.post("/create", CreateAdminWithAuth);
router.get("/", GetAllAdminWithAuth);
router.get("/:id", GetSpecificAdminWithAuth);
router.patch("/edit/:id", EditAdminWithAuth);
router.delete("/delete/:id", DeleteAdminWithAuth);

module.exports = router;
