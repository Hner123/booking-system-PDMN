import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import logo from '../../assets/logos/GDSLogo.png';
import profile from '../../assets/Default Avatar.png';
import './Header.css';

const Header = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const userName = "John Doe";
  const department = "Starlight";
  const navigate = useNavigate();
  const profileModalRef = useRef(null);
  const notifModalRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (notifModalRef.current && !notifModalRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const handleModalToggle = () => {
    setProfileOpen(!isProfileOpen);
    setNotifOpen(false);
  };

  const handleNotifToggle = () => {
    setNotifOpen(!isNotifOpen);
    setProfileOpen(false);
  };

  const navigateEdit = () => {
    navigate('/user/edit');
  };

  const navigateUserList = () => {
    navigate('/employee-list');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const toggleMenu = () => {
    setProfileOpen(false);
    setNotifOpen(false);
    setMenuOpen(!isMenuOpen);
  };

  return (
    <header className="dashboard-header">
      <div className="logodb" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <span className="tooltip-text">Home</span>
        <img src={logo} alt="Logo" />
      </div>

      <div className="header-actions">
        <div className="user-list-icon" onClick={navigateUserList}>
          <FaIcons.FaUsers />
          <span className="tooltip-text">User List</span>
        </div>
        <div className="notif-icon" onClick={handleNotifToggle}>
          <FaIcons.FaBell />
          <span className="notif-count">5</span>
          <span className="tooltip-text">Notifications</span>
        </div>
        <div className="profile-icon" onClick={handleModalToggle}>
          <FaIcons.FaUserCircle />
          <span className="user-name">{userName}</span>
        </div>

        {/* Burger Menu Icon for mobile */}
        <div className="burger-menu" onClick={toggleMenu}>
          <FaIcons.FaBars />
        </div>

        {/* Burger Menu Content */}
        {isMenuOpen && (
          <div className="burger-menu-content">
            <div className="user-list-icon" onClick={navigateUserList}>
              <FaIcons.FaUsers />
              <span className="user-name">User List</span>
            </div>
            <div className="notif-icon" onClick={handleNotifToggle}>
              <FaIcons.FaBell />
              <span className="user-name">Notifications</span>
            </div>
            <div className="profile-icon" onClick={navigateEdit}>
              <FaIcons.FaUserCircle />
              <span className="user-name">{userName}</span>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {isProfileOpen && (
          <div className="headermodal" ref={profileModalRef}>
            <div className="headermodal-content text-center">
              <div className="profileCont">
                <img src={profile} alt="profile" />
              </div>
              <h2 style={{ textAlign: "center" }}>Hello! {userName}</h2>
              <p style={{ textAlign: "center" }}>Department: {department}</p>
              <hr style={{ border: "0.5px solid #7C8B9D", marginBottom: "20px" }}></hr>
              <div className="headermodal-buttons">
                <button onClick={navigateEdit}>
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Modal */}
        {isNotifOpen && (
          <div className="headermodal" ref={notifModalRef}>
            <div className="headermodal-content">
              <div>
                <h1 style={{ margin: "0" }}>Your Notifications</h1>
                <hr style={{ border: "0.5px solid #7C8B9D", margin: "5px" }}></hr>
                <div className='headermodal-buttons'>
                  <button onClick={() => console.log("Mark all as read")}>
                    Mark All as Read
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
