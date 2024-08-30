import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const ForgotPass = () => {
  const [email, setEmail] = useState('');
  const [timer, setTimer] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [userData, setUserData] = useState(null);
  const [message, setMessage] = useState('');
  const [hasSentEmail, setHasSentEmail] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUserData = async () => {
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
          setMessage('An email has been sent to your account');
          
          if (!hasSentEmail) {
            await sendEmail(response.data.email);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId && !hasSentEmail) {
      fetchUserData();
    }
  }, [userId, hasSentEmail]);

  const sendEmail = async (email) => {
    try {
      const response = await axios.post(
        'https://booking-system-ge1i.onrender.com/api/email/forgotpass',
        { email }
      );

      if (response.status === 201) {
        const { message } = response.data;
        toast.success(message);
        setHasSentEmail(true);
      }
      
    } catch (error) {
      if (error.response && error.response.status === 404) {
        toast.error('No user found.');
      } else {
        toast.error(`Error: ${error.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (email.trim() === '') {
        toast.error('Please enter your email address.');
      } else {
        const response = await axios.post(
          'https://booking-system-ge1i.onrender.com/api/email/forgotpass', 
          { email }
        );

        if (response.status === 201) {
          const { message, passToken, passId } = response.data;
          localStorage.setItem('resetToken', passToken);
          localStorage.setItem('resetId', passId);
          toast.success(message);
          setIsButtonDisabled(true);
          startTimer();
        }

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

  return (
    <div className="ver-container">
      <div className="ver">
        <h2>Reset Password</h2>
        <p>{userId && hasSentEmail ? message : 'Input your email to reset your password'}</p>
        {!userId ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
            <h4>Email:</h4>
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
              type="submit"
              disabled={isButtonDisabled}
              className='ver-button'
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
