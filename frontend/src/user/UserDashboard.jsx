import React, { useState } from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import logo from '../assets/logos/GDSLogo.png';
import roomBg from '../assets/roombg.jpg'; // Adjust path to your room background image

const Header = () => {
    const [showModal, setShowModal] = useState(false);
  
    const userName = 'John Doe'; // Replace with the actual user name
  
    const handleModalToggle = () => {
      setShowModal(!showModal);
    };
  
    return (
      <header className="dashboard-header">
        <div className="logodb">
          <img src={logo} alt="Logo" />
        </div>
        <div className="header-actions">
            <div className="notif-icon">
                <FaBell />
                <span className="notif-count">5</span>
            </div>
            <div className="profile-icon">
                <FaUserCircle />
                <span className="user-name">{userName}</span>
            </div>
            <div className="modal">
                <div className="modal-content">
                <h2>User Profile</h2>
                <p>Welcome, {userName}!</p>
                <button onClick={() => console.log("Go to settings")}>
                    Settings
                </button>
                <button onClick={() => console.log("Edit profile")}>
                    Edit Profile
                </button>
                </div>
            </div>
            </div>
      </header>
    );
  };

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Header /> {/* Add the Header component here */}
      <main className="dashboard-main">
        <h1>My Dashboard</h1>
        <h2>Book a Meeting Room</h2>
        <div className="card-container">
            <div className="card" style={{ backgroundImage: `url(${roomBg})` }}>
            <div className="overlay">
                <h3>Card Title 1</h3>
                <button className="reserve-btn">Reserve</button> {/* Add the reserve button */}
            </div>
            </div>
            <div className="card" style={{ backgroundImage: `url(${roomBg})` }}>
            <div className="overlay">
                <h3>Card Title 2</h3>
                <button className="reserve-btn">Reserve</button> {/* Add the reserve button */}                
            </div>
            </div>
            <div className="card" style={{ backgroundImage: `url(${roomBg})` }}>
            <div className="overlay">
                <h3>Card Title 3</h3>
                <button className="reserve-btn">Reserve</button> {/* Add the reserve button */}
            </div>
            </div>
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
                <td><a href="#" className="meeting-link">Team Sync</a></td>
                <td><span className="status pending">Pending</span></td>
                <td>2024-07-03</td>
                <td>10:00 AM</td>
                <td>Room A</td>
            </tr>
            <tr>
                <td><a href="#" className="meeting-link">Client Meeting</a></td>
                <td><span className="status approved">Approved</span></td>
                <td>2024-07-04</td>
                <td>02:00 PM</td>
                <td>Room B</td>
            </tr>
            {/* Add more reservation rows as needed */}
            </tbody>
        </table>
        </main>
    </div>
  );
};

export default Dashboard;