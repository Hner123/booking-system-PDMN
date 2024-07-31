const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  adminUser: {
    type: String,
    default: "",
    index: true,
    required: true,
  },
  adminPass: {
    type: String,
    default: "",
    required: true,
  },
});

module.exports = mongoose.model("admin", AdminSchema);