import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import roomBg from "../../assets/palawan2.jpg";
import axios from "axios";
import { ToastContainer } from "react-toastify";


const BookingConfirmation = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState({
    room: "Meeting Room",
  });
  const navigate = useNavigate();

  const [bookData, setBookData] = useState("");

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const reserveId = localStorage.getItem("reserveToken");
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `https://booking-system-ge1i.onrender.com/api/book/${reserveId}`,
          { headers }
        );
        if (response.status === 200) {
          setBookData(response.data);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, []);

  const handleViewDetails = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleReturnToDashboard = () => {
    localStorage.removeItem("reserveToken");
    navigate("/dashboard");
  };

  const isConfirmed = bookData.confirmation === true;

  return (
    <div className="booking-confirmation">
      <ToastContainer />
      <div className="confirmation-text">
        {bookData && isConfirmed ? (
          <>
            <h1>
              Your {bookData.roomName} Room reservation has been confirmed.
            </h1>
            <p>
              Your booking for the dedicated room has been successfully
              confirmed. You can now rest assured that your reservation is
              locked in and ready for your upcoming event. You can view the
              details of your meeting, or head back to the dashboard.
            </p>
          </>
        ) : (
          <>
            <h1>
              Your {bookData.roomName} Room reservation has yet to be confirmed.
            </h1>
            <p>
              Your booking for the dedicated room has been successfully
              confirmed. You can now rest assured that your reservation is
              locked in and ready for your upcoming event. You can view the
              details of your meeting, or head back to the dashboard.
            </p>
          </>
        )}
        <div className="buttons">
          <button className="details-btn" onClick={handleViewDetails}>
            View Details
          </button>
          <button className="dashboard-btn" onClick={handleReturnToDashboard}>
            Return to Dashboard
          </button>
        </div>
      </div>
      <div className="confirmation-image">
        <div className="confirmation-overlay"></div>
        <img src={roomBg} alt="Room" />
      </div>

      {showModal && (
        <div className="details-modal">
          <div className="details-content">
            {bookData && (
              <>
                <h2>{bookData.title}</h2>
                <div className="modal-columns">
                  <div className="left-content">
                    <p>
                      <strong>Username:</strong> {bookData.user.userName}
                    </p>
                    <p>
                      <strong>Department:</strong> {bookData.user.department}
                    </p>
                    <p>
                      <strong>Number of PAX:</strong> {bookData.caps.pax}
                    </p>
                    {bookData.attendees &&
                      bookData.attendees.length > 0 && (
                        <p>
                          <strong>Attendees:</strong>{" "}
                          {bookData.attendees.join(", ")}
                        </p>
                      )}
                    {bookData.guest &&
                      bookData.guest.length > 0 && (
                        <p>
                          <strong>Guests:</strong>{" "}
                          {bookData.guest.join(", ")}
                        </p>
                      )}
                  </div>
                  <div className="right-content">
                    <h3>{bookData.roomName}</h3>
                    <p>
                      <strong>Date: </strong>{" "}
                      {new Date(bookData.scheduleDate).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Meeting Start: </strong>{" "}
                      {new Date(bookData.startTime).toLocaleTimeString()}
                    </p>
                    <p>
                      <strong>Meeting End: </strong>{" "}
                      {new Date(bookData.endTime).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </>
            )}

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
