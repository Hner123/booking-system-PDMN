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
  const [showModal, setShowModal] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false); // State for password edit mode
  const [userData, setUserData] = useState(null); // Initialize as null to indicate loading

  const userId = localStorage.getItem("userId");
  const [disabled, setDisabled] = useState(false);
  const [disabled2, setDisabled2] = useState(false);
  const [emailEditable, setEmailEditable] = useState(false);
  const [passwordEditable, setPasswordEditable] = useState(false);

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
          setUserData(response.data);
          setFormData({
            email: response.data.email,
            department: response.data.department,
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
    retype: "",
  });

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setDisabled(true);

    if (formData.email === userData.email) {
      toast.error("Email is the same as existing")
      setDisabled(false);
      return;
    }

    try {
      const validationResponse = await axios.post(
        `http://localhost:8800/api/auth/validate`,
        { email: formData.email }
      );

      if (validationResponse.data.email.exists) {
        toast.error("Email is already registered.");
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
    }

    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.post(
        `http://localhost:8800/api/auth/changeemail`,
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
      toast.error(error);
    } finally {
      setDisabled(false);
    }
  };

  const toggleEmailEdit = () => {
    setEmailEditable(true);
  };

  const togglePasswordEdit = () => {
    setPasswordEditable(true);
  };

  const cancelEmailEdit = () => {
    setEmailEditable(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      email: userData.email,
    }));
  };

  const cancelPasswordEdit = () => {
    setPasswordEditable(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      currPass: "",
      passWord: "",
      retype: ""
    }));
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setDisabled2(true);

    try {
      const isCurrentPasswordCorrect = await bcrypt.compare(
        formData.currPass,
        userData.passWord
      );

      if (!isCurrentPasswordCorrect) {
        toast.error("Current password is incorrect.");
        setDisabled2(false);
        return;
      }

      if(!formData.passWord){
        toast.error("New password must have value");
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

    const updatedUser = {};

    if (formData.passWord) {
      updatedUser.passWord = formData.passWord;
    }

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
        setUserData(updateResponse.data)
        setFormData(() => ({
          ...updateResponse.data,
          currPass: "",
          passWord: "",
          retype: ""
        }));
        setPasswordEditable(false);
        toast.success("Successfully changed password.");
        
      }
    } catch (error) {
      console.error("Error during patch:", error);
      toast.error("Failed to update user info.");
    } finally {
      setDisabled2(false)
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  return (
    <div>
      <ToastContainer />
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
              <div>
                <h4>
                  Department: <br />
                  {userData.department}
                </h4>
                <h4>
                  Email:
                  <br /> {userData.email}
                </h4>
              </div>
            </div>
          </>
        )}
        <div className="changeFields">
          <form onSubmit={handleSubmitEmail}>
            <div className="editdetails">
              <div className="formGroup1">
                <label htmlFor="email">
                  Change E-mail Address:
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  required
                  onChange={handleChange}
                  placeholder="Enter your valid e-mail address"
                  disabled={!emailEditable}
                />

              </div>
              {emailEditable ? (
                <>
                  <button
                    type="submit"
                    disabled={disabled}
                    className={` save_email ${disabled
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
                <button className="edit_email" onClick={toggleEmailEdit}>
                  Edit
                </button>
              )}
            </div>
          </form>
          <form onSubmit={handleSubmitPassword}>
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
                  disabled={!passwordEditable} // Disable if not editing
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="togglePasswordBtn_user"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {passwordEditable ? (

                <>
                  <button
                    type="submit"
                    disabled={disabled2}
                    className={` save_passworduser ${disabled2
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-700 text-white"
                      }`}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelPasswordEdit}
                    className="edit_email"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button className="edit_passworduser" onClick={togglePasswordEdit}>
                  Edit
                </button>
              )}
            </div>
            {passwordEditable && ( 
              <div className="editdetails">
                <div className="formGroup1">
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
                </div>
              </div>
            )}
            {passwordEditable && ( 
              <div className="editdetails">
                <div className="formGroup1">
                  <label htmlFor="retype">Retype new password:</label>
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
                    style={{ display: 'none' }}
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="togglePasswordBtn_user"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* {showModal && (
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
      )} */}
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