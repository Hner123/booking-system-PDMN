import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import roomBg from "../../assets/palawan2.jpg";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import WithAuthReserve from "../../auth/WithAuthReserve";

const API = import.meta.env.VITE_REACT_APP_API || "http://localhost:3001";

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

        const response = await axios.get(`${API}/api/book/${reserveId}`, {
          headers,
        });
        if (response.status === 200) {
          setBookData(response.data);
          console.log("CHECK ITO:", response.data);
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

  const calculateReason = (booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const duration = (endTime - startTime) / (1000 * 60 * 60); // Duration in hours

    if (booking.roomName === "Palawan and Boracay") {
      if (duration > 1 && booking.caps.pax === "8-More") {
        return "Reservation is for more than 1 hour and requires both rooms.";
      } else if (duration > 1) {
        return "Reservation is for more than 1 hour.";
      } else if (booking.caps.pax === "8-More") {
        return "Reservation is for both rooms.";
      } else {
        return booking.caps.reason || "No specific reason provided.";
      }
    } else {
      if (duration > 1 && booking.caps.pax === "1-2") {
        return "Reservation is for more than 1 hour and only 1-2 attendees.";
      } else if (duration > 1) {
        return "Reservation is for more than 1 hour.";
      } else if (booking.caps.pax === "1-2") {
        return "Reservation is for only 1-2 attendees.";
      } else {
        return booking.caps.reason || "No specific reason provided.";
      }
    }
  };

  return (
    <div className="booking-confirmation">
      <ToastContainer />
      <div className="confirmation-text">
        {bookData && isConfirmed ? (
          <>
            <h1 style={{ color: "green" }}>
              Your {bookData.roomName} Room reservation has been confirmed!
            </h1>
            <p>
              Great news! Your booking for the {bookData.roomName} room is
              officially confirmed. Your reservation is now secured, and you can
              look forward to your upcoming event. Feel free to view the details
              of your meeting or return to the dashboard.
            </p>
          </>
        ) : (
          <>
            <h1 style={{ color: "red" }}>
              Your {bookData.roomName} Room reservation is still pending.
            </h1>
            <p>
              Your booking for the {bookData.roomName} room is currently
              awaiting confirmation. We are processing your reservation and will
              notify you once it is confirmed. In the meantime, you can view the
              details of your meeting or go back to the dashboard.
            </p>
          </>
        )}

        <div className="buttons">
          <button className="details-btn" onClick={handleViewDetails}>
            View Details
          </button>
          <button className="dashboard-btn" onClick={handleReturnToDashboard}>
            Submit and Return
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
                    {bookData.attendees && bookData.attendees.length > 0 && (
                      <p>
                        <strong>Attendees:</strong>{" "}
                        {bookData.attendees.join(", ")}
                      </p>
                    )}
                    {bookData.guest && bookData.guest.length > 0 && (
                      <p>
                        <strong>Guests:</strong> {bookData.guest.join(", ")}
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
                    {!bookData.confirmation && (
                      <p>
                        <strong>Reason: </strong> {calculateReason(bookData)}
                      </p>
                    )}
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

export default WithAuthReserve(BookingConfirmation);
