import React, { useState } from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import logo from '../assets/logos/GDSLogo.png'

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

export default Header;