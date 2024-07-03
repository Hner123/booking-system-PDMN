const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  userName: {
    type: String,
    default: "",
    index: true,
    required: true,
  },
  passWord: {
    type: String,
    default: "",
    required: true,
  },
  email: {
    type: String,
    default: "",
    required: true,
  }
});

module.exports = mongoose.model("user", UserSchema);