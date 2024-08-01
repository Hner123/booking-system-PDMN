import React from 'react';
import './OtherPages.css'; 
import GIF from '../../assets/32.gif'; // Corrected path

const Verify = () => {
    return (
        <div className="ver-container">
            <div className="ver">
                <img src={GIF} alt="Verification GIF" /> 
                <h2>Email Verification</h2>
                <p>You have successfully changed your email!</p>
                <button className="back-button">
                    Back to Dashboard
                </button>
            </div>
        </div>
    );
}

export default Verify;
