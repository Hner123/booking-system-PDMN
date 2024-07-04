import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import logo from '../../assets/logos/GDSLogo.png';
import profile from '../../assets/Default Avatar.png';
import './Header.css';

const Header = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const userName = "John Doe"; // Replace with actual user name
  const department = "Starlight";
  const modalRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setProfileOpen(false);
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
  };
  const handleNotifToggle = () => {
    setNotifOpen(!isNotifOpen);
  };
  const NavigateEdit  = () => {
    navigate('/user/edit');
  }

  const handleLogoClick = () => {
    navigate('/dashboard'); // Replace with the desired route
  };

  return (
    <header className="dashboard-header">
      <div className="logodb" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
        <img src={logo} alt="Logo" />
      </div>
      <div className="header-actions">
        <div className="notif-icon" onClick={handleNotifToggle}>
          <FaBell />
          <span className="notif-count">5</span>
        </div>
        <div className="profile-icon" onClick={handleModalToggle}>
          <FaUserCircle />
          <span className="user-name">{userName}</span>
        </div>
        {isProfileOpen && (
          <div className="headermodal" ref={modalRef}>
            <div className="headermodal-content text-center">
              <div className="profileCont">
                <img src={profile} alt="profile" />
              </div>
              <h2 style={{ textAlign: "center" }}>Hello! {userName}</h2>
              <p style={{ textAlign: "center" }}>Department: {department}</p>
              <hr style={{ border: "0.5px solid #7C8B9D", marginBottom: "20px" }}></hr>
              <div className="headermodal-buttons">
                <button onClick = {NavigateEdit}>
                  Edit Profile
                </button>
                {/* <button onClick={() => console.log("Edit profile")}>
                  Edit Profile
                </button> */}
              </div>
            </div>
          </div>
        )}
        {isNotifOpen && (
          <div className="headermodal" ref={modalRef}>
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
