import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";
import WithAuth from "../../auth/WithAuth";

import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import bcrypt from 'bcryptjs'

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);

  const [userData, setUsers] = useState();

  const userId = localStorage.getItem("userId");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `http://localhost:8800/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) {
          setUsers(response.data);
          setFormData({
            email: response.data.email,
            department: response.data.department
          });
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const [formData, setFormData] = useState({
    email: "",
    department: "",
    currPass: "",
    passWord: "",
    retype: ""
  });

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate email
  try {
    const validationResponse = await axios.post(
      `http://localhost:8800/api/auth/validate`,
      { email: formData.email }
    );

    if (validationResponse.data.email.exists) {
      toast.error("Email is already registered.");
      return;
    }
  } catch (error) {
    toast.error("Failed to validate email.");
    return;
  }

  // Validate current password and new password
  try {
    const isCurrentPasswordCorrect = await bcrypt.compare(formData.currPass, userData.passWord);
    if (!isCurrentPasswordCorrect) {
      toast.error("Current password is incorrect.");
      return;
    }

    if (formData.currPass === formData.passWord) {
      toast.error("New password must be different from the current password.");
      return;
    }

    if (formData.passWord !== formData.retype) {
      toast.error("New password does not match.");
      return;
    }
  } catch (error) {
    toast.error("Failed to validate password.");
    return;
  }

  // Construct updatedUser with only changed fields
  const updatedUser = {};
  if (formData.department !== userData.department) {
    updatedUser.department = formData.department;
  }

  if (formData.passWord) {
    updatedUser.passWord = formData.passWord; // Only add the new password if it needs to be changed
  }

  if (Object.keys(updatedUser).length === 0) {
    toast.info("No changes detected.");
    return;
  }

  // Update user
  try {
    const token = localStorage.getItem("authToken");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const updateResponse = await axios.patch(
      `http://localhost:8800/api/user/edit/${userId}`,
      updatedUser,
      { headers }
    );

    if (updateResponse.status === 201) {
      toast.success("Successfully changed info.");
    }
  } catch (error) {
    console.error("Error during patch:", error);
    toast.error("Failed to update user info.");
  }
};

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCancel = () => {
    setShowModal(true);
  };

  const handleConfirmCancel = () => {
    setShowModal(false);
    navigate("/dashboard");
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      <ToastContainer/>
      <div>
        <h1 style={{ margin: "1% 3%" }}>Edit Profile Account</h1>
      </div>
      <div className="area">
        {userData && (
          <>
            <div className="upload">
              <div>
                <h2>
                  {userData.firstName} {userData.surName}
                </h2>
                <h3>{userData.userName}</h3>
              </div>
              <h4>Department: {userData.department}</h4>
              <h4>Email: {userData.email}</h4>
            </div>
          </>
        )}
        <div className="changeFields">
          <form onSubmit={handleSubmit}>
            <div className="formGroup1">
              <label htmlFor="email">
                Change E-mail Address:
                {isValidEmail && (
                  <button type="button" className="verifyemail">
                    Verify
                  </button>
                )}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your valid e-mail address"
              />
            </div>
            <div className="formGroup1">
              <label htmlFor="department">Change Department / Company:</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
              >
                <option value="">Select Department</option>
                <option value="Philippine Dragon Media Network">
                  Philippine Dragon Media Network
                </option>
                <option value="GDS Travel Agency">GDS Travel Agency</option>
                <option value="FEILONG Legal">FEILONG Legal</option>
                <option value="STARLIGHT">STARLIGHT</option>
                <option value="BIG VISION PRODS.">BIG VISION PRODS.</option>
                <option value="SuperNova">SuperNova</option>
                <option value="ClearPath">ClearPath</option>
                <option value="Dragon AI">Dragon AI</option>
              </select>
            </div>
            <div className="formGroup1" style={{ position: "relative" }}>
              <label htmlFor="currPass">Current Password:</label>
              <div className="passwordInputContainer">
                <input
                  type={showPassword ? "text" : "password"}
                  id="currPass"
                  name="currPass"
                  value={formData.currPass}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="passwordInput"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="togglePasswordBtn_user"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="formGroup1" style={{ position: "relative" }}>
              <label htmlFor="password">New Password:</label>
              <div className="passwordInputContainer">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="passWord"
                  value={formData.passWord}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="passwordInput"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="togglePasswordBtn_user"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="formGroup1" style={{ position: "relative" }}>
              <label htmlFor="retype">Retype new password:</label>
              <div className="passwordInputContainer">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="retype"
                  value={formData.retype}
                  onChange={handleChange}
                  placeholder="Retype new password"
                  className="passwordInput"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="togglePasswordBtn_user"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="buttonGroup">
              <button type="cancel" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit">Submit Changes</button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="profilemodal">
          <div className="profilemodal-content">
            <p>
              Are you sure you want to cancel editing and head back to
              dashboard?
            </p>
            <div className="profilemodal-buttons">
              <button onClick={closeModal}>Close</button>
              <button onClick={handleConfirmCancel}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithAuth(Settings);
