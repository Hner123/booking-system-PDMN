import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./EditProfile.css";
import WithAuth from "../../auth/WithAuth";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const API = import.meta.env.VITE_REACT_APP_API || "http://localhost:3001";

const EditProfile = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
  const [emailEditable, setEmailEditable] = useState(false);
  const [passwordEditable, setPasswordEditable] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    department: "",
    currPass: "",
    passWord: "",
    retype: "",
  });
  const [disabled, setDisabled] = useState(false);
  const [disabled2, setDisabled2] = useState(false);

  const cancelEmailEdit = () => {
    setEmailEditable(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      email: userData.email,
    }));
  };

  const cancelPassEdit = () => {
    setPasswordEditable(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      currPass: "",
      passWord: "",
      retype: "",
    }));
  };

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };
        const response = await axios.get(`${API}/api/user/${userId}`, {
          headers,
        });
        if (response.status === 200) {
          setUserData(response.data);
          setFormData({
            email: response.data.email || "",
            department: response.data.department || "",
            currPass: "",
            passWord: "",
            retype: "",
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
      const validationResponse = await axios.post(`${API}/api/auth/validate`, {
        email: formData.email,
      });

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
      email: formData.email,
    };

    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.post(
        `${API}/api/email/changeemail`,
        sendEmail,
        { headers }
      );

      if (updateResponse.status === 201) {
        const { message } = updateResponse.data;
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
      const validationResponse = await axios.post(`${API}/api/auth/check`, {
        currPass: formData.currPass,
        hashedPassword: userData.passWord,
      });

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
        toast.error(
          "New password must be different from the current password."
        );
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
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.patch(
        `${API}/api/user/edit/${userId}`,
        updatedUser,
        { headers }
      );

      if (updateResponse.status === 201) {
        setUserData(updateResponse.data);
        setFormData({
          email: response.data.email || "",
          department: response.data.department || "",
          currPass: "",
          passWord: "",
          retype: "",
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
      <div className="area">
        <div>
          <h1>Edit Profile</h1>
        </div>
        {userData && (
          <div className="upload">
            <div className="profile-details">
              <p className="name">
                <strong>{`${userData.firstName} ${userData.surName}`}</strong> @
                {userData.userName}
              </p>
              <p>
                <strong>Department:</strong> {userData.department}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
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
                  className="emailInput "
                />
              </div>
              {emailEditable ? (
                <>
                  <button
                    type="submit"
                    disabled={disabled}
                    className={`save_email ${
                      disabled
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Verify Email
                  </button>
                  <button
                    type="button"
                    onClick={cancelEmailEdit}
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
              {passwordEditable && (
                <p style={{ textAlign: "left", marginTop: "10px" }}>
                  <a href="/forgot-pass">Forgot password?</a>
                </p>
              )}
              {passwordEditable ? (
                <>
                  <button
                    type="submit"
                    disabled={disabled2}
                    className={`save_passworduser ${
                      disabled2
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelPassEdit}
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
                    type={showPassword2 ? "text" : "password"}
                    id="password"
                    name="passWord"
                    value={formData.passWord}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    className="passwordInput"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="togglePassword"
                    style={{ position: "absolute", right: "10px", top: "50%" }}
                  >
                    {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}
            {passwordEditable && (
              <div className="editdetails">
                <div className="formGroup1" style={{ position: "relative" }}>
                  <label htmlFor="retype">Retype New Password:</label>
                  <input
                    type={showPassword3 ? "text" : "password"}
                    id="retype"
                    name="retype"
                    value={formData.retype}
                    onChange={handleChange}
                    placeholder="Retype new password"
                    className="passwordInput"
                  />
                  <button
                    onClick={() => setShowPassword3(!showPassword3)}
                    className="togglePassword"
                    style={{ position: "absolute", right: "10px", top: "50%" }}
                  >
                    {showPassword3 ? <FaEyeSlash /> : <FaEye />}
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

export default WithAuth(EditProfile);
