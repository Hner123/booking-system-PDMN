import { React, useState, useEffect } from "react";
import logo from "../assets/logos/GDSLogo.png";
import logosmall from "../assets/logos/GDSLoog2.png";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import { HiUserAdd } from "react-icons/hi";
import { useNavigate } from "react-router-dom";

import axios from 'axios'
import WithAuthAdmin from "../auth/WithAuthAdmin";

const Sidebar = () => {
  const navigate = useNavigate();

  const [closeMenu, setCloseMenu] = useState(false);

  const toggleCloseMenu = () => {
    setCloseMenu(!closeMenu);
  };

  const [userData, setUsers] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const adminId = localStorage.getItem("adminId")
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `http://localhost:8800/api/admin/${adminId}`,
          { headers }
        );
        if (response.status === 200) {
          setUsers(response.data);
          if (response.data.resetPass === false) {
            setFirstLogin(true);
          }
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = (event) => {
    event.preventDefault(); // Prevent the default anchor behavior
    localStorage.clear();
    navigate("/admin"); // Navigate to the homepage or login page
  };

  return (
    <div className={closeMenu === false ? "sidebar" : "sidebar active"}>
      <div className="logodbs">
        <img src={logo} alt="Logo" />
      </div>
      <div className="logodbss">
        <img src={logosmall} alt="Logo" />
      </div>
      <div
        className={closeMenu === false ? "Contain" : "Contain active"}
        onClick={() => {
          toggleCloseMenu();
        }}
      >
        <div className="ContTrigger"></div>
        <div className="ContMenu"></div>
      </div>
      <div
        className={
          closeMenu === false ? "profileDetail" : "profileDetail active"
        }
      >
        <h2 style={{ margin: "0" }}>{userData && userData.adminUser}</h2>
      </div>
      <div
        className={
          closeMenu === false ? "menuContainer" : "menuContainer active"
        }
      >
        <ul>
          <p className="hed">Admin Menu</p>
          <div className="line" />
          <li className="li">
            <a href="/notifications">
              <FaIcons.FaBell />
              <p>Notifications</p>
            </a>
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
    </div>
  );
};

export default WithAuthAdmin(Sidebar);
