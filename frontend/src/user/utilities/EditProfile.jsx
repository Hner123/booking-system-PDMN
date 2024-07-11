import React, { useState, useRef } from 'react';
import { FaUserCircle, FaBell, FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import logo from '../../assets/logos/GDSLogo.png';
import profile from '../../assets/Default Avatar.png';
import './EditProfile.css';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const [email, setEmail] = useState('');
    const [newDepartment, setNewDepartment] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const [showModal, setShowModal] = useState(false); // State to manage modal visibility
    const userName = 'Juan D.C.';
    const department = 'Starlight'; // Assuming this is the current department
    const fileInputRef = useRef(null);
    const departments = ['Department A', 'Department B', 'Department C', 'Department D'];
    const navigate = useNavigate(); // Corrected: useNavigate is a function, so it should be called with ()

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
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleCancel = () => {
        setShowModal(true); // Show modal when cancel button is clicked
    };

    const handleConfirmCancel = () => {
        // Handle logic when cancel is confirmed
        setShowModal(false); // Hide modal after handling cancel action
        navigate('/dashboard'); // Navigate to dashboard after confirmation
    };

    const closeModal = () => {
        setShowModal(false); // Close modal without any action
    };

    return (
        <div>
            <header className="dashboard-header">
                <div className="logodb">
                    <img src={logo} alt="Logo" />
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
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }} 
                            accept=".jpg, .png"        
                            onChange={handleFileChange} 
                        />
                        <button className="edit" onClick={() => fileInputRef.current.click()}>Upload</button>
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
                                placeholder="Enter your valid e-mail address"
                            />
                        </div>
                        <div>
                            <label htmlFor="department">Change Department / Company:</label>
                            <select
                                id="department"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)}
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
                                    placeholder="Enter new password"
                                />
                            </div>
                        </div>
                        <div className='buttonGroup'>
                            <button className="edit" onClick={handleCancel}>Cancel</button>
                            <button className="edit"  type="submit">Submit Changes</button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* Modal */}
            {showModal && (
                <div className="profilemodal">
                    <div className="profilemodal-content">
                        <p>Are you sure you want to cancel editing and head back to dashboard?</p>
                        <div className="profilemodal-buttons">
                            <button  onClick={closeModal}>Close</button>
                            <button  onClick={handleConfirmCancel}>Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
