import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './User.css';
import logo from '../assets/logos/GDSLogo.png';
import mascot from '../assets/mascot.png';

const UserLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        // Here you would typically handle the login logic, like calling an API
        // For demonstration, we'll just log the username and password
        console.log(`Username: ${username}, Password: ${password}`);

        // Clear form fields
        setUsername('');
        setPassword('');
        setError('');

        // Navigate to the dashboard after successful login
        navigate('/user/dashboard');
    };

    return (
        <div className="login-page">
            <div className="login-form-column">
                <img src={logo} alt="Logo" className="logo" />
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Log In</h2>
                    {error && <div className="error">{error}</div>}
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                    <button type="submit">Log In</button>
                </form>
            </div>
            <div className="right-column">
                <div className="overlay">
                    <h2>Effortless Meeting Room Reservations for Your Team!</h2>
                    <img className="mascot" src={mascot} alt="Mascot" />
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
