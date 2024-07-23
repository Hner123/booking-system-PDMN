import React, { useState, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import "./EditProfile.css";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [email, setEmail] = useState("");
  const [newDepartment, setNewDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [showModal, setShowModal] = useState(false); // State to manage modal visibility
  const [isValidEmail, setIsValidEmail] = useState(false); // State to track valid email input
  const fullName = "Juan Dela Cruz";
  const userName = "Juan D.C.";
  const eMail = "juandelacruz69@gmail.com";
  const department = "Starlight"; // Assuming this is the current department
  const departments = [
    "Department A",
    "Department B",
    "Department C",
    "Department D",
  ];
  const navigate = useNavigate(); // Corrected: useNavigate is a function, so it should be called with ()

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Submitted values:", email, newDepartment, password);
    // Further logic for form submission (e.g., API calls)
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleCancel = () => {
    setShowModal(true); // Show modal when cancel button is clicked
  };

  const handleConfirmCancel = () => {
    // Handle logic when cancel is confirmed
    setShowModal(false); // Hide modal after handling cancel action
    navigate("/dashboard"); // Navigate to dashboard after confirmation
  };

  const closeModal = () => {
    setShowModal(false); // Close modal without any action
  };

  const validateEmail = (email) => {
    // Simple email validation logic (you can use a more robust library or regex)
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleEmailChange = (e) => {
    const inputValue = e.target.value;
    setEmail(inputValue);
    setIsValidEmail(validateEmail(inputValue));
  };

  return (
    <div>
      <div>
        <h1 style={{ margin: "1% 3%" }}>Edit Profile Account</h1>
      </div>
      <div className="area">
        <div className="upload">
          <div>
            <h2>{fullName}</h2>
            <h3>({userName})</h3>
          </div>
          <div>
            <h4>Department: {department}</h4>
            <h4>Email: {eMail}</h4>
          </div>
        </div>
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
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter your valid e-mail address"
              />
            </div>
            <div className="formGroup1">
              <label htmlFor="department">Change Department / Company:</label>
              <select
                id="department"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
              >
                <option value="">Select your designated department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="formGroup1" style={{ position: "relative" }}>
              <label htmlFor="password">Password:</label>
              <div className="passwordInputContainer">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="passwordInput" // Apply a custom class for styling
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="togglePasswordBtn_user" // Apply a custom class for styling
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

export default Settings;
