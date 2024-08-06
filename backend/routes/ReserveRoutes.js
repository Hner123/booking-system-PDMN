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

  GetAllReserveWithAuth,
  GetSpecificReserveWithAuth,
  EditReserveWithAuth,
  DeleteReserveWithAuth,
} = require("../controllers/ReserveController.js");

router.get("/email/:id", GetEmails);
// router.use(requireAuth);
router.post("/create", CreateReserve);
router.get("/", GetAllReserve);
router.get("/:id", GetSpecificReserve);
router.patch("/edit/:id", EditReserve);
router.delete("/delete/:id", DeleteReserve);

module.exports = router;
