import React, { useEffect, useState } from "react";
import "./OtherPages.css";
import GIF from "../../assets/32.gif";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import NotFoundAuth from "../../auth/NotFoundAuthReset";
import { useNavigate, useParams, useLocation } from "react-router-dom";

const API = import.meta.env.VITE_REACT_APP_API || "http://localhost:3001";

const Verify = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const token = queryParams.get("token");
  const newEmail = queryParams.get("email");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleVerify = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        await axios.patch(
          `${API}/api/user/edit/${userId}`,
          { email: newEmail },
          { headers }
        );
      } catch (error) {
        toast.error("Failed to update email.");
      } finally {
        setLoading(false);
      }
    };
    console.log(userId, token, newEmail);
    if (userId && token && newEmail) {
      handleVerify();
    } else {
      toast.error("Invalid parameters, please try again later.");
      setLoading(true);
      return;
    }
  }, [userId, token, newEmail]);

  const handleBackToLogin = () => {
    navigate("/dashboard");
  };

  return (
    <div className="ver-container">
      <div className="ver">
        <img src={GIF} alt="Verification GIF" />
        <h2>Email Verification</h2>
        {loading ? (
          <p>Please wait a moment...</p>
        ) : (
          <p>You have successfully changed your email!</p>
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
};

export default NotFoundAuth(Verify);
