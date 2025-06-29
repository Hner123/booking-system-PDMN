import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../assets/7.gif";

const API = import.meta.env.VITE_REACT_APP_API || "http://localhost:3001";

const WithAuth = (WrappedComponent) => {
  const WithAuthWrapper = (props) => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null); // Initialize with null
    const [isLoading, setIsLoading] = useState(true);

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("authToken");

    useEffect(() => {
      console.log("TEST");
      const fetchUser = async () => {
        if (!userId || !token) {
          navigate("/");
          return;
        }

        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const responseUser = await axios.get(`${API}/api/user/`, { headers });

          if (responseUser.status === 200) {
            const user = responseUser.data.find(
              (user) => user._id === parseInt(userId)
            );
            if (user) {
              setUserData(user);
            } else {
              // User does not exist, clear localStorage and navigate to login
              localStorage.clear();
              navigate("/");
            }
          } else {
            console.error("Failed to fetch users");
            localStorage.clear();
            navigate("/");
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          localStorage.clear();
          navigate("/");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }, [userId, token, navigate]);

    useEffect(() => {
      if (!userId || !token) {
        navigate("/");
        return;
      }

      const decodedToken = decodeToken(token);
      if (decodedToken) {
        const isExpired = isTokenExpired(decodedToken.exp);

        if (isExpired) {
          localStorage.clear();
          navigate("/");
        }
      }
    }, [userId, token, navigate]);

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

    if (isLoading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <img src={Loader} style={{ width: "200px" }} alt="Loading..." />
        </div>
      );
    }

    return (
      <>
        {" "}
        <WrappedComponent {...props} />
      </>
    );
  };

  return WithAuthWrapper;
};

export default WithAuth;
