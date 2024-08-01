import React from 'react';
import './OtherPages.css'; 
import GIF from '../../assets/32.gif'; // Corrected path

const Verify = () => {
    return (
        <div className="verify-container">
            <div className="verify">
                <img src={GIF} alt="Verification GIF" /> 
                <h2>Email Verification</h2>
                <p>A Verification link has been sent to your new e-mail</p>
                <button className="back-button">
                    Back to Edit Profile
                </button>
            </div>
        </div>
    );
}

export default Verify;
