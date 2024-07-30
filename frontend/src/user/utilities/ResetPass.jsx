import React, { useState } from 'react';

const ResetPass = () => {
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
        <div className="verify-container">
            <div className="verify" >
                <h2>Change Password</h2>
                <p>Input your new password</p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                    <h4 style={{margin:'0', textAlign:'left'}}>New Password:</h4>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button style={{fontSize:"15px", marginTop:'5px'}} type="submit">Submit</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPass;
