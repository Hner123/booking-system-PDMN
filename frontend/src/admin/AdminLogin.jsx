import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../user/User.css";
import logo from "../assets/logos/GDSLogo.png";
import mascot from "../assets/33.gif";
import WithoutAuthAdmin from "../auth/WithoutAuthAdmin";

const API = "http://localhost:3001";

const AdminLogin = () => {
    const [adminUser, setUsername] = useState('');
    const [adminPass, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        setError(""); // Clear previous errors

        try {
            const trimmedUserName = adminUser.trim();
            const trimmedPassWord = adminPass.trim();

            const response = await axios.post(
                `${API}/api/auth/login/admin`,
                {
                    adminUser: trimmedUserName,
                    adminPass: trimmedPassWord,
                }
            );

           

            if (response.status === 200) {
                const { authToken } = response.data;
                const { _id } = response.data.user;

                localStorage.setItem("adminToken", authToken);
                localStorage.setItem("adminId", _id);
                 console.log("execute ito", _id);
                navigate('/admin/dashboard');
            }
        } catch (error) {
            setError(error.response.data.message);
        } finally {
            setLoading(false); // Stop loadingj
        }
    };

    const handleNotAdminClick = (e) => {
        e.preventDefault();
        // Handle redirection or other logic for non-admin users
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-form-column">
                <img src={logo} alt="Logo" className="logo" />
                <form className="login-form" onSubmit={handleLogin}>
                    <h2>ADMIN - Log In</h2>
                    {error && <div className="error">{error}</div>}
                    <label htmlFor="adminUser">Username</label>
                    <input
                        type="text"
                        id="adminUser"
                        name="adminUser"
                        required
                        value={adminUser}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                    />
                    <label htmlFor="adminPass">Password</label>
                    <input
                        type="password"
                        id="adminPass"
                        name="adminPass"
                        required
                        value={adminPass}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? "Logging In..." : "Log In"}
                    </button>
                    {/* Use a simple anchor tag for "Not an Admin?" */}
                    <button type="redirect">
                        <a href="/" onClick={handleNotAdminClick}>Not an Admin?</a>
                    </button>
                </form>
            </div>
            <div className="right-column">
                <div className="overlay1">
                    <h2>Effortless Meeting Room Reservations for Your Team!</h2>
                    <img className="mascot" src={mascot} alt="Mascot" />
                </div>
            </div>
        </div>
    );
};

export default WithoutAuthAdmin(AdminLogin);
