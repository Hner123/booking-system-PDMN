import React, { useState, useEffect } from 'react';
import './tablet.css'

const MeetingRoomSchedule = ({ reserveId }) => {
  const [meetings, setMeetings] = useState([]);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchMeetings();
    const interval = setInterval(() => {
      fetchMeetings();
      setCurrentTime(new Date());
    }, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update the clock every second
    return () => clearInterval(clockInterval);
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`http://localhost:8800/api/book/${reserveId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await response.json();
      setMeetings(data);
      updateCurrentMeeting(data);
    } catch (error) {
      console.error('Error fetching meetings:', error.message);
    }
  };

  const updateCurrentMeeting = (meetings) => {
    const now = new Date();
    const current = meetings.find(
      (meeting) => new Date(meeting.startTime) <= now && new Date(meeting.endTime) >= now
    );
    setCurrentMeeting(current);
  };

  const renderMeeting = (meeting) => (
    <div key={meeting.id} className="meeting">
      <h3>{meeting.title}</h3>
      <p>{new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
  );

  const renderCurrentMeeting = () => {
    if (!currentMeeting) {
      return <h2 className="available">Available</h2>;
    }
    return (
      <div className="current-meeting">
        <h2>Meeting with Clients</h2>
        {renderMeeting(currentMeeting)}
      </div>
    );
  };

  const renderUpcomingMeetings = () => {
    const now = new Date();
    const upcomingMeetings = meetings.filter(meeting => new Date(meeting.startTime) > now);
    return upcomingMeetings.map(renderMeeting);
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="meeting-room-schedule">
      <div className="first-column">
        <div className="room-info">
          <h1>Palawan</h1>
        </div>
      </div>
      <div className="second-column">
        <div className="clock">
          <h1>{getCurrentTime()}</h1>
        </div>
        <div className="date-info">
          <p>Friday, 28 June 2024</p>
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
