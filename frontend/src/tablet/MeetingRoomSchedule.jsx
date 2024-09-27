import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import "./tablet.css";
import bgPalawan from "../assets/palawan2.jpg";
import bgBoracay from "../assets/boracay2.jpg";
import qrImage from '../assets/qr.png';

// Helper functions
const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDate = (date) => date.toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const toTitleCase = (str) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
};

const truncateTitle = (title, maxLength) => {
  const titleCaseTitle = toTitleCase(title);
  if (titleCaseTitle.length <= maxLength) return titleCaseTitle;
  return `${titleCaseTitle.slice(0, maxLength)}...`;
};

const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Booking fetching logic
const useBooking = () => {
  const [bookings, setBookings] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(localStorage.getItem("selectedRoom") || "Palawan");
  const [isRoomSelected, setIsRoomSelected] = useState(!!localStorage.getItem("selectedRoom"));
  const token = import.meta.env.VITE_TABTOKEN;

  const fetchBookings = useCallback(async () => {
    try {
      const response = await axios.get(`https://pdmnnewshub.ddns.net:8800/api/book/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const today = new Date();
        const filteredBookings = response.data.filter((event) => {
          const eventStart = new Date(event.startTime);
          const eventEnd = new Date(event.endTime);
          
          return (
            ((event.roomName === selectedRoom || event.roomName === "Palawan and Boracay") &&
              event.confirmation &&
              isSameDay(today, eventStart) && isSameDay(today, eventEnd))
          );
        });

        setBookings(filteredBookings);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, [selectedRoom, token]);

  useEffect(() => {
    if (selectedRoom) fetchBookings();
  }, [selectedRoom, fetchBookings]);

  useEffect(() => {
    const now = new Date();
    const ongoingMeeting = bookings.find(
      (meeting) =>
        new Date(meeting.startTime) <= now && new Date(meeting.endTime) >= now
    );
    setCurrentMeeting(ongoingMeeting || null);

    const intervalId = setInterval(() => {
      const now = new Date();
      const ongoingMeeting = bookings.find(
        (meeting) =>
          new Date(meeting.startTime) <= now && new Date(meeting.endTime) >= now
      );
      setCurrentMeeting(ongoingMeeting || null);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [bookings]);

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

  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
    setIsRoomSelected(true);
    localStorage.setItem("selectedRoom", room);
  };

  const backgroundImage = useMemo(() => selectedRoom === "Palawan" ? bgPalawan : bgBoracay, [selectedRoom]);

  const containerClass = useMemo(() => 
    !isRoomSelected ? "meeting-room-schedule default-state" : 
    currentMeeting ? "meeting-room-schedule in-progress" : "meeting-room-schedule available", 
    [isRoomSelected, currentMeeting]);

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
        {toTitleCase(room)}
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

  const availableUntil = useMemo(() => nextMeeting ? formatTime(new Date(nextMeeting.startTime)) : "End of Day", [nextMeeting]);

  return (
    <div className="room-info">
      <div className="tablet-details">
        <h1 className="room-name">{currentMeeting?.roomName || toTitleCase(selectedRoom)}</h1>
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
  <div className={`meeting-status-container ${currentMeeting ? 'in-progress' : 'available'}`}>
    {currentMeeting ? (
      <>
        <h2 className="availability2">Meeting in Progress</h2>
        <MeetingDetails meeting={currentMeeting} />
      </>
    ) : (
      <>
        <h2 className="availability">
          Available <br /> {availableUntil === "End of Day" ? "Until End of the Day" : `Until ${availableUntil}`}
        </h2>
        <p className="availability-info">
          {availableUntil === "End of Day"
            ? "You may book this room at any time."
            : "Feel free to book or use this room until the next scheduled meeting."}
        </p>
      </>
    )}
  </div>
);

// Meeting details component
const MeetingDetails = ({ meeting }) => (
  <div className="meeting-status">
    <h2 className="meeting-title">{toTitleCase(meeting.title)}</h2>
    <p className="meeting-time">{`${formatTime(new Date(meeting.startTime))} - ${formatTime(new Date(meeting.endTime))}`}</p>
    <p className="meeting-user">{`${meeting.user?.firstName || "Unknown"} ${meeting.user?.surName || "Unknown"}`}</p>
  </div>
);

// Upcoming meetings component
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
          <p className="item-time">No upcoming meetings</p>
        )}
      </div>
      <div className="qr-container">
        <p className="item-time">Book now:</p>
        <img src={qrImage} alt="QR Code" />
      </div>
    </div>
  );
};

// Single meeting item component
const MeetingItem = ({ meeting }) => (
  <div className="meeting-item">
    <h3>{truncateTitle(meeting.title, 25)}</h3>
    <p className="item-time">{`${formatTime(new Date(meeting.startTime))} - ${formatTime(new Date(meeting.endTime))}`}</p>
    <p className="item-user">{`${meeting.user?.firstName || "Unknown"} ${meeting.user?.surName || "Unknown"}`}</p>
  </div>
);

export default MeetingRoomSchedule;
