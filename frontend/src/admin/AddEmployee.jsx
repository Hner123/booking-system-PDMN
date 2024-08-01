import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WithAuthAdmin from '../auth/WithAuthAdmin';
import Sidebar from './Sidebar';
import './AdminPages.css';

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    userName: "",
    passWord: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const validationResponse = await axios.post(
        `https://booking-system-ge1i.onrender.com/api/auth/validate`,
        { userName: formData.userName }
      );

      if (validationResponse.data.userName.exists) {
        toast.error("Username is already registered");
        return;
      }
    } catch (error) {
      toast.error("Failed to validate username");
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
        toast.success("Employee has been added successfully!", {
          autoClose: 1500,
          onClose: () => navigate("/admin/employee-list")
        });        
      }
    } catch (error) {
      console.error("Error during employee creation:", error);
      toast.error("Error creating employee");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`admin-page ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="admin-content">
        <ToastContainer />
        <h1>Add New Employee</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Username:</label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="passWord">Password:</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="passWord"
                name="passWord"
                value={formData.passWord}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="password-toggle"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WithAuthAdmin(AddEmployee);
