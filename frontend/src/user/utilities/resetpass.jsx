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
                <h2>Reset Password</h2>
                <p>Input your email to reset your password</p>
                <h4 style={{margin:'0', textAlign:'left'}}>Email:</h4>
                <form onSubmit={handleSubmit}>
                    <div className="form-groupss">
                        <input
                            placeholder='Enter your valid email'
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button style={{fontSize:"15px", marginTop:'5px'}} type="submit">Verify</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPass;
