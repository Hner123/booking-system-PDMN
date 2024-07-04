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
    default: Date.now(),
  },
  startTime: {
    type: Date,
    default: "",
  },
  endTime: {
    type: Date,
    default: ""
  },
  userName: {
    type: Schema.Types.ObjectId,
    ref: "user"
  },
  department: {
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
  }]

});

module.exports = mongoose.model("reserve", ReserveSchema);