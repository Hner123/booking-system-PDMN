import React, { useState, useEffect } from "react";
import "./tablet.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDay, faClock, faUser } from "@fortawesome/free-solid-svg-icons";

// Sample data for testing
const sampleBookData = [
  {
    _id: "1",
    title: "Project Kickoff",
    startTime: new Date().toISOString(), // current time
    endTime: new Date(new Date().getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes later
    roomName: "Palawan",
    user: {
      firstName: "Jane",
      surName: "Doe",
    },
  },
  {
    _id: "2",
    title: "Team Standup",
    startTime: new Date(new Date().getTime() + 45 * 60 * 1000).toISOString(), // 45 minutes later
    endTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
    roomName: "Boracay",
    user: {
      firstName: "John",
      surName: "Smith",
    },
  },
  {
    _id: "3",
    title: "Design Review",
    startTime: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
    endTime: new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
    roomName: "Palawan",
    user: {
      firstName: "Alice",
      surName: "Johnson",
    },
  },
  {
    _id: "4",
    title: "Strategy Meeting",
    startTime: new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours later
    endTime: new Date(new Date().getTime() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours later
    roomName: "Palawan",
    user: {
      firstName: "Bob",
      surName: "Williams",
    },
  },
];

const MeetingRoomSchedule = ({ reserveId, userId, bookData = sampleBookData, roomName = "Palawan" }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMeeting, setCurrentMeeting] = useState(null);

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
        return now >= startTime && now <= endTime && meeting.roomName === roomName;
      });

      setCurrentMeeting(ongoingMeeting || null);
    };

    updateCurrentMeeting();
    const meetingInterval = setInterval(updateCurrentMeeting, 60000);
    return () => clearInterval(meetingInterval);
  }, [bookData, currentTime, roomName]);

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
    </div>
  );

  const renderUpcomingMeetings = () => {
    const now = new Date();
    const upcomingMeetings = bookData
      .filter((meeting) => meeting.roomName === roomName && new Date(meeting.startTime) > now)
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
          <h1 className="room-name">{roomName}</h1>
          {currentMeeting ? (
            <>
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
          <h2>Upcoming Meetings</h2>
          {renderUpcomingMeetings()}
        </div>
      </div>
    </div>
  );
};

export default MeetingRoomSchedule;
