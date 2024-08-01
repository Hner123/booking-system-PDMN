const mongoose = require("mongoose");
const ReserveModel = require("../models/ReserveModel");
const NotifModel = require("../models/NotifModel");
const requireAuth = require("../utils/requireAuth");
const cron = require('node-cron');

const GetAllReserve = async (req, res) => {
  try {
    const result = await ReserveModel.find({}).populate("user");
    res.status(200).json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const GetSpecificReserve = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json("No such reservation");
    }

    const result = await ReserveModel.findById(id).populate("user");

    if (!result) {
      return res.status(404).json("Reservation not found");
    }

    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


const CreateReserve = async (req, res) => {
  try {
    const reserve = req.body;

    const result = await ReserveModel.create({
      roomName: reserve.roomName,
      title: reserve.title,
      agenda: reserve.agenda,
      scheduleDate: reserve.scheduleDate,
      startTime: reserve.startTime,
      endTime: reserve.endTime,
      user: reserve.user,
      caps: {
        pax: "",
        reason: "",
      },
      attendees: reserve.attendees,
      guest: reserve.guest,
      confirmation: true,
      approval: {
        archive: false,
        status: "Pending",
        reason: "",
      },
    });

    res.status(201).json({ result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const EditReserve = async (req, res) => {
  try {
    const { id } = req.params;
    const reserve = req.body;

    const currentReserve = await ReserveModel.findById(id);

    if (!currentReserve) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    let update = {
      $set: {
        roomName: reserve.roomName,
        title: reserve.title,
        agenda: reserve.agenda,
        scheduleDate: reserve.scheduleDate,
        startTime: reserve.startTime,
        endTime: reserve.endTime,
        caps: {
          pax: reserve.caps.pax,
          reason: reserve.caps.reason,
        },
        attendees: reserve.attendees,
        guest: reserve.guest,
        confirmation: reserve.confirmation,
        approval: {
          archive: reserve.approval.archive,
          status: reserve.approval.status,
          reason: reserve.approval.reason,
        },
      },
    };

    const result = await ReserveModel.findByIdAndUpdate(id, update, {
      new: true,
    }).populate("user");

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const DeleteReserve = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json("No reserve listed");
    }

    const reserve = await ReserveModel.findById(id);

    if (!reserve) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    await NotifModel.deleteMany({ 'booking': id });

    const result = await ReserveModel.findByIdAndDelete(id);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteInvalidReservations = async () => {
  try {
    const invalidReservations = await ReserveModel.find({
      $or: [
        { title: "" },
        { scheduleDate: null },
      ]
    });

    const invalidReserveIds = invalidReservations.map(reservation => reservation._id);

    const result = await ReserveModel.deleteMany({
      _id: { $in: invalidReserveIds }
    });

    await NotifModel.deleteMany({ 'booking': { $in: invalidReserveIds } });

    console.log(`Deleted ${result.deletedCount} invalid reservations.`);
  } catch (err) {
    console.error(`Error deleting invalid reservations: ${err.message}`);
  }
};

// Schedule the task to run at 8 AM and 8 PM every day
cron.schedule('0 8,20 * * *', () => {
  console.log('Running deleteInvalidReservations at', new Date());
  deleteInvalidReservations();
});

const GetAllReserveWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetAllReserve(req, res);
  });
};
const GetSpecificReserveWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await GetSpecificReserve(req, res);
  });
};
const EditReserveWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await EditReserve(req, res);
  });
};
const DeleteReserveWithAuth = (req, res) => {
  requireAuth(req, res, async () => {
    await DeleteReserve(req, res);
  });
};

module.exports = {
  CreateReserve,

  GetAllReserve,
  GetSpecificReserve,
  EditReserve,
  DeleteReserve,

  GetAllReserveWithAuth,
  GetSpecificReserveWithAuth,
  EditReserveWithAuth,
  DeleteReserveWithAuth,
};
