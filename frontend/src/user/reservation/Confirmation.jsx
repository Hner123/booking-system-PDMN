import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BookingConfirmation = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState({ room: 'Meeting Room' }); // Example state for selected meeting
  const navigate = useNavigate();

  const handleViewDetails = () => {
    setShowModal(true); // Show the modal when "View Details" is clicked
  };

  const handleCloseModal = () => {
    setShowModal(false); // Close the modal when "Close" button is clicked
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard'); // Navigate to dashboard
  };

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        handleReturnToDashboard();
      }, 5000); // Close modal after 10 seconds

      return () => clearTimeout(timer); // Cleanup timer if modal is closed early
    }
  }, [showModal]);

  return (
    <div className="booking-confirmation">
      <div className="confirmation-text">
        <h1>Your Palawan Room reservation has been confirmed.</h1>
        <p>Your booking for the dedicated room has been successfully confirmed. You can now rest assured that your reservation is locked in and ready for your upcoming event. You can view the details of your meeting, or head back to the dashboard.</p>
        <div className="buttons">
          <button className="details-btn" onClick={handleViewDetails}>View Details</button>
          <button className="dashboard-btn" onClick={handleReturnToDashboard}>Return to Dashboard</button>
        </div>
      </div>
      <div className="confirmation-image">
        <div className="confirmation-overlay"></div>
        <img src="path/to/your/image.jpg" alt="Room" />
      </div>

      {showModal && (
        <div className="details-modal">
          <div className="details-content">
            <h2>MEETING TITLE</h2>
            <div className="modal-columns">
              <div className="left-content">
                <p><strong>Username:</strong> </p>
                <p><strong>Department:</strong></p>
                <p><strong>Number of PAX:</strong></p>
                <p><strong>Attendees:</strong> </p>
                <p><strong>Purpose of the Meeting:</strong> </p>
                <p className="members"><strong>Members:</strong> </p>
              </div>
              <div className="right-content">
                <h3>{selectedMeeting.room}</h3>
                <p><strong>Date:</strong></p>
                <p><strong>Meeting Start:</strong></p>
                <p><strong>Meeting End:</strong></p>
              </div>
            </div>
            <button className="close-btn" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingConfirmation;
