import React from 'react';
import './User.css'; 
import logo from '../assets/logos/GDSLogo.png';
import mascot from '../assets/mascot.png';

const UserLogin = () => {
    return (
        <div className="login-page">
            <div className="login-form-column">
                <img src={logo} alt="Logo" className="logo" />
                <form className="login-form">
                    <h2>Log In</h2>
                    <label htmlFor="email">Username</label>
                    <input type="text" id="email" name="email" required placeholder="Placeholder" />
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required placeholder="Placeholder" />
                    <button type="submit">Log In</button>
                </form>
            </div>
            <div className="right-column">
                <div className="overlay">
                <h2>Effortless Meeting Room Reservations for Your Team!</h2>
                <img className="mascot" src={mascot} alt="Image" />
                </div>
            </div>
        </div>
    );
};

export default UserLogin;
