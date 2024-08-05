import React, { useState, useEffect, createContext, useContext } from "react";
import axios from "axios";
import "./tablet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../assets/7.gif";
import bgPalawan from "../assets/palawan2.jpg";
import bgBoracay from "../assets/boracay2.jpg";
import {
  faCalendarDay,
  faClock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

// Create a context for the booking data and selected room
const BookingContext = createContext();

const MeetingRoomSchedule = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { selectedRoom, roomSelected, setRoomSelected, loading, bookData, currentMeeting } = useBooking();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCurrentTime = () => currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  
  const formatDate = (date) => date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const handleRoomSelection = (room) => {
    setRoomSelected(room);
    localStorage.setItem('selectedRoom', room);
  };

  const containerClassName = roomSelected
    ? currentMeeting
      ? "meeting-room-schedule in-use"
      : "meeting-room-schedule available"
    : "meeting-room-schedule default-state";

  const backgroundImage = selectedRoom === "Palawan" ? bgPalawan : bgBoracay;

  return (
    <div className={containerClassName}>
      {!roomSelected && (
        <RoomSelector handleRoomSelection={handleRoomSelection} selectedRoom={selectedRoom} />
      )}
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <FirstColumn currentMeeting={currentMeeting} selectedRoom={selectedRoom} formatDate={formatDate} backgroundImage={backgroundImage} />
          <SecondColumn currentTime={currentTime} formatDate={formatDate} getCurrentTime={getCurrentTime} bookData={bookData} />
        </>
      )}
    </div>
  );
};

const RoomSelector = ({ handleRoomSelection, selectedRoom }) => (
  <div className="subtle-room-selector">
    <button className={`room-button ${selectedRoom === "Palawan" ? "active" : ""}`} onClick={() => handleRoomSelection("Palawan")}>
      Palawan
    </button>
    <button className={`room-button ${selectedRoom === "Boracay" ? "active" : ""}`} onClick={() => handleRoomSelection("Boracay")}>
      Boracay
    </button>
  </div>
);

const LoadingScreen = () => (
  <div className="loading-container">
    <img src={Loader} className="loading" alt="Loading..." />
  </div>
);

const FirstColumn = ({ currentMeeting, selectedRoom, formatDate, backgroundImage }) => (
  <div className="first-column" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
    <div className="room-info">
      {currentMeeting ? (
        <>
          <h1 className="room-name">{currentMeeting.roomName}</h1>
          <div>
            <p className="status2">Room Status:</p>
            <h1 className="availability">In Use</h1>
          </div>
          <div className="meetingbg">
          <h2 className="meeting-title">{currentMeeting.title}</h2>
          <table>
            <tbody>
              <tr>
                <td><FontAwesomeIcon icon={faCalendarDay} /></td>
                <td>{formatDate(new Date(currentMeeting.startTime))}</td>
              </tr>
              <tr>
                <td><FontAwesomeIcon icon={faClock} /></td>
                <td>
                  {new Date(currentMeeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                  -{" "}
                  {new Date(currentMeeting.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
              <tr>
                <td><FontAwesomeIcon icon={faUser} /></td>
                <td>{`${currentMeeting.user?.firstName || "Unknown"} ${currentMeeting.user?.surName || "Unknown"}`}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </>
      ) : (
        <>
          <h1 className="room-name">{selectedRoom}</h1>
          <p className="status2">Room Status:</p>
          <h1 className="availability">Available</h1>
        </>
      )}
    </div>
  </div>
);

const SecondColumn = ({ currentTime, formatDate, getCurrentTime, bookData }) => (
  <div className="second-column">
    <div className="clock">
      <h1>{getCurrentTime()}</h1>
    </div>
    <div className="date-info">
      <h2 className="ddate">{formatDate(currentTime)}</h2>
    </div>
    <div className="meeting-list">
      <h2 className="upcoming-meetings">Upcoming Meetings</h2>
      <UpcomingMeetings bookData={bookData} currentTime={currentTime} />
    </div>
  </div>
);

const UpcomingMeetings = ({ bookData, currentTime }) => {
  const renderMeeting = (meeting) => (
    <div key={meeting._id} className="meeting">
      <h3>{meeting.title}</h3>
      <p>
        <FontAwesomeIcon icon={faClock} />{" "}
        {new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
        -{" "}
        {new Date(meeting.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </p>
      <p>
        <FontAwesomeIcon icon={faUser} />{" "}
        {`${meeting.user?.firstName || "Unknown"} ${meeting.user?.surName || "Unknown"}`}
      </p>
    </div>
  );

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const upcomingMeetings = bookData
    .filter((meeting) => {
      const meetingStart = new Date(meeting.startTime);
      return meetingStart >= now && meetingStart >= todayStart && meetingStart < todayEnd;
    })
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const displayMeetings = upcomingMeetings.slice(0, 4);
  const remainingMeetingsCount = upcomingMeetings.length - displayMeetings.length;

  return (
    <>
      {displayMeetings.length > 0 ? displayMeetings.map(renderMeeting) : (
        <div className="upcoming-content">
          <h4 className="meetings">No upcoming meetings</h4>
        </div>
      )}
      {remainingMeetingsCount > 0 && (
        <div className="more-meetings">
          <h4 className="more-meetings-text">... {remainingMeetingsCount} more meetings</h4>
        </div>
      )}
    </>
  );
};

// Custom hook to handle booking data fetching and state management
const useBooking = () => {
  const [bookData, setBookData] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(localStorage.getItem('selectedRoom'));
  const [roomSelected, setRoomSelected] = useState(!!localStorage.getItem('selectedRoom'));

  const fetchBookData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const response = await axios.get(`https://booking-system-ge1i.onrender.com/api/book/`, { headers });

      if (response.status === 200) {
        const filteredData = response.data.filter(
          (event) => (event.roomName === selectedRoom && event.confirmation === true && event.title) || event.roomName === "Palawan and Boracay"
        );
        setBookData(filteredData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      fetchBookData();
    }
  }, [selectedRoom]);

  useEffect(() => {
    const updateBookingData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

        const response = await axios.get(`https://booking-system-ge1i.onrender.com/api/book/`, { headers });

        if (response.status === 200) {
          const filteredData = response.data.filter(
            (event) => (event.roomName === selectedRoom && event.confirmation === true && event.title) || event.roomName === "Palawan and Boracay"
          );

          if (JSON.stringify(filteredData) !== JSON.stringify(bookData)) {
            setBookData(filteredData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    const pollingInterval = setInterval(updateBookingData, 10000);
    return () => clearInterval(pollingInterval);
  }, [bookData, selectedRoom]);

  useEffect(() => {
    const updateCurrentMeeting = () => {
      const now = new Date();
      const ongoingMeeting = bookData.find((meeting) => {
        const startTime = new Date(meeting.startTime);
        const endTime = new Date(meeting.endTime);
        return now >= startTime && now <= endTime;
      });
      setCurrentMeeting(ongoingMeeting || null);
    };

    updateCurrentMeeting();
    const meetingInterval = setInterval(updateCurrentMeeting, 1000);
    return () => clearInterval(meetingInterval);
  }, [bookData]);

  return { selectedRoom, setSelectedRoom, roomSelected, setRoomSelected, loading, bookData, currentMeeting };
};

export default MeetingRoomSchedule;
