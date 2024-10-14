import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WithAuthAdmin from "../auth/WithAuthAdmin";
import Sidebar from "./Sidebar";
import "./AdminPages.css";

const API = import.meta.env.VITE_REACT_APP_API;

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    userName: "",
    passWord: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [statusMessages, setStatusMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve status messages from local storage
    const storedMessages = localStorage.getItem("statusMessages");
    const storedDate = localStorage.getItem("statusMessagesDate");
    const currentDate = new Date().toISOString().split("T")[0];

    if (storedDate === currentDate && storedMessages) {
      setStatusMessages(JSON.parse(storedMessages));
    } else {
      // Clear old messages if date has changed
      localStorage.removeItem("statusMessages");
      localStorage.removeItem("statusMessagesDate");
    }
  }, []);

  useEffect(() => {
    const currentDate = new Date().toISOString().split("T")[0];
    localStorage.setItem("statusMessages", JSON.stringify(statusMessages));
    localStorage.setItem("statusMessagesDate", currentDate);
  }, [statusMessages]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validationResponse = await axios.post(
        `${API}/api/auth/validate`,
        { userName: formData.userName }
      );

      if (validationResponse.data.userName.exists) {
        toast.error("Username is already registered");
        setLoading(false);
        setStatusMessages((prevMessages) => [
          ...prevMessages,
          {
            message: `Username ${formData.userName} is already registered.`,
            isError: true,
          },
        ]);
        return;
      }

      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const createResponse = await axios.post(
        `${API}/api/user/create`,
        formData,
        { headers }
      );

      if (createResponse.status === 201) {
        const successMessage = `Employee <strong>${formData.userName}</strong> has been added successfully!`;
        toast.success(`Employee ${formData.userName} has been added successfully!`);
        setStatusMessages((prevMessages) => [
          ...prevMessages,
          { message: successMessage, isError: false },
        ]);
      }
    } catch (error) {
      console.error("Error during employee creation:", error);
      toast.error("Error creating employee. Please try again later.");
      setStatusMessages((prevMessages) => [
        ...prevMessages,
        {
          message: "Error creating employee. Please try again later.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <div
      className={`admin-page ${
        sidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <Sidebar sidebarOpen={sidebarOpen} />
      <div className="admin-content">
        <ToastContainer />
        <h1>Add New Employee</h1>
        <div className="new-container">
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
              <button type="submit" disabled={loading}>
                {loading ? "Adding employee..." : "Add Employee"}
              </button>
            </div>
          </form>
        </div>
        {statusMessages.length > 0 && (
          <div className="status-messages">
            <h2>Recently Added Accounts</h2>
            <ul>
              {statusMessages.map((status, index) => (
                <li
                  key={index}
                  className={status.isError ? "error" : "success"}
                >
                  <span dangerouslySetInnerHTML={{ __html: status.message }} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithAuthAdmin(AddEmployee);
