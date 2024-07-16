import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const AddEmployee = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [department, setDepartment] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const departments = ['HR', 'IT', 'Finance', 'Operations', 'Marketing'];
    const navigate = useNavigate();

    const returnPage =()=>{
        navigate('/admin/employee-list')
    }
    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted');
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div>
            <div className='listCont1'>
                <h1>Add Employee</h1>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className='addForm'>
                    <form onSubmit={handleSubmit}>
                        <div className='formGroup'>
                            <label htmlFor='name'>Name:</label>
                            <input
                                type='text'
                                id='name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder='Enter full name of the employee'
                                required
                            />
                        </div>
                        <div className='formGroup'>
                            <label htmlFor='username'>Username:</label>
                            <input
                                type='text'
                                id='username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder='Enter username'
                                required
                            />
                        </div>
                        <div className='formGroup'>
                            <label htmlFor='password'>Password:</label>
                            <div className='passwordInputContainer'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder='Enter password'
                                    required
                                    className='passwordInput' // Apply a custom class for styling
                                />
                                <button
                                    type='button'
                                    onClick={togglePasswordVisibility}
                                    className='togglePasswordBtn' // Apply a custom class for styling
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </button>
                            </div>
                        </div>
                        <div className='formGroup'>
                            <label htmlFor='department'>Department:</label>
                            <select
                                id='department'
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                                className='formControl' // Apply a custom class for styling
                                required
                            >
                                <option value=''>Select Departments</option>
                                {departments.map((dept, index) => (
                                    <option key={index} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='formGroup'>
                            <label htmlFor='role'>Role:</label>
                            <input
                                type='text'
                                id='role'
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                placeholder='Enter role'
                                required
                            />
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

export default AddEmployee;
