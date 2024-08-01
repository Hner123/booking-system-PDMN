import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const ForgotPass = () => {
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userFetched, setUserFetched] = useState(false);
  const [message, setMessage] = useState('');
  const hasChangedPasswordRef = useRef(false); // Ref to track password change

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
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
            setUserFetched(true);
            setMessage('An email has been sent to your account');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const changePassword = async () => {
      if (userFetched && userData && userData.email && !hasChangedPasswordRef.current) {
        try {
          const response = await axios.post('https://booking-system-ge1i.onrender.com/api/auth/changepass', { email: userData.email });
          const { message, passToken } = response.data;
          localStorage.setItem('resetToken', passToken);
          toast.success(message);
          hasChangedPasswordRef.current = true; // Set ref to true after change
        } catch (error) {
          if (error.response && error.response.status === 404) {
            toast.error('No user found.');
          } else {
            toast.error(`Error: ${error.message}`);
          }
        }
      }
    };

    if (userFetched && userData && userData.email && !isButtonDisabled) {
      changePassword();
    }
  }, [userFetched, userData, isButtonDisabled]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (email.trim() === '') {
        toast.error('Please enter your email address.');
      } else {
        const response = await axios.post('https://booking-system-ge1i.onrender.com/api/auth/changepass', { email });
        const { message, passToken } = response.data;
        localStorage.setItem('resetToken', passToken);
        toast.success(message);
        setIsButtonDisabled(true);
        startTimer();
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('No user found.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const startTimer = () => {
    const timerId = setTimeout(() => {
      setIsButtonDisabled(false);
      clearTimeout(timerId);
    }, 30000); // 30 seconds timer
    setTimer(timerId);
  };

  useEffect(() => {
    if (isButtonDisabled) {
      setRemainingTime(30000);
      const intervalId = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1000);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isButtonDisabled]);

  return (
    <div className="verify-container">
      <div className="verify">
        <h2>Reset Password</h2>
        <p>{userId && userFetched ? message : 'Input your email to reset your password'}</p>
        {!userId ? (
          <form onSubmit={handleSubmit}>
            <h4 style={{ margin: '0', textAlign: 'left' }}>Email:</h4>
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
            {isButtonDisabled && <p>Try again in {remainingTime / 1000} seconds</p>}
          </form>
        ) : null}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ForgotPass;
