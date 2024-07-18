import {React,useState} from "react";
import logo from '../assets/logos/GDSLogo.png';
import logosmall from '../assets/logos/GDSLoog2.png';
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
        <div className={closeMenu === false ? "sidebar" : "sidebar active"} >
            <div className="logodbs" >
                <img src={logo} alt="Logo" />
            </div>
            <div className="logodbss">
                <img src={logosmall} alt="Logo" />
            </div>
            <div className={closeMenu === false ? "Contain" : "Contain active"} onClick={()=>{toggleCloseMenu()}}>
                <div className="ContTrigger" ></div>
                <div className="ContMenu"></div>
            </div>
            <div className={closeMenu === false ? "profileDetail" : "profileDetail active"}>
                    <h2 style={{ margin: '0' }}>{userName}</h2>
                    <p>{department}</p>
            </div>
            <div className={closeMenu === false ? "menuContainer" : "menuContainer active"}>
                <ul> <p className="hed">Profile Menu</p> <div className="line"/>
                    <li><a href="/profile-settings">
                    <FaIcons.FaUserCircle /> 
                    <p>Profile Settings</p></a></li>
                    <li><a href="/notifications">
                    <FaIcons.FaBell />
                    <p>Notifications</p></a></li>
                </ul>
                <ul> <p className="hed">Admin Menu</p> <div className="line2"/>
                    <li><a href="/admin/employee-list">
                    <MdIcons.MdGroups /> 
                    <p>Employee List</p></a></li>
                    <li><a href="/admin/add-employee">
                    <HiUserAdd /> 
                    <p>Add Employee</p></a></li>
                    <li><a href="/admin/room-approval">
                    <FaIcons.FaCalendarCheck /> 
                    <p>For Approval</p></a></li>
                </ul>
            </div>
            <div className="last">
            <a href="#">
            <FaIcons.FaSignOutAlt/>
            <p style={{margin:'0'}}>Log-Out</p></a>
            </div>
        </div>
    );
};

export default Sidebar;