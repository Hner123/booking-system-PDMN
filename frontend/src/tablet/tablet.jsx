import React, { useState, useEffect } from "react";
import axios from "axios";
import "./tablet.css";

const MeetingRoomSchedule = () => {
  const [bookData, setBookData] = useState([]);
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

        const response = await axios.get(`http://localhost:8800/api/book/`, { headers });

        if (response.status === 200) {
          const data = response.data;
          setBookData(data);

          const now = new Date();
          const ongoingMeeting = data.find((meeting) => {
            const startTime = new Date(meeting.startTime);
            return now >= startTime && now < new Date(startTime.getTime() + 1 * 60 * 60 * 1000); // Assuming the meeting duration is 1 hour
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

  const renderMeeting = (meeting) => (
    <div key={meeting._id} className="meeting">
      <h3>{meeting.title}</h3>
      <p>
        {new Date(meeting.startTime).toLocaleTimeString()} - {new Date(meeting.endTime).toLocaleTimeString()}
      </p>
      <p>{meeting.user.userName}</p>
    </div>
  );

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="meeting-room-schedule">
      <div className="first-column">
        <div className="room-info">
          <h1>Palawan</h1>
          {currentMeeting ? (
            <>
              <h2>{currentMeeting.title}</h2>
              <table>
                <tbody>
                  <tr>
                    <td>Icon</td>
                    <td>{new Date(currentMeeting.scheduleDate).toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td>Icon</td>
                    <td>
                      {new Date(currentMeeting.startTime).toLocaleTimeString()} - {new Date(currentMeeting.endTime).toLocaleTimeString()}
                    </td>
                  </tr>
                  <tr>
                    <td>Icon</td>
                    <td>{currentMeeting.user.userName}</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : (
            <p>No meeting ongoing</p>
          )}
        </div>
      </div>
      <div className="second-column">
        <div className="clock">
          <h1>{getCurrentTime()}</h1>
        </div>
        <div className="date-info">
          <p>{new Date().toLocaleDateString()}</p>
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
