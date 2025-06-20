const express = require("express");
const router = express.Router();
const requireAuth = require("../utils/requireAuth");

const {
  GetEmails,

  CreateReserve,
  GetAllReserve,
  GetSpecificReserve,
  EditReserve,
  DeleteReserve,

  CreateReserveWithAuth,
  GetAllReserveWithAuth,
  GetSpecificReserveWithAuth,
  EditReserveWithAuth,
  DeleteReserveWithAuth,
} = require("../controllers/ReserveController.js");

router.get("/email/:id", GetEmails);
router.use(requireAuth);
router.post("/create", CreateReserveWithAuth);
router.get("/", GetAllReserveWithAuth);
router.get("/:id", GetSpecificReserveWithAuth);
router.patch("/edit/:id", EditReserveWithAuth);
router.delete("/delete/:id", DeleteReserveWithAuth);

module.exports = router;
