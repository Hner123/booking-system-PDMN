import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios'; 

const WithAuthReserve = (WrappedComponent) => {
  const WrapperComponent = (props) => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState();

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");
    const reserveToken = localStorage.getItem("reserveToken")

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const [responseUser] = await Promise.all([
            axios.get(`https://pdmnnewshub.ddns.net:8800/api/user/`, { headers }),
          ]);

          if (responseUser.status === 200) {
            const combinedUsers = [
              ...responseUser.data,
            ];
            const user = combinedUsers.find((user) => user._id === userId);
            setUserData(user);
          } else {
            console.error("Failed to fetch users from one or both endpoints");
          }
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };

      fetchUser();
    }, [userId, token]);

    useEffect(() => {
      if (!userId) {
        navigate("/");
        return;
      }

      if(!reserveToken) {
        navigate("/dashboard");
        return;
      }

      if (!token) {
        navigate("/");
      } else {
        const decodedToken = decodeToken(token);
        const isExpired = isTokenExpired(decodedToken.exp);
  
        if (isExpired) {
          localStorage.clear();
          navigate("/");
        } 
      }

    }, [userId, navigate]);

    const decodeToken = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (error) {
        console.error("Error decoding token:", error);
        return null;
      }
    };

    const isTokenExpired = (exp) => {
      const currentTime = Date.now() / 1000;
      return currentTime > exp;
    };

    return <>  <WrappedComponent {...props} /></>;
  };

  return WrapperComponent;
};

export default WithAuthReserve;
