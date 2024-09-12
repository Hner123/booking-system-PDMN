import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./tablet.css";
import bgPalawan from "../assets/palawan2.jpg";
import bgBoracay from "../assets/boracay2.jpg";
import qrImage from '../assets/qr.png';


// Helper functions to format time and date
const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDate = (date) => date.toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

// Custom hook to manage booking data
const useBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(localStorage.getItem("selectedRoom") || "Palawan");
  const [isRoomSelected, setIsRoomSelected] = useState(!!localStorage.getItem("selectedRoom"));
  const token = import.meta.env.VITE_TABTOKEN;

  // Fetch bookings from API
  const fetchBookings = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/book/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const filteredBookings = response.data.filter(
          (event) =>
            (event.roomName === selectedRoom && event.confirmation) ||
            event.roomName === "Palawan and Boracay"
        );
        setBookings(filteredBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, [selectedRoom, token]);

  // Fetch bookings when room changes
  useEffect(() => {
    if (selectedRoom) fetchBookings();
  }, [selectedRoom, fetchBookings]);

  // Set current meeting based on time
  useEffect(() => {
    const updateCurrentMeeting = () => {
      const now = new Date();
      const ongoingMeeting = bookings.find(
        (meeting) =>
          new Date(meeting.startTime) <= now && new Date(meeting.endTime) >= now
      );
      setCurrentMeeting(ongoingMeeting || null);
    };

    const intervalId = setInterval(updateCurrentMeeting, 1000);
    updateCurrentMeeting(); // Initial call

    return () => clearInterval(intervalId);
  }, [bookings]);

  // Refresh booking data every 10 seconds
  useEffect(() => {
    const intervalId = setInterval(fetchBookings, 10000);
    return () => clearInterval(intervalId);
  }, [fetchBookings]);

  return {
    selectedRoom,
    setSelectedRoom,
    isRoomSelected,
    setIsRoomSelected,
    bookings,
    currentMeeting,
  };
};

// Main component
const MeetingRoomSchedule = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const {
    selectedRoom,
    isRoomSelected,
    setIsRoomSelected,
    bookings,
    currentMeeting,
    setSelectedRoom,
  } = useBooking();

  // Update current time every second
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  // Handle room selection and save to localStorage
  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
    setIsRoomSelected(true);
    localStorage.setItem("selectedRoom", room);
  };

  // Background image for selected room
  const backgroundImage = selectedRoom === "Palawan" ? bgPalawan : bgBoracay;

  // Container CSS class based on current state
  const containerClass = !isRoomSelected
    ? "meeting-room-schedule default-state"
    : currentMeeting
    ? "meeting-room-schedule in-use"
    : "meeting-room-schedule available";

  return (
    <div className={containerClass}>
      <div className="background-image" style={{ backgroundImage: `url(${backgroundImage})` }} />
      {!isRoomSelected && <RoomSelector onRoomSelect={handleRoomSelection} selectedRoom={selectedRoom} />}
      <RoomInfo currentMeeting={currentMeeting} selectedRoom={selectedRoom} currentTime={currentTime} bookings={bookings} />
    </div>
  );
};

// Room selector component
const RoomSelector = ({ onRoomSelect, selectedRoom }) => (
  <div className="room-selector">
    {["Palawan", "Boracay"].map((room) => (
      <button
        key={room}
        className={`room-button ${selectedRoom === room ? "active" : ""}`}
        onClick={() => onRoomSelect(room)}
      >
        {room}
      </button>
    ))}
  </div>
);

// Room information component
const RoomInfo = ({ currentMeeting, selectedRoom, currentTime, bookings }) => {
  const nextMeeting = useMemo(() => {
    return bookings
      .filter((meeting) => new Date(meeting.startTime) > currentTime)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0];
  }, [bookings, currentTime]);

  const availableUntil = nextMeeting ? formatTime(new Date(nextMeeting.startTime)) : "End of Day";

  return (
    <div className="room-info">
      <div className="tablet-details">
        <h1 className="room-name">{currentMeeting?.roomName || selectedRoom}</h1>
        <h2 className="date">{formatDate(currentTime)}</h2>
        <h1 className="time">{formatTime(currentTime)}</h1>
      </div>
      <MeetingStatus currentMeeting={currentMeeting} availableUntil={availableUntil} />
      <UpcomingMeetings bookings={bookings} currentTime={currentTime} />
    </div>
  );
};

// Meeting status component
const MeetingStatus = ({ currentMeeting, availableUntil }) => (
  <div className="meeting-status-container">
    {currentMeeting ? (
      <>
        <h2 className="availability">Meeting in Progress</h2>
        <MeetingDetails meeting={currentMeeting} />
        <p className="availability-info">Please wait for the current meeting to end.</p>
      </>
    ) : (
      <>
        <h2 className="availability">
          Available <br /> {availableUntil === "End of Day" ? "Until End of the Day" : `Until ${availableUntil}`}
        </h2>
        <p className="availability-info">
          {availableUntil === "End of Day"
            ? " You may book this room at any time."
            : "Feel free to book or use this room until the next scheduled meeting"}
        </p>
      </>
    )}
  </div>
);

// Current meeting details component
const MeetingDetails = ({ meeting }) => (
  <div className="meeting-status">
    <h2 className="meeting-title">{meeting.title}</h2>
    <p>{`${formatTime(new Date(meeting.startTime))} - ${formatTime(new Date(meeting.endTime))}`}</p>
    <p>{`${meeting.user?.firstName || "Unknown"} ${meeting.user?.surName || "Unknown"}`}</p>
  </div>
);

// Upcoming meetings list component
const UpcomingMeetings = ({ bookings, currentTime }) => {
  const upcomingMeetings = useMemo(() => {
    return bookings
      .filter((meeting) => new Date(meeting.startTime) > currentTime)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 4);
  }, [bookings, currentTime]);

  return (
    <div className="meeting-container">
      <div className="meeting-list">
        <h2>Upcoming Meeting</h2>
        {upcomingMeetings.length > 0 ? (
          upcomingMeetings.map((meeting) => (
            <MeetingItem key={meeting._id} meeting={meeting} />
          ))
        ) : (
          <p>No upcoming meetings</p>
        )}
      </div>
      <div className="qr-container">
        <img src={qrImage} alt="QR Code" />
      </div>
    </div>
  );
};

// Single meeting item component
const MeetingItem = ({ meeting }) => (
  <div className="meeting-item">
    <p className="meeting-time">{`${formatTime(new Date(meeting.startTime))} - ${formatTime(new Date(meeting.endTime))}`}</p>
    <h3>{meeting.title}</h3>
  </div>
);

export default MeetingRoomSchedule;
