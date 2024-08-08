import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserFriends,
  faUserPlus,
  faBell,
  faSignOutAlt,
  faBars,
  faClipboardCheck,
} from "@fortawesome/free-solid-svg-icons";
import logoOpen from "../assets/logos/GDSLogo.png";
import logoClosed from "../assets/logos/GDSLoog2.png";

const ENDPOINT = "https://booking-system-ge1i.onrender.com";
let socket;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [notif, setNotif] = useState(false);
  const [closeMenu, setCloseMenu] = useState(true);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const notifRef = useRef(null); 

  useEffect(() => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) return;

    socket = io(ENDPOINT);
    socket.emit("setup", { _id: adminId });

    socket.on("connected", () => setSocketConnected(true));
    socket.on("newNotification", (newNotification) => {
      if (newNotification.receiver._id === adminId) {
        setNotifications((prevNotifications) =>
          [...prevNotifications, newNotification].filter(
            (notif) => !notif.done
          )
        );
      }
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adminId = localStorage.getItem("adminId");
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const userResponse = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/admin/${adminId}`,
          { headers }
        );
        if (userResponse.status === 200) {
          setUserData(userResponse.data);
        }

        const notifResponse = await axios.get(
          "https://booking-system-ge1i.onrender.com/api/notif"
        );
        const userNotifications = notifResponse.data
          .filter((notif) => notif.receiver._id === adminId)
          .filter((notif) => !notif.done) 
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 

        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      closeMenu ? "60px" : "250px"
    );
  }, [closeMenu]);

  useEffect(() => {
    setCloseMenu(true);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.clear();
    navigate("/admin");
  };

  const toggleCloseMenu = () => setCloseMenu((prevState) => !prevState);
  const toggleNotif = () => setNotif((prevState) => !prevState);

  return (
    <div className={`sidebar ${closeMenu ? "closed" : "open"}`}>
      <div className="sidebar-header">
        <img
          src={closeMenu ? logoClosed : logoOpen}
          alt="Logo"
          className="logo"
        />
        {!closeMenu && <h2>{userData?.adminUser}</h2>}
      </div>
      <ul>
        <li title="Employee List">
          <a href="/admin/employee-list">
            <FontAwesomeIcon icon={faUserFriends} />
            {!closeMenu && <span>Employee List</span>}
          </a>
        </li>
        <li title="Add Employee">
          <a href="/admin/add-employee">
            <FontAwesomeIcon icon={faUserPlus} />
            {!closeMenu && <span>Add Employee</span>}
          </a>
        </li>
        <li title="For Approval">
          <a href="/admin/approval-rooms">
            <FontAwesomeIcon icon={faClipboardCheck} />
            {!closeMenu && <span>For Approval</span>}
          </a>
        </li>
        <li title={`Notifications (${notifications.length})`}>
          <a onClick={toggleNotif}>
            <FontAwesomeIcon icon={faBell} />
            {!closeMenu && <span>Notifications ({notifications.length})</span>}
          </a>
          {notif && (
            <div className="notifications" ref={notifRef}>
              {notifications.length ? (
                notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="notification"
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                  />
                ))
              ) : (
                <div className="notification">No new notifications</div>
              )}
            </div>
          )}
        </li>
      </ul>
      <div className="sidebar-footer">
        <button
          onClick={toggleCloseMenu}
          className="menu-toggle-button"
          title="Toggle Menu"
        >
          <FontAwesomeIcon icon={faBars} />
          {!closeMenu && <span>Close Sidebar</span>}
        </button>
        <button onClick={handleLogout} className="logout-button" title="Logout">
          <FontAwesomeIcon icon={faSignOutAlt} />
          {!closeMenu && <span> Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
