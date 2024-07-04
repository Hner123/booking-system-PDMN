const { books } = require("googleapis/build/src/apis/books");
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
  },
  department: {
    type: String,
    default: "",
    required: true
  },
  resetPass: {
    type: Boolean,
    default: false,
  }
  
});

module.exports = mongoose.model("user", UserSchema);