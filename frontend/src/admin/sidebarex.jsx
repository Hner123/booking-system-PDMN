import {React,useState} from "react";
import logo from '../assets/logos/GDSLogo.png';
import logosmall from '../assets/logos/GDSLoog2.png';
import profile from '../assets/Default Avatar.png';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import { HiUserAdd } from 'react-icons/hi';

const Sidebar=()=>{
    const userName = "Juan D.C. "
    const department = "Starlight"

    // const location = useLocation();
    const [closeMenu,setCloseMenu] = useState(false);

    const toggleCloseMenu =()=>{
        setCloseMenu(!closeMenu)
    }

    return(
        <div className={closeMenu === false ? "sidebar" : "sidebar active"}>
            <div className={closeMenu === false ? "logodbs" : "logdbs active"}>
                <img src={logo} alt="Logo" />
            </div>
            <div className={closeMenu === false ? "Contain" : "Contain active"} onClick={()=>{toggleCloseMenu()}}>
                <div className="ContTrigger" ></div>
                <div className="ContMenu"></div>
            </div>
            <div className={closeMenu === false ? "profileDetail" : "profileDetail active"}>
                <img src={profile} alt="profile" />
                <div className="profileSide">
                    <h2 style={{ margin: '0' }}>{userName}</h2>
                    <p>{department}</p>
                </div>
            </div>
            <div className={closeMenu === false ? "menuContainer" : "menuContainer active"}>
                <ul> <p className="hed">Profile Menu</p> <div className="line"/>
                    <li><a href="/profile-settings">
                    <FaIcons.FaUserCircle /> Profile Settings</a></li>
                    <li><a href="/notifications">
                    <FaIcons.FaBell /> Notifications</a></li>
                </ul>
                <ul> <p className="hed">Admin Menu</p> <div className="line2"/>
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