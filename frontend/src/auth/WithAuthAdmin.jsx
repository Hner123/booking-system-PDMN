import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const WithAuthAdmin = (WrappedComponent) => {
  const WithAuthWrapper = (props) => {
    const navigate = useNavigate();

    const [userData, setUserData] = useState(null); // Initialize with null
    const [isLoading, setIsLoading] = useState(true);

    const adminId = localStorage.getItem("adminId");
    const token = localStorage.getItem("adminToken");

    useEffect(() => {
      const fetchUser = async () => {
        if (!adminId || !token) {
          navigate("/admin");
          return;
        }

        try {
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const responseUser = await axios.get(
            `https://pdmnnewshub.ddns.net:8800/api/admin/`,
            { headers }
          );

          if (responseUser.status === 200) {
            const admin = responseUser.data.find(
              (user) => user._id === adminId
            );
            if (admin) {
              setUserData(admin);
            } else {
              // Admin does not exist, clear localStorage and navigate to login
              localStorage.clear();
              navigate("/admin");
            }
          } else {
            console.error("Failed to fetch admin data");
            localStorage.clear();
            navigate("/admin");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
          localStorage.clear();
          navigate("/admin");
        } finally {
          setIsLoading(false);
        }
      };

      fetchUser();
    }, [adminId, token, navigate]);

    useEffect(() => {
      if (!adminId || !token) {
        navigate("/admin");
        return;
      }

      const decodedToken = decodeToken(token);
      if (decodedToken) {
        const isExpired = isTokenExpired(decodedToken.exp);

        if (isExpired) {
          localStorage.clear();
          navigate("/admin");
        }
      }
    }, [adminId, token, navigate]);

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

    // if (isLoading) {
    //   return <div>Loading...</div>;
    // }
    
    return <>  <WrappedComponent {...props} /></>;
  };

  return WithAuthWrapper;
};

export default WithAuthAdmin;
