import React, { useState, useRef } from 'react';
import { FaUserCircle, FaBell, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import logo from '../../assets/logos/GDSLogo.png';
import profile from '../../assets/Default Avatar.png';
import './EditProfile.css';

const Settings = () => {
    const [isNotifOpen, setNotifOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [newDepartment, setNewDepartment] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [showModal, setShowModal] = useState(false); // State for modal visibility
    const userName = 'Juan D.C.';
    const department = 'Starlight'; // Assuming this is the current department
    const fileInputRef = useRef(null);

    // Array of departments
    const departments = ['Department A', 'Department B', 'Department C', 'Department D'];

    const handleNotifToggle = () => {
        setNotifOpen(!isNotifOpen);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Handle the selected file here (e.g., upload to server or display preview)
            console.log('Selected file:', file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('Submitted values:', email, newDepartment, password);
        // Further logic for form submission (e.g., API calls)

        // Reset form fields or perform other actions as needed
        setEmail('');
        setNewDepartment('');
        setPassword('');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleModal = () => {
        setShowModal(!showModal);
    };

    return (
        <div>
            <header className="dashboard-header">
                <div className="logodb">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="header-actions">
                    <div className="notif-icon" onClick={handleNotifToggle}>
                        <FaBell />
                        <span className="notif-count">5</span>
                    </div>
                </div>
            </header>
            <div>
                <h1 style={{ margin: '1% 3%' }}>Edit Profile Account</h1>
            </div>
            <div className='area'>
                <div className='upload'>
                    <div className='profileContain'>
                        <img src={profile} alt="Profile" />
                    </div>
                    <div style={{ marginInline: '3%' }}>
                        <h2>{userName}</h2>
                        <p>{department}</p>
                    </div>
                    <div>
                        {/* File input for uploading images */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }} // Hide the input visually
                            accept=".jpg, .png"        // Accept only JPG and PNG files
                            onChange={handleFileChange} // Handle file selection
                        />
                        <button onClick={() => fileInputRef.current.click()}>Upload</button>
                    </div>
                </div>
                <div className='changeFields'>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="email">Change E-mail Address:</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="Enter your valid e-mail address"
                            />
                        </div>
                        <div>
                            <label htmlFor="department">Change Department / Company:</label>
                            <select
                                id="department"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)}
                                required
                            >
                                <option value="">Select your designated department</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="password">Change Password:</label>
                            <span className="password-toggle-icon" onClick={togglePasswordVisibility}>
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                            <div className="password-input">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Enter new password"
                                />

                            </div>
                        </div>
                        <div className='buttonGroup'>
                            <button type="button" onClick={toggleModal}>Cancel</button>
                            <button type="submit">Submit Changes</button>
                        </div>
                    </form>
                </div>
            </div>
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={toggleModal}>&times;</span>
                        <p>Are you sure you want to cancel?</p>
                        <button onClick={toggleModal}>No</button>
                        <button onClick={toggleModal}>Yes</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
