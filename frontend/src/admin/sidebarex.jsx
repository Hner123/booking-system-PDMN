import React from "react";
import logo from '../assets/logos/GDSLogo.png';
import logosmall from '../assets/logos/GDSLoog2.png';
import profile from '../assets/Default Avatar.png';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import { HiUserAdd } from 'react-icons/hi';

const Sidebar=()=>{
    const userName = "Juan D.C. "
    const department = "Starlight"
    return(
        <div className="sidebar">
            <div className="logodbs">
                <img src={logo} alt="Logo" />
            </div>
            <div className="Contain">
                <div className="ContTrigger"></div>
                <div className="ContMenu"></div>
            </div>
            <div className='profileDetail'>
                <img src={profile} alt="profile" />
                <div className="profileSide">
                    <h2 style={{ margin: '0' }}>{userName}</h2>
                    <p>{department}</p>
                </div>
            </div>
            <div className="menuContainer">
                <ul> Profile Menu
                    <li><a href="/profile-settings">
                    <FaIcons.FaUserCircle /> Profile Settings</a></li>
                    <li><a href="/notifications">
                    <FaIcons.FaBell /> Notifications</a></li>
                </ul>
                <ul>Admin Menu
                    <li><a href="/admin/employee-list">
                    <MdIcons.MdGroups /> Employee List</a></li>
                    <li><a href="/admin/add-employee">
                    <HiUserAdd /> Add Employee</a></li>
                    <li><a href="/admin/room-approval">
                    <FaIcons.FaCalendarCheck /> For Approval</a></li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;