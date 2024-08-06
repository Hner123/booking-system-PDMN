const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  CreateAdmin,
  GetAllAdmin,
  GetSpecificAdmin,
  EditAdmin,
  DeleteAdmin,

  GetAllAdminWithAuth,
  GetSpecificAdminWithAuth,
  EditAdminWithAuth,
  DeleteAdminWithAuth,
} = require("../controllers/AdminController.js");

router.post("/create", CreateAdmin);
// router.use(requireAuth);
router.get("/", GetAllAdmin);
router.get("/:id", GetSpecificAdmin);
router.patch("/edit/:id", EditAdmin);
router.delete("/delete/:id", DeleteAdmin);

module.exports = router;
