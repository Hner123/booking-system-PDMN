const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReserveSchema = new Schema({
  roomName: {
    type: String,
    default: "",
    required: true,
  },
  title: {
    type: String,
    default: "",
  },
  agenda: {
    type: String,
    default: "",
  },
  scheduleDate: {
    type: Date,
    default: "",
  },
  startTime: {
    type: Date,
    default: "",
  },
  endTime: {
    type: Date,
    default: ""
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  caps:{
    pax: {
      type: String,
      default: ""
    },
    reason:{
      type: String,
      default: ""
    }
  },
  attendees: [{
    type: String,
    default: ""
  }],
  guest: [{
    type: String,
    default: ""
  }],
  confirmation:{
    type: Boolean,
    default: true
  },
  approval:{
    archive:{
      type:Boolean,
      default: false
    },
    status:{
      type: Boolean,
      default: false
    },
    reason:{
      type: String,
      default: ""
    }
  },
  notif:{
    type: Boolean,
    default: true
  }

});

module.exports = mongoose.model("reserve", ReserveSchema);