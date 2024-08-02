import React, { useEffect, useState } from 'react';
import './OtherPages.css';
import GIF from '../../assets/32.gif';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import NotFoundAuth from '../../auth/NotFoundAuthReset';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const Verify = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const newEmail = queryParams.get("email");
  const token = queryParams.get("token");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

        if (updateResponse.status === 200) {
          localStorage.removeItem("resetId");
          localStorage.removeItem("newEmail");
          localStorage.removeItem("emailToken");
        } else {
          toast.error("Failed to update email.");
        }
      } catch (error) {
        toast.error("Failed to update email.");
      } finally {
        setLoading(false);
      }
    };
    if (userId && token) {
      handleVerify();
    }
  }, [userId, token, newEmail]);

  const handleBackToLogin = () => {
    localStorage.removeItem("resetId");
    localStorage.removeItem("newEmail");
    localStorage.removeItem("emailToken");
    navigate('/dashboard');
  };

  return (
    <div className="ver-container">
      <div className="ver">
        <img src={GIF} alt="Verification GIF" />
        <h2>Email Verification</h2>
        {loading ? (
          <p>Please wait a minute...</p>
        ) : (
          <>
            <p>You have successfully changed your email!</p>
          </>
        )}
        <button
          className="back-button"
          onClick={handleBackToLogin}
          disabled={loading}
        >
          Back to Dashboard
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default NotFoundAuth(Verify);
