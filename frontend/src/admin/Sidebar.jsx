import React from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaBell, FaCalendarCheck } from 'react-icons/fa';
import { MdGroups } from "react-icons/md";
import { HiUserAdd } from 'react-icons/hi';
import logo from '../assets/logos/GDSLogo.png';
import profile from '../assets/Default Avatar.png';
import './Sidebar.css';

const SidebarComponent = () => {
    const userName = "Juan D.C.";
    const department = "Starlight";

    return (  
        <nav className="navbar">
            <div className="sidebar-logo">
                <img src={logo} alt="Logo" className="logo-img" />
            </div>
            <div className='profileDetail'>
                <div className="profileSide">
                    <img src={profile} alt="profile" />
                    <div>
                        <h2 style={{margin:'0'}}>{userName}</h2>
                        <p>{department}</p>
                    </div>
                </div>
            </div>

            <ul className="menu">
                <li className='profileMenu'>
                    <h1>Profile Menu</h1>
                    <hr />
                    <li>
                        <Link to="/profile-settings">
                            <FaUserCircle /> Profile Settings
                        </Link>
                    </li>
                    <li>
                        <Link to="/notifications">
                            <span className="notifCount">5</span>
                            <FaBell /> Notifications
                        </Link>
                    </li>
                </li>
                <li className='adminMenu'>
                    <h1>Admin Menu</h1>
                    <hr />
                    <li>
                        <Link to="/employee-list">
                        <MdGroups/> Employee List
                        </Link>
                    </li>
                    <li>
                        <Link to="/add-employee">
                            <HiUserAdd /> Add Employee
                        </Link>
                    </li>
                    <li>
                        <Link to="/for-approval">
                            <FaCalendarCheck /> For Approval
                        </Link>
                    </li>
                </li>
            </ul>
        </nav>
    );
};

export default SidebarComponent;
