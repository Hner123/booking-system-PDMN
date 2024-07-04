import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Corrected import statement
import roomBg from '../assets/roombg.jpg'; // Adjust path to your room background image
import './User.css';

const room = ["Palawan", "Boracay", "Palawan and Boracay"];

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

  const handleReserveClick = () => {
    navigate('/reserve');
  };

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <h1>My Dashboard</h1>
        <h2>Book a Meeting Room</h2>
        <div className="card-container">
          {room.map((place, index) => (
            <div
              key={index}
              className="card"
              style={{ backgroundImage: `url(${roomBg})` }}
            >
              <div className="overlay">
                <h3>{place}</h3>
                <button className="reserve-btn" onClick={handleReserveClick}>
                  Reserve
                </button>
              </div>
            </div>
          ))}
        </div>

        <h2>My Reservations</h2>
        <table className="reservation-table">
          <thead>
            <tr>
              <th>Meeting Title</th>
              <th>Status</th>
              <th>Date</th>
              <th>Time</th>
              <th>Meeting Room</th>
            </tr>
          </thead>
          <tbody>
            <tr>
                <td>
                <a
                    href="#"
                    className="meeting-link"
                    onClick={() =>
                    handleMeetingClick({
                        title: 'Team Sync',
                        details: 'This is a team sync meeting',
                        date: '2024-07-03',
                        time: '10:00 AM',
                        room: 'Room A',
                        members: ['John Doe', 'Jane Smith', 'Alex Johnson']
                    })
                    }
                >
                    Team Sync
                </a>
                </td>
                <td>
                <span className="status pending">Pending</span>
                </td>
                <td>2024-07-03</td>
                <td>10:00 AM</td>
                <td>Room A</td>
            </tr>
            <tr>
                <td>
                <a
                    href="#"
                    className="meeting-link"
                    onClick={() =>
                    handleMeetingClick({
                        title: 'Client Meeting',
                        details: 'This is a client meeting',
                        date: '2024-07-04',
                        time: '02:00 PM',
                        room: 'Room B',
                        members: ['Client A', 'Client B']
                    })
                    }
                >
                    Client Meeting
                </a>
                </td>
                <td>
                <span className="status approved">Approved</span>
                </td>
                <td>2024-07-04</td>
                <td>02:00 PM</td>
                <td>Room B</td>
            </tr>
            {/* Add more reservation rows as needed */}
            </tbody>

        </table>
            {showModal && (
                <div className="details-modal">
                    <div className="details-content">
                        <h2>MEETING TITLE</h2>
                        <div className="modal-columns">
                            <div className="left-content">
                                <p><strong>Username:</strong> </p>
                                <p><strong>Department:</strong></p>
                                <p><strong>Number of PAX:</strong></p>
                                <p><strong>Attendees:</strong> </p>
                                <p><strong>Purpose of the Meeting:</strong> </p>
                                <p className="members"><strong>Members:</strong> </p>
                            </div>
                            <div className="right-content">
                                <h3>{selectedMeeting.room}</h3>
                                <p><strong>Date:</strong></p>
                                <p><strong>Meeting Start:</strong></p>
                                <p><strong>Meeting End:</strong></p>
                            </div>
                        </div>
                        <button className="close-btn" onClick={handleCloseModal}>
                            Close
                        </button>
                    </div>
                </div>
            )}

      </main>
    </div>
  );
};

export default Dashboard;
