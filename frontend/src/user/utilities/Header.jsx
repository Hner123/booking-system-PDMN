import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import logo from "../../assets/logos/GDSLogo.png";
import profile from "../../assets/Default Avatar.png";
import "./Header.css";
import axios from "axios";
import WithAuth from '../../auth/WithAuth';

const Header = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const profileModalRef = useRef(null);
  const notifModalRef = useRef(null);

  const [userData, setUsers] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `http://localhost:8800/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileModalRef.current &&
        !profileModalRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
      if (
        notifModalRef.current &&
        !notifModalRef.current.contains(event.target)
      ) {
        setNotifOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
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
    navigate("/user/edit");
  };

  const navigateUserList = () => {
    navigate("/employee-list");
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleMenu = () => {
    setProfileOpen(false);
    setNotifOpen(false);
    setMenuOpen(!isMenuOpen);
  };

  const markAllAsRead = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.post(
        `http://localhost:8800/api/notifications/${userId}/mark-all-read`,
        {},
        { headers }
      );

      if (response.status === 200) {
        setNotifications(
          notifications.map((notification) => ({
            ...notification,
            read: true,
          }))
        );
      }
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  return (
    <header className="dashboard-header">
      <div
        className="logodb"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      >
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
          <span className="notif-count">
            {notifications.filter((n) => !n.read).length}
          </span>
          <span className="tooltip-text">Notifications</span>
        </div>
        <div className="profile-icon" onClick={handleModalToggle}>
          <FaIcons.FaUserCircle />
          {userData && (
            <span className="user-name">
              {userData.firstName} {userData.surName}
            </span>
          )}
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
              <span className="user-name">
                {userData.firstName} {userData.surName}
              </span>
            </div>
          </div>
        )}

        {/* Profile Modal */}
        {isProfileOpen && (
          <div className="headermodal" ref={profileModalRef}>
            <div className="headermodal-content text-center">
              {/* <div className="profileCont">
                <img src={profile} alt="profile" />
              </div> */}
              {userData && (
                <>
                  <h2 style={{ textAlign: "center" }}>
                    Hello! {userData.firstName} {userData.surName}
                  </h2>
                  <p style={{ textAlign: "center" }}>
                    Department: {userData.department}
                  </p>
                </>
              )}
              <hr
                style={{ border: "0.5px solid #7C8B9D", marginBottom: "20px" }}
              ></hr>
              <div
                className="headermodal-buttons"
                style={{ display: "flex", gap: "10px" }}
              >
                <button onClick={navigateEdit}>Edit Profile</button>
                <button onClick={handleLogout}>Log Out</button>
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
                <hr
                  style={{ border: "0.5px solid #7C8B9D", margin: "5px" }}
                ></hr>
                <ul className="notifications-list">
                  {notifications.map((notification, index) => (
                    <li
                      key={index}
                      className={`notification-item ${
                        notification.read ? "read" : "unread"
                      }`}
                    >
                      <p>{notification.message}</p>
                      <span>
                        {new Date(notification.date).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="headermodal-buttons">
                  <button onClick={markAllAsRead}>Mark All as Read</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default WithAuth(Header);
