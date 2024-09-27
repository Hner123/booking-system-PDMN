import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./User.css";
import logo from "../assets/logos/GDSLogo.png";
import mascot from "../assets/33.gif";
import WithoutAuth from "../auth/WithoutAuth";

const UserLogin = () => {
  const [userName, setUsername] = useState("");
  const [passWord, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading
    setError(""); // Clear previous errors

    try {
      const trimmedUserName = userName.trim();
      const trimmedPassWord = passWord.trim();

      const response = await axios.post(
        "https://pdmnnewshub.ddns.net:8800//api/auth/login/user",
        {
          userName: trimmedUserName,
          passWord: trimmedPassWord,
        }
      );

      if (response.status === 200) {
        const { authToken } = response.data;
        const { _id } = response.data.user;

        localStorage.setItem("authToken", authToken);
        localStorage.setItem("userId", _id);

        navigate("/dashboard");
      } else {
        setError("Login failed, please try again.");
      }
    } catch (error) {
      setError(error.response?.data?.message || "An error occurred, please try again.");
    } finally {
      setLoading(false); // Stop loading
    }
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
            disabled={loading} // Disable input when loading
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
            disabled={loading} // Disable input when loading
          />
          <button type="submit" disabled={loading} className={loading ? "loading" : ""}>
            {loading ? "Logging In..." : "Log In"}
          </button>
          <button type="redirect" disabled={loading} className={loading ? "loading" : ""}>
            <Link to="/forgot-pass">Forgot password?</Link>
          </button>
        </form>
      </div>
      <div className="right-column">
        <div className="overlay1">
          <div className="overlay-content">
            <h2>Effortless Meeting Room Reservations for Your Team!</h2>
            <img className="mascot" src={mascot} alt="Mascot" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithoutAuth(UserLogin);
