import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const NotFoundAuth = (WrappedComponent) => {
  const NotFoundAuthWrapper = (props) => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const queryParams = new URLSearchParams(search);
    const token = queryParams.get("token");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      if (!token) {
        navigate('/page-not-found');

      } else {
        const decodedToken = decodeToken(token);
        const isExpired = isTokenExpired(decodedToken.exp);

        if (isExpired) {
          localStorage.removeItem('resetToken');
          navigate('/page-not-found');

        } else {
          setIsLoading(false);

        }
      }
    }, []);

    const decodeToken = (token) => {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (error) {
        return null;
      }
    };

    const isTokenExpired = (exp) => {
      const currentTime = Date.now() / 1000;
      return currentTime > exp;
    };

    return <> {console.clear()} <WrappedComponent {...props} /></>;
  };

  return NotFoundAuthWrapper;
};

export default NotFoundAuth;
