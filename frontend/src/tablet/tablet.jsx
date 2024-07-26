import React, { useState, useEffect } from "react";
import axios from "axios";
import "./tablet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faClock, faUser } from "@fortawesome/free-solid-svg-icons";

const MeetingRoomSchedule = ({ }) => {
  const [bookData, setBookData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [otherMeetings, setOtherMeetings] = useState([]);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`http://localhost:8800/api/book`, { headers });

        if (response.status === 200) {
          const data = response.data.filter((meeting) => meeting.roomName === "Palawan");
          setBookData(data);

          const now = new Date();
          const ongoingMeeting = data.find((meeting) => {
            const startTime = new Date(meeting.startTime);
            const endTime = new Date(meeting.endTime);
            return now >= startTime && now <= endTime;
          });

          setCurrentMeeting(ongoingMeeting || null);
          setOtherMeetings(data.filter((meeting) => meeting !== ongoingMeeting));
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
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
    const meetingInterval = setInterval(updateCurrentMeeting, 60000);
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
        })} - {new Date(meeting.endTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p>
        <FontAwesomeIcon icon={faUser} /> {`${meeting.user?.firstName || 'Unknown'} ${meeting.user?.surName || 'Unknown'}`}
      </p>
    </div>
  );

  const renderUpcomingMeetings = () => {
    const now = new Date();
    const upcomingMeetings = bookData
      .filter((meeting) => new Date(meeting.startTime) > now)
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    return upcomingMeetings.map(renderMeeting);
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const containerClassName = currentMeeting ? "meeting-room-schedule in-use" : "meeting-room-schedule available";

  return (
    <div className={containerClassName}>
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
                    <td><FontAwesomeIcon icon={faCalendarDay} /></td>
                    <td>{formatDate(new Date(currentMeeting.startTime))}</td>
                  </tr>
                  <tr>
                    <td><FontAwesomeIcon icon={faClock} /></td>
                    <td>
                      {new Date(currentMeeting.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} - {new Date(currentMeeting.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                  <tr>
                    <td><FontAwesomeIcon icon={faUser} /></td>
                    <td>{`${currentMeeting.user?.firstName || 'Unknown'} ${currentMeeting.user?.surName || 'Unknown'}`}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <h1 className="availability">AVAILABLE</h1>
          )}
        </div>
      </div>
      <div className="second-column">
        <div className="clock">
          <h1>{getCurrentTime()}</h1>
        </div>
        <div className="date-info">
          <p>{formatDate(currentTime)}</p>
        </div>
        <div className="upcoming-meetings">
          <h2>Other Meetings</h2>
          {otherMeetings.length > 0 ? (
            otherMeetings.map(renderMeeting)
          ) : (
            <p>No other meetings</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingRoomSchedule;
