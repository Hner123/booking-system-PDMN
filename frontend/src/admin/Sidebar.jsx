import React, {useState} from 'react';
import { Link } from 'react-router-dom';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from "react-icons/md";
import { HiUserAdd } from 'react-icons/hi';
import logo from '../assets/logos/GDSLogo.png';
import logosmall from '../assets/logos/GDSLoog2.png'
import profile from '../assets/Default Avatar.png';
import './AdminPages.css';

const SidebarComponent = () => {
    const [sidebar, setSidebar] = useState(true);
    const userName = "Juan D.C.";
    const department = "Starlight";

    const showSidebar =()=>{
        setSidebar(true);
    }

    const hideSidebar =()=>{
        setSidebar(false);
    }

    return (
        <>
        {/* state icons */}
        <div className='sidebar-collapsed'>
            <div className="logodb" style={{padding:'0'}} onClick={showSidebar}>
                <img src={logosmall} alt="Logo" />
            </div>
            <div className='nav-icons'>
                <div className='profile-navicons'>
                    <hr></hr>
                    <div><FaIcons.FaUserCircle /></div>
                    <div><FaIcons.FaBell /></div>
                </div>
                <div className='admin-provicons'>
                    <hr></hr>
                    <div><MdIcons.MdGroups/></div>
                    <div><HiUserAdd /></div>
                    <div><FaIcons.FaCalendarCheck /> </div>
                </div>
            </div>
        </div>
        
        <nav className={sidebar ? 'menu active' : 'menu'} >
        <div className='nav-icon'>
            <Link to='#' className='menu-logo'>
                <MdIcons.MdClose  onClick={hideSidebar}/>
            </Link>
        </div>
            <div className='sidebar-logo'>
            <img src={logo} alt="Logo" />
            </div>
        <ul>

        <div className='profileDetail'>
            <div className="profileSide">
                <img src={profile} alt="profile" />
                <div>
                    <h2 style={{margin:'0'}}>{userName}</h2>
                    <p>{department}</p>
                </div>
            </div>
        </div>
        <li className='profileMenu'>
            <h1>Profile Menu</h1>
            <hr />
            <li>
                <Link to="/profile-settings">
                    <FaIcons.FaUserCircle /> Profile Settings
                </Link>
            </li>
            <li>
                <Link to="/notifications">
                    <span className="notifCount">-</span>
                    <FaIcons.FaBell /> Notifications
                </Link>
            </li>
        </li>
        <li className='adminMenu'>
            <h1>Admin Menu</h1>
            <hr />
            <li>
                <Link to="/admin/employee-list">
                    <MdIcons.MdGroups/> Employee List
                </Link>
            </li>
            <li>
                <Link to="/admin/add-employee">
                    <HiUserAdd /> Add Employee
                </Link>
            </li>
            <li>
                <Link to="/admin/approval">
                    <FaIcons.FaCalendarCheck /> For Approval
                </Link>
            </li>
        </li>
    </ul>
</nav>

        </>  
    );
};

export default SidebarComponent;
