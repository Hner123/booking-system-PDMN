import React, { useState, useEffect } from "react";
import axios from "axios";
import "./tablet.css";

const MeetingRoomSchedule = ({}) => {
  const [bookData, setBookData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [otherMeetings, setOtherMeetings] = useState([]);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `http://localhost:8800/api/bookData/`,
          { headers }
        );

        if (response.status === 200) {
          const data = response.data;
          setBookData(data);

          // Find the current meeting
          const now = new Date();
          const ongoingMeeting = data.find((meeting) => {
            const startTime = new Date(meeting.startTime);
            const endTime = new Date(meeting.endTime);
            return now >= startTime && now <= endTime;
          });

          setCurrentMeeting(ongoingMeeting || null);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();

    // Optionally, update current time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer); // Cleanup timer on component unmount
  }, []);

  useEffect(() => {
    const initialReservations = bookData
      .filter(
        (book) =>
          book.user._id === userId &&
          book.title &&
          book.scheduleDate !== null &&
          book.startTime !== null
      )
      .map((book) => ({
        id: book._id,
        title: book.title,
        status: book.confirmation ? "Approved" : "Pending",
        date: book.scheduleDate, // Assuming scheduleDate is already in a formatted string
        time: book.startTime,    // Assuming startTime is already in a formatted string
        end: book.endTime,       // Assuming endTime is already in a formatted string
        room: book.roomName,
        creator: book.user.userName,
        members: book.attendees,
        guests: book.guest,
        userName: book.user.userName,
        department: book.user.department,
        pax: book.caps.pax,
        agenda: book.agenda,
      }));
    setReservations(initialReservations);

    const initialOtherMeetings = bookData
      .filter(
        (book) =>
          book.user._id !== userId &&
          book.title &&
          book.scheduleDate !== null &&
          book.startTime !== null
      )
      .map((book) => ({
        id: book._id,
        title: book.title,
        status: book.confirmation ? "Approved" : "Pending",
        date: book.scheduleDate, // Assuming scheduleDate is already in a formatted string
        time: book.startTime,    // Assuming startTime is already in a formatted string
        end: book.endTime,       // Assuming endTime is already in a formatted string
        room: book.roomName,
        creator: book.user.userName,
        members: book.attendees,
        guests: book.guest,
        userName: book.user.userName,
        department: book.user.department,
        pax: book.caps.pax,
        agenda: book.agenda,
      }));
    setOtherMeetings(initialOtherMeetings);
  }, [bookData, userId]);

  const formatDate = (date) => date; // No need to format if date is already formatted

  const renderMeeting = (meeting) => (
    <div key={meeting.id} className="meeting">
      <h3>{meeting.title}</h3>
      <p>
        {meeting.time} - {meeting.end}
      </p>
    </div>
  );

  const renderUpcomingMeetings = () => {
    const now = new Date();
    const upcomingMeetings = bookData.filter(
      (meeting) => new Date(meeting.startTime) > now
    );
    return upcomingMeetings.map(renderMeeting);
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString([], {
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
                    <td>icon</td>
                    <td>{formatDate(currentMeeting.date)}</td>
                  </tr>
                  <tr>
                    <td>icon</td>
                    <td>
                      {currentMeeting.time} - {currentMeeting.end}
                    </td>
                  </tr>
                  <tr>
                    <td>icon</td>
                    <td>{currentMeeting.creator}</td>
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
          <p>{formatDate(currentTime.toLocaleDateString())}</p>
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
