import React, { useState } from 'react';
import { useLocation, useParams, useLocation } from 'react-router-dom';
import NotFoundAuth from '../../auth/NotFoundAuthReset';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const ResetPassword = () => {
  const { userId } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const token = queryParams.get("token");

  const [passWord, setPassword] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passWord.trim() === "") {
      toast.error("Please enter your new password.");
      return;
    }
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      await axios.patch(
        `https://booking-system-ge1i.onrender.com/api/auth/resetpass/${userId}`,
        { passWord },
        { headers }
      );
      toast.success("Password updated successfully!");
      setIsButtonDisabled(true);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error("No user found.");
      } else {
        toast.error("This link has expired or is invalid.");
      }
    }
  };

  return (
    <div className="reset-container">
      <ToastContainer />
      <div className="reset-form">
        <h2>Change Password</h2>
        <p>Input your new password below:</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group relative">
            <label htmlFor="passWord">New Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              id="passWord"
              name="passWord"
              value={passWord}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 transform -translate-y-1/2 text-sm"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button
            type="submit"
            className={`w-full py-2 rounded-lg transition duration-300 ${isButtonDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-700 text-white hover:bg-orange-500"
              }`}
            disabled={isButtonDisabled}
          >
            {isButtonDisabled
              ? "You can now close this window"
              : "Confirm New Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotFoundAuth(ResetPassword);
