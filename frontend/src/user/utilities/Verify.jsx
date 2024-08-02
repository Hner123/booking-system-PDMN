import React from 'react';
import './OtherPages.css';
import GIF from '../../assets/32.gif';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import NotFoundAuth from '../../auth/NotFoundAuthReset';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("resetId");
  const newEmail = localStorage.getItem("newEmail");
  const token = localStorage.getItem("emailToken");

  const handleVerify = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const updateResponse = await axios.patch(
        `https://booking-system-ge1i.onrender.com/api/user/edit/${userId}`,
        { email: newEmail },
        { headers }
      );

      if (updateResponse.status === 201) {
        localStorage.removeItem("resetId");
        localStorage.removeItem("newEmail");
        localStorage.removeItem("emailToken");
        navigate('/dashboard');
      } else {
        toast.error("Failed to update email.");
      }

    } catch (error) {
      toast.error("Failed to update email.");
    }
  };

  return (
    <div className="ver-container">
      <div className="ver">
        <img src={GIF} alt="Verification GIF" />
        <h2>Email Verification</h2>
        <p>You have successfully changed your email!</p>
        <button className="back-button" onClick={handleVerify}>
          Back to Dashboard
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default NotFoundAuth(Verify);
