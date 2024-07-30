const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const NotifSchema = new Schema({
  booking: {
    type: Schema.Types.ObjectId,
    ref: "reserve"
  },
  message:{
    type: String,
    default: ""
  },
  sender: {
    type: Schema.Types.ObjectId,
    refPath: 'senderType'
  },
  senderType: {
    type: String,
    required: true,
    enum: ['user', 'admin']
  },
  receiver: {
    type: Schema.Types.ObjectId,
    refPath: 'receiverType'
  },
  receiverType: {
    type: String,
    required: true,
    enum: ['user', 'admin']
  },
  read: {
    type: Boolean,
    default: false
  },
});

module.exports = mongoose.model("notif", NotifSchema);