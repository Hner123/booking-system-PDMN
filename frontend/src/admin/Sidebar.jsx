import React, { useState } from 'react';
import logo from '../assets/logos/GDSLogo.png';
import './Sidebar.css'; // Import your CSS file for styling

const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleSidebar = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={`sidebar ${isExpanded ? 'expanded' : ''}`}>
            <div className="logo-container" onClick={toggleSidebar}>
                <img src={logo} alt="Logo" className="logo" />
            </div>
            <div className="sidebar-content">
                {/* Your sidebar content goes here */}
                <ul>
                    <li>Menu Item 1</li>
                    <li>Menu Item 2</li>
                    <li>Menu Item 3</li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
