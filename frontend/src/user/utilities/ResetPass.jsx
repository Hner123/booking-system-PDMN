import React, { useState } from 'react';
import NotFoundAuth from '../../auth/NotFoundAuthReset';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here (e.g., validation, API call)
        console.log('Email:', email);
        console.log('Password:', password);
        console.log('Confirm Password:', confirmPassword);
    };

    return (
        <div className="reset-container">
            <div className="reset-form">
                <h2>Change Password</h2>
                <p>Input your new password</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <h4>New Password:</h4>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="reset-form-button">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default NotFoundAuth(ResetPassword);
