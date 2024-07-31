import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";
import WithAuth from "../../auth/WithAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import bcrypt from "bcryptjs";

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailEditable, setEmailEditable] = useState(false);
  const [passwordEditable, setPasswordEditable] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    department: "",
    currPass: "",
    passWord: "",
    retype: ""
  });
  const [disabled, setDisabled] = useState(false);
  const [disabled2, setDisabled2] = useState(false);

  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        };
        const response = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) {
          setUserData(response.data);
          setFormData({
            email: response.data.email,
            department: response.data.department
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [userId]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setDisabled(true);

    if (formData.email === userData.email) {
      toast.error("The new email is the same as the existing one.");
      setDisabled(false);
      return;
    }

    try {
      const validationResponse = await axios.post(
        `https://booking-system-ge1i.onrender.com/api/auth/validate`,
        { email: formData.email }
      );

      if (validationResponse.data.email.exists) {
        toast.error("This email is already registered.");
        setDisabled(false);
        return;
      }
    } catch (error) {
      toast.error("Failed to validate email.");
      setDisabled(false);
      return;
    }

    const sendEmail = {
      _id: userData._id,
      email: formData.email
    };

    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const updateResponse = await axios.post(
        `https://booking-system-ge1i.onrender.com/api/auth/changeemail`,
        sendEmail,
        { headers }
      );

      if (updateResponse.status === 201) {
        const { message, emailToken, emailId } = updateResponse.data;
        localStorage.setItem('resetToken', emailToken);
        localStorage.setItem('resetId', emailId);
        setEmailEditable(false);
        toast.success(message);
      }
    } catch (error) {
      toast.error("Error updating email.");
    } finally {
      setDisabled(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setDisabled2(true);

    try {
      const validationResponse = await axios.post(
        `https://booking-system-ge1i.onrender.com/api/auth/check`,
        { currPass: formData.currPass, hashedPassword: userData.passWord }
      );

      if (validationResponse.data.isMatch) {
        toast.error("Current password is incorrect.");
        setDisabled2(false);
        return;
      }

      if (!formData.passWord) {
        toast.error("New password cannot be empty.");
        setDisabled2(false);
        return;
      } else if (formData.currPass === formData.passWord) {
        toast.error("New password must be different from the current password.");
        setDisabled2(false);
        return;
      }

      if (formData.passWord !== formData.retype) {
        toast.error("New password does not match.");
        setDisabled2(false);
        return;
      }

    } catch (error) {
      toast.error("Failed to validate password.");
      setDisabled2(false);
      return;
    }

    const updatedUser = { passWord: formData.passWord };

    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      };

      const updateResponse = await axios.patch(
        `https://booking-system-ge1i.onrender.com/api/user/edit/${userId}`,
        updatedUser,
        { headers }
      );

      if (updateResponse.status === 201) {
        setUserData(updateResponse.data);
        setFormData({
          email: updateResponse.data.email,
          department: updateResponse.data.department,
          currPass: "",
          passWord: "",
          retype: ""
        });
        setPasswordEditable(false);
        toast.success("Password changed successfully.");
      }
    } catch (error) {
      toast.error("Failed to update password.");
    } finally {
      setDisabled2(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="">
      <ToastContainer />
      {/* <div>
        <h1>Edit Profile</h1>
      </div> */}
      <div className="area">
        <div>
          <h1>Edit Profile</h1>
        </div>
        {userData && (
          <div className="upload">
            <div className="profile-details">
              <p className="name"><strong>{`${userData.firstName} ${userData.surName}`}</strong> @{userData.userName}</p>
              {/* <h3>@{userData.userName}</h3> */}
              <p><strong>Department:</strong> {userData.department}</p>
              <p><strong>Email:</strong> {userData.email}</p>
            </div>
          </div>
        )}
        <div className="changeFields">
          <form onSubmit={handleEmailSubmit}>
            <div className="editdetails">
              <div className="formGroup1">
                <label htmlFor="email">Change Email Address:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your new email address"
                  disabled={!emailEditable}
                  required
                />
              </div>
              {emailEditable ? (
                <>
                  <button
                    type="submit"
                    disabled={disabled}
                    className={`save_email ${disabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
                  >
                    Verify Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmailEditable(false)}
                    className="edit_email"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setEmailEditable(true)}
                  className="edit_email"
                >
                  Edit
                </button>
              )}
            </div>
          </form>
          <form onSubmit={handlePasswordSubmit}>
            <div className="editdetails">
              <div className="formGroup1" style={{ position: "relative" }}>
                <label htmlFor="currPass">Current Password:</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="currPass"
                  name="currPass"
                  value={formData.currPass}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="passwordInput"
                  disabled={!passwordEditable}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="togglePassword"
                  style={{ position: "absolute", right: "10px", top: "50%" }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordEditable ? (
                <>
                  <button
                    type="submit"
                    disabled={disabled2}
                    className={`save_passworduser ${disabled2 ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700 text-white"}`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setPasswordEditable(false)}
                    className="edit_email"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setPasswordEditable(true)}
                  className="edit_passworduser"
                >
                  Edit
                </button>
              )}
            </div>
            {passwordEditable && (
              <div className="editdetails">
                <div className="formGroup1" style={{ position: "relative" }}>
                  <label htmlFor="password">New Password:</label>
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
                    onClick={() => setShowPassword(!showPassword)}
                    className="togglePassword"
                    style={{ position: "absolute", right: "10px", top: "50%" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}
            {passwordEditable && (
              <div className="editdetails">
                <div className="formGroup1" style={{ position: "relative" }}>
                  <label htmlFor="retype">Retype New Password:</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="retype"
                    name="retype"
                    value={formData.retype}
                    onChange={handleChange}
                    placeholder="Retype new password"
                    className="passwordInput"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="togglePassword"
                    style={{ position: "absolute", right: "10px", top: "50%" }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithAuth(Settings);

{/* <form>
            <div className="editdetails">
              <div className="formGroup1">
                <label htmlFor="department">
                  Change Department / Company:
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={!editingDepartment} // Disable if not editing
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
              {!editingDepartment ? (
                <button className="edit_userdept" onClick={handleEditDepartment}>
                  Edit
                </button>
              ) : (
                <button className="save_userdept" onClick={handleSaveDepartment}>
                  Save
                </button>
              )}
            </div>
          </form> */}