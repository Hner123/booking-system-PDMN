const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: {
    type: String,
    default: "",
  },
  surName: {
    type: String,
    default: "",
  },
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
  },
  department: {
    type: String,
    default: "",
  },
  resetPass: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("user", UserSchema);
