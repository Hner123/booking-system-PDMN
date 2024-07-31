import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import WithAuthAdmin from '../auth/WithAuthAdmin';

import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const AddEmployee = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        userName: "",
        passWord: ""
    })

    const navigate = useNavigate();

    const returnPage =()=>{
        navigate('/admin/employee-list')
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const validationResponse = await axios.post(
              `https://booking-system-ge1i.onrender.com/api/auth/validate`,
              {
                userName: formData.userName,
              }
            );
      
            if (validationResponse.data.userName.exists) {
              toast.error("Username is already registered");
              return;
            }
          } catch (error) {
            toast.error("Failed to validate email");
            return;
          }
    
        const employeeData = {
          userName: formData.userName,
          passWord: formData.passWord,
        };
    
        try {
          const token = localStorage.getItem("adminToken");
    
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };
    
          const updateResponse = await axios.post(
            `https://booking-system-ge1i.onrender.com/api/user/create`,
            employeeData,
            { headers }
          );
    
          if (updateResponse.status === 201) {
            navigate("/admin/employee-list");
          }
        } catch (error) {
          console.error("Error during patch:", error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div style={{margin:'150px 0px'}}>
            <ToastContainer/>
            <div className='listCont1'>
                <h1>Add Employee</h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className='addForm'>
                    <form onSubmit={handleSubmit}>
                        <div className='formGroup'>
                            <label htmlFor='userName'>Username:</label>
                            <input
                                type='text'
                                id='userName'
                                name='userName'
                                value={formData.userName}
                                onChange={handleChange}
                                placeholder='Enter username'
                                required
                            />
                        </div>
                        <div className='formGroup' style={{position:'relative'}}>
                            <label htmlFor='passWord'>Password:</label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id='passWord'
                                    name='passWord'
                                    value={formData.passWord}
                                    onChange={handleChange}
                                    placeholder='Enter password'
                                    required
                                    className='passwordInput' // Apply a custom class for styling
                                />
                                <button
                                    type='view'
                                    onClick={togglePasswordVisibility}
                                    className='togglePasswordBtn' // Apply a custom class for styling
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                        </div>
                        <div className='addGroup'>
                            <button type='submit'  className='mainBtn'>Submit</button>
                            <button type='button' onClick={returnPage} className='secondBtn'>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default WithAuthAdmin(AddEmployee);
