import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './User.css';
import logo from '../assets/logos/GDSLogo.png';
import mascot from '../assets/mascot.png';

const UserLogin = () => {
    const [userName, setUsername] = useState('');
    const [passWord, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const trimmedUserName = userName.trim();
            const trimmedPassWord = passWord.trim();

            setLoading(true);

            const response = await axios.post(
                "http://localhost:8800/api/auth/login/user",
                {
                    userName: trimmedUserName,
                    passWord: trimmedPassWord,
                }
            );

            if (response.status === 200) {
                const { authToken, emailToken } = response.data;
                const { _id, accType } = response.data.user;

                // localStorage.setItem("authToken", authToken);
                // localStorage.setItem("verifyToken", emailToken);
                setLoading(false);
                navigate('/dashboard');
            }
        } catch (error) {
            setLoading(false);
            setError(error.response.data.message);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!userName || !passWord) {
            setError('Please enter both username and password.');
            return;
        }

        console.log(`Username: ${userName}, Password: ${passWord}`);

        // Clear form fields
        setUsername('');
        setPassword('');
        setError('');

        // Navigate to the dashboard after successful login
        navigate('/dashboard');
    };

    return (
        <div className="login-page">
            <div className="login-form-column">
                <img src={logo} alt="Logo" className="logo" />
                <form className="login-form" onSubmit={handleLogin}>
                    <h2>Log In</h2>
                    {error && <div className="error">{error}</div>}
                    <label htmlFor="userName">Username</label>
                    <input
                        type="text"
                        id="userName"
                        name="userName"
                        required
                        value={userName}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={passWord}
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
