import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios'; 

const WithAuth = (WrappedComponent) => {
  const WithAuthWrapper = (props) => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState();
    const [isLoading, setIsLoading] = useState(true);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    useEffect(() => {
      const fetchUser = async () => {
        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const [responseUser] = await Promise.all([
            axios.get(`http://localhost:8800/api/user/`, { headers }),
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
          console.error("Error fetching users");
        }
      };

      fetchUser();
    }, [userId]);

    useEffect(() => {
      if (!userData) {
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

    }, [userData, navigate]);

    // useEffect(() => {
    //   const token = localStorage.getItem("emailToken");
    
    //   if (token) {
    //     const decodedToken = decodeToken(token);
    //     const isExpired = isTokenExpired(decodedToken.exp);
    //     if (isExpired) {
    //       localStorage.removeItem("emailToken");
    //     }
    //   }
    // }, []);

    const decodeToken = (token) => {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch (error) {
        console.error("Error decoding token:");
        return null;
      }
    };

    const isTokenExpired = (exp) => {
      const currentTime = Date.now() / 1000;
      return currentTime > exp;
    };

    // Render the wrapped component if not loading
    return <>  <WrappedComponent {...props} /></>;
  };

  return WithAuthWrapper;
};

export default WithAuth;
