import React, { useState, useEffect } from "react";
import logo from "../assets/logos/GDSLogo.png";
import logosmall from "../assets/logos/GDSLoog2.png";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import { HiUserAdd } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import WithAuthAdmin from "../auth/WithAuthAdmin";
import io from 'socket.io-client';

const ENDPOINT = 'https://booking-system-ge1i.onrender.com';
let socket;

const Sidebar = () => {
  const navigate = useNavigate();
  const [notif, setNotif] = useState(false);
  const [closeMenu, setCloseMenu] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    const adminId = localStorage.getItem("adminId");

    socket = io(ENDPOINT);
    socket.emit("setup", { _id: adminId });

    socket.on("connected", () => setSocketConnected(true));
    socket.on("newNotification", (newNotification) => {
      if (newNotification.receiver._id === adminId) {
        setNotifications((prevNotifications) => [...prevNotifications, newNotification]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminId = localStorage.getItem("adminId");
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/admin/${adminId}`,
          { headers }
        );
        if (response.status === 200) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const adminId = localStorage.getItem("adminId");
        const response = await axios.get('https://booking-system-ge1i.onrender.com/api/notif');
        const userNotifications = response.data.filter(notif => notif.receiver._id === adminId);
        setNotifications(userNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = (event) => {
    event.preventDefault();
    localStorage.clear();
    navigate("/admin");
  };

  const toggleCloseMenu = () => {
    setCloseMenu(!closeMenu);
  };

  const toggleNotif = () => {
    setNotif(!notif);
  };

  return (
    <div className={closeMenu ? "sidebar" : "sidebar active"}>
      <div className="logodbs">
        <img src={logo} alt="Logo" />
      </div>
      <div className="logodbss">
        <img src={logosmall} alt="Logo" />
      </div>
      <div className={closeMenu ? "Contain" : "Contain active"} onClick={toggleCloseMenu}>
        <div className="ContTrigger"></div>
        <div className="ContMenu"></div>
      </div>
      <div className={closeMenu ? "profileDetail" : "profileDetail active"}>
        <h2 style={{ margin: "0" }}>{userData && userData.adminUser}</h2>
      </div>
      <div className={closeMenu ? "menuContainer" : "menuContainer active"}>
        <ul>
          <p className="hed">Admin Menu</p>
          <div className="line" />
          <li className="li" onClick={toggleNotif}>
            <div className="notif-icon">
              <FaIcons.FaBell />
              <p>Notifications</p>
            </div>
          </li>
          <li className="li">
            <a href="/admin/approval-rooms">
              <FaIcons.FaCalendarCheck />
              <p>For Approval</p>
            </a>
          </li>
          <li className="li">
            <a href="/admin/employee-list">
              <MdIcons.MdGroups />
              <p>Employee List</p>
            </a>
          </li>
          <li className="li">
            <a href="/admin/add-employee">
              <HiUserAdd />
              <p>Add Employee</p>
            </a>
          </li>
        </ul>
      </div>
      <div className="last">
        <a href="/admin" onClick={handleLogout} className="logout-link">
          <FaIcons.FaSignOutAlt />
          <p style={{ margin: "0" }}>Log-Out</p>
        </a>
      </div>

      {/* Notification Modal */}
      {notif && (
        <div className="notification-modal">
          <button className="closenotif" onClick={toggleNotif}>X</button>
          <h3 style={{margin:'0', padding:'0', textAlign:'center'}}>Notifications</h3>
          <div>
            {notifications.map((notification) => (
              <div key={notification._id} className="notifContnn">
                {notification.message}
              </div>
            ))}
          </div>
          <div className="seeread">
            <button className="see">
              See All
            </button>
            <button className="read">
              Mark All as Read
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithAuthAdmin(Sidebar);
