import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import logo from "../../assets/logos/GDSLogo.png";
import profile from "../../assets/Default Avatar.png";
import "./Header.css";
import axios from "axios";
import Modal from "./Modal";
import io from "socket.io-client";
import { FaTrash } from "react-icons/fa";

const ENDPOINT = "https://booking-system-ge1i.onrender.com";
let socket;

const Header = () => {
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isNotifOpen, setNotifOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const profileDropdownRef = useRef(null);
  const notifDropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const reserve = localStorage.getItem("reserveToken");

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    socket = io(ENDPOINT);
    socket.emit("setup", { _id: userId });
    socket.on("newNotification", (newNotification) => {
      if (newNotification.receiver._id === userId) {
        setNotifications((prev) => [newNotification, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const response = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const userId = localStorage.getItem("userId");
        const response = await axios.get(
          "https://booking-system-ge1i.onrender.com/api/notif"
        );
        const userNotifications = response.data.filter(
          (notif) => notif.receiver._id === userId
        );
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target)
      )
        setProfileOpen(false);
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target)
      )
        setNotifOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleProfileToggle = () => {
    setProfileOpen(!isProfileOpen);
    setNotifOpen(false);
  };

  const handleNotifToggle = () => {
    setNotifOpen(!isNotifOpen);
    setProfileOpen(false);
  };

  const [prevLocation, setPrevLocation] = useState(null);
  const [nextLocation, setNextLocation] = useState(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const excludedPaths = ['/reserve', '/reserveform', '/confirmation'];
  
    if (prevLocation === '/confirmation' && !excludedPaths.includes(currentPath)) {
      localStorage.removeItem("reserveToken");
    }
  
    if ((prevLocation === '/reserve' || prevLocation === '/reserveform') && !excludedPaths.includes(currentPath)) {
      if (reserve) {
        setNextLocation(currentPath);
        setShowModal(true);
      }gfy
    }
  
    if (excludedPaths.includes(currentPath)) {
      setPrevLocation(currentPath);
    } else if (prevLocation && !excludedPaths.includes(prevLocation)) {
      setPrevLocation(prevLocation);
    }
  }, [location, reserve, showModal, prevLocation]);
  
  const handleConfirm = () => {
    setShowModal(false);
    setPrevLocation(nextLocation);
    localStorage.removeItem("reserveToken");
  };

  const handleCancel = () => {
    setShowModal(false);
    if (prevLocation !== nextLocation) {
      navigate(prevLocation);
    } else {
      navigate("/reserve");
    }
  };

  const handleDeleteNotification = async (notifId) => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      await axios.delete(
        `https://booking-system-ge1i.onrender.com/api/notif/delete/${notifId}`,
        { headers }
      );
      setNotifications((prev) => prev.filter((notif) => notif._id !== notifId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const navigateEdit = () => navigate("/user/edit");
  const navigateUserList = () => navigate("/employee-list");
  const handleLogoClick = () => navigate("/dashboard");
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header>
      <Modal
        show={showModal}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <div
        className="headerlogo"
        onClick={handleLogoClick}
        style={{ cursor: "pointer" }}
      >
        <img src={logo} alt="Logo" />
      </div>
      <nav className="nav">
        <div
          className="nav-item"
          onClick={navigateUserList}
          aria-label="User List"
        >
          <FaIcons.FaUsers />
        </div>
        <div
          className="nav-item"
          onClick={handleNotifToggle}
          aria-label="Notifications"
        >
          <FaIcons.FaBell />
          {notifications.length > 0 && (
            <span className="notif-count">{notifications.length}</span>
          )}
          {isNotifOpen && (
            <div
              ref={notifDropdownRef}
              className="dropdown notif-dropdown"
              aria-labelledby="notification-button"
            >
              <h3>Notifications</h3>
              {loadingNotifications ? (
                <p>Loading...</p>
              ) : notifications.length > 0 ? (
                <>
                  <ul>
                    {notifications.map((notif, index) => {
                      let message = notif.message;
                      // Replace "approved" and "rejected" with styled versions
                      message = message.replace(
                        /(approved)/gi,
                        '<span class="status-approved">$1</span>'
                      );
                      message = message.replace(
                        /(rejected)/gi,
                        '<span class="status-rejected">$1</span>'
                      );

                      return (
                        <li key={index}>
                          <div className="notif-item">
                            <p dangerouslySetInnerHTML={{ __html: message }} />
                            <span>
                              {new Date(notif.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}{" "}
                              {new Date(notif.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                            <button
                              className="notif-delete-btn"
                              onClick={() =>
                                handleDeleteNotification(notif._id)
                              }
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <p>No notifications</p>
              )}
            </div>
          )}
        </div>
        <div
          className="nav-item"
          onClick={handleProfileToggle}
          aria-label="Profile"
        >
          <img src={profile} alt="Profile" className="profile-img" />
          {userData && (
            <p className="profile-name">
              {userData.firstName} {userData.surName}
            </p>
          )}
          {isProfileOpen && (
            <div
              ref={profileDropdownRef}
              className="dropdown profile-dropdown"
              aria-labelledby="profile-button"
            >
              {userData && (
                <div className="profile-text">
                  <h3>
                    Hello, {userData.firstName} {userData.surName}!
                  </h3>
                  <p>
                    Department: <strong>{userData.department}</strong>
                  </p>
                </div>
              )}

              <div className="profile-btn">
                <button onClick={navigateUserList}>User List</button>
                <button onClick={navigateEdit}>Edit Profile</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          )}
        </div>
      </nav>
      {showModal && (
        <Modal
          onConfirm={() => setShowModal(false)}
          onCancel={() => setShowModal(false)}
        />
      )}
    </header>
  );
};

export default Header;
