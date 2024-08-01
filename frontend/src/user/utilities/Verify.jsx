import React, { useEffect } from 'react';
import './OtherPages.css';
import GIF from '../../assets/32.gif';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import NotFoundAuth from '../../auth/NotFoundAuthReset';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("emailId");
  const newEmail = localStorage.getItem("newEmail");
  const token = localStorage.getItem("emailToken");

  useEffect(() => {
    if (token) {
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
            toast.success("Email updated successfully!");
          } else {
            toast.error("Failed to update email.");
          }
          
        } catch (error) {
          toast.error("Failed to update email.");
        }
      };

      handleVerify();
    }
  }, [token, userId, newEmail]);

  return (
    <div className="verify-container">
      <div className="verify">
        <img src={GIF} alt="Verification GIF" />
        <h2>Email Verification</h2>
        <p>You have successfully changed your email!</p>
        <button className="back-button" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default NotFoundAuth(Verify);
