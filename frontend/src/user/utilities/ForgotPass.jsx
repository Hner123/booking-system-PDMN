import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPass = () => {
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [userData, setUserData] = useState(null);
  
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) {
          setUserData(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (userId) {
      const changePassword = async () => {
        try {
          const response = await axios.post('https://booking-system-ge1i.onrender.com/api/auth/changepass', { email: userData.email });
          const { message, passToken } = response.data;
          localStorage.setItem('resetToken', passToken);
          toast.success(message);
          setIsButtonDisabled(true);
          startTimer();
        } catch (error) {
          if (error.response && error.response.status === 404) {
            toast.error('No user found.');
          } else {
            toast.error(`Error: ${error.message}`);
          }
        }
      };

      changePassword();
    }
  }, [userId, email]);

  const handleSubmit = (event) => {
    event.preventDefault();
    localStorage.setItem("userId", email);
  };

  const startTimer = () => {
    const timerId = setTimeout(() => {
      setIsButtonDisabled(false);
      clearTimeout(timerId);
    }, 30000); // One minute timer
    setTimer(timerId);
  };

  useEffect(() => {
    if (isButtonDisabled) {
      const intervalId = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1000);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isButtonDisabled]);

  useEffect(() => {
    if (isButtonDisabled) {
      setRemainingTime(30000);
    }
  }, [isButtonDisabled]);

  return (
    <div className="verify-container">
      <div className="verify">
        <h2>Reset Password</h2>
        <p>Input your email to reset your password</p>
        <h4 style={{ margin: '0', textAlign: 'left' }}>Email:</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-groupss">
            <input
              placeholder='Enter your valid email'
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            style={{ fontSize: "15px", marginTop: '5px' }}
            type="submit"
            disabled={isButtonDisabled}
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPass;
