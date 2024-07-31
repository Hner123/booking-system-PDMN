import React, { useState, useEffect } from "react";
import axios from "axios";
import "./tablet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../assets/7.gif";
import {
  faCalendarDay,
  faClock,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const BoracayRoomSched = () => {
  const [bookData, setBookData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true); // Set loading to true when starting fetch
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
            (event) => event.roomName === "Boracay" && event.confirmation === true && event.title || event.roomName === "Palawan and Boracay"
          );
          setBookData(filteredData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetch completes
      }
    };

    fetchBookData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second for real-time accuracy
    return () => clearInterval(timer);
  }, []);

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
    const meetingInterval = setInterval(updateCurrentMeeting, 1000); // Update every second for real-time accuracy
    return () => clearInterval(meetingInterval);
  }, [bookData, currentTime]);

  const formatDate = (date) => {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
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
        {`${meeting.user?.firstName || "Unknown"} ${meeting.user?.surName || "Unknown"
          }`}
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
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000); // End of today

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
      .slice(0, 4); // Limit to 4 upcoming meetings
    return upcomingMeetings.map(renderMeeting);
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const containerClassName = currentMeeting
    ? "meeting-room-schedule in-use"
    : "meeting-room-schedule available";

  return (
    <div className={containerClassName}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <img src={Loader} style={{ width: '200px' }} alt="Loading..." />
        </div>
      ) : (
        <>
          <div className="first-column">
            <div className="room-info">
              {currentMeeting ? (
                <>
                  <h1 className="room-name">{currentMeeting.roomName}</h1>
                  <h1 className="availability">In Use</h1>
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
                        <td>{`${currentMeeting.user?.firstName || "Unknown"} ${currentMeeting.user?.surName || "Unknown"
                          }`}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <>
                  <h1 className="room-name">Palawan</h1>
                  <h1 className="availability">AVAILABLE</h1>
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
              <h2 className="upcoming-meetings">Upcoming Meetings Today</h2>
              {renderUpcomingMeetings().length > 0 ? (
                renderUpcomingMeetings()
              ) : (
                <div className="upcoming-content">
                  <h4 className="meetings">No upcoming meetings today</h4>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BoracayRoomSched;
