import React, { useState, useEffect } from "react";
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

const MeetingRoomSchedule = () => {
  const [bookData, setBookData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(localStorage.getItem('selectedRoom'));
  const [roomSelected, setRoomSelected] = useState(!!localStorage.getItem('selectedRoom'));

  // Fetch booking data
  const fetchBookData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const bookResponse = await axios.get(
        `https://booking-system-ge1i.onrender.com/api/book/`,
        { headers }
      );

      if (bookResponse.status === 200) {
        const filteredData = bookResponse.data.filter(
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

  // Initial data fetch and subsequent updates based on selected room
  useEffect(() => {
    if (selectedRoom) {
      fetchBookData();
    }
  }, [selectedRoom]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Polling for booking data every 10 seconds
  useEffect(() => {
    const updateBookingData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const bookResponse = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/book/`,
          { headers }
        );

        if (bookResponse.status === 200) {
          const filteredData = bookResponse.data.filter(
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

    const pollingInterval = setInterval(updateBookingData, 10000); // Polling every 10 seconds

    return () => clearInterval(pollingInterval);
  }, [bookData, selectedRoom]);

  // Update current meeting based on time
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
  }, [bookData, currentTime]);

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
    };
    return date.toLocaleDateString("en-GB", options);
  };

  const renderMeeting = (meeting) => (
    <div key={meeting._id} className="meeting">
      <h3>{meeting.title}</h3>
      <p>
        <FontAwesomeIcon icon={faClock} />{" "}
        {new Date(meeting.startTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        -{" "}
        {new Date(meeting.endTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p>
        <FontAwesomeIcon icon={faUser} />{" "}
        {`${meeting.user?.firstName || "Unknown"} ${meeting.user?.surName || "Unknown"}`}
      </p>
    </div>
  );

  const renderUpcomingMeetings = () => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const upcomingMeetings = bookData
      .filter((meeting) => {
        const meetingStart = new Date(meeting.startTime);
        return (
          meetingStart >= now &&
          meetingStart >= todayStart &&
          meetingStart < todayEnd
        );
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 4);
    return upcomingMeetings.map(renderMeeting);
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRoomSelection = (room) => {
    setSelectedRoom(room);
    setRoomSelected(true);
    localStorage.setItem('selectedRoom', room);
  };

  const containerClassName = roomSelected
    ? currentMeeting
      ? "meeting-room-schedule in-use"
      : "meeting-room-schedule available"
    : "meeting-room-schedule default-state";

  const backgroundImage = selectedRoom === "Palawan" ? bgPalawan : bgBoracay;

  const getAvailabilityMessage = () => {
    const now = new Date();

    if (currentMeeting) {
      const endTime = new Date(currentMeeting.endTime);
      return `Room will be available after ${endTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    // Find the next upcoming meeting
    const upcomingMeeting = bookData.find(meeting => new Date(meeting.startTime) > now);
    if (upcomingMeeting) {
      const startTime = new Date(upcomingMeeting.startTime);
      return `Available until ${startTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    // If no meetings are found for the rest of the day
    return 'Available for the rest of the day';
  };

  return (
    <div className={containerClassName}>
      {!roomSelected && (
        <div className="subtle-room-selector">
          <button
            className={`room-button ${selectedRoom === "Palawan" ? "active" : ""}`}
            onClick={() => handleRoomSelection("Palawan")}
          >
            Palawan
          </button>
          <button
            className={`room-button ${selectedRoom === "Boracay" ? "active" : ""}`}
            onClick={() => handleRoomSelection("Boracay")}
          >
            Boracay
          </button>
        </div>
      )}
      {loading ? (
        <div className="loading-container">
          <img src={Loader} className="loading" alt="Loading..." />
        </div>
      ) : (
        <>
          <div className="first-column" style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="room-info">
              {currentMeeting ? (
                <>
                  <h1 className="room-name">{currentMeeting.roomName}</h1>
                  <div>
                    <p className="status2">Room Status:</p>
                    <h1 className="availability">In Use</h1>
                    <div className="availability-message">
              
            </div>
                  </div>
                  <h2 className="meeting-title">{currentMeeting.title}</h2>
                  <table>
                    <tbody>
                      <tr>
                        <td>
                          <FontAwesomeIcon icon={faCalendarDay} />
                        </td>
                        <td>{formatDate(new Date(currentMeeting.startTime))}</td>
                      </tr>
                      <tr>
                        <td>
                          <FontAwesomeIcon icon={faClock} />
                        </td>
                        <td>
                          {new Date(currentMeeting.startTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}{" "}
                          -{" "}
                          {new Date(currentMeeting.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <FontAwesomeIcon icon={faUser} />
                        </td>
                        <td>{`${currentMeeting.user?.firstName || "Unknown"} ${currentMeeting.user?.surName || "Unknown"}`}</td>
                      </tr>
                    </tbody>
                  </table>
                  {/* <h2>{getAvailabilityMessage()}</h2> */}
                </>
              ) : (
                <>
                  <h1 className="room-name">{selectedRoom}</h1>
                  <h1 className="availability">Available</h1>
                  <div className="availability-message">
              <h2>{getAvailabilityMessage()}</h2>
            </div>
                </>
              )}
            </div>
          </div>
          <div className="second-column">
            <div className="clock">
              <h1>{getCurrentTime()}</h1>
            </div>
            <div className="date-info">
              <h2 className="ddate">{formatDate(currentTime)}</h2>
            </div>
            <div className="meeting-list">
              <h2 className="upcoming-meetings">Upcoming Meetings</h2>
              {renderUpcomingMeetings().length > 0 ? (
                renderUpcomingMeetings()
              ) : (
                <div className="upcoming-content">
                  <h4 className="meetings">No upcoming meetings</h4>
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default MeetingRoomSchedule;
