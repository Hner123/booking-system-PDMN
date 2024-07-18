import React from 'react';
import notfound from '../assets/qq.gif';
import './NotFoundPage.css';

const NotFoundPage = () => {
  const redirectToHome = () => {
    window.location.href = "/";
  };

  return (
    <div className="not-found-container">
      <img src={notfound} alt="404 Not Found" className="not-found-img" />
      <h1 className="not-found-heading">404</h1>
      <h2 className="not-found-subheading">Page Not Found</h2>
      <p className="not-found-text">Sorry, the page you are looking for does not exist.</p>
      <p className="not-found-text">
        <button className="not-found-button" onClick={redirectToHome}>Go back</button>
      </p>
    </div>
  );
};

export default NotFoundPage;
