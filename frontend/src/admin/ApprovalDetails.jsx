import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AdminPages.css';
import { toast } from 'react-toastify';
import WithAuthAdmin from '../auth/WithAuthAdmin';

const ApprovalDetails = ({ sidebarOpen }) => {
  const { roomName } = useParams();
  const [bookings, setBookings] = useState([]);
  const [rejectModal, setRejectModal] = useState(false);
  const [acceptModal, setAcceptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    approval: {
      archive: false,
      status: "",
      reason: "",
    },
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`https://pdmnnewshub.ddns.net:8800/api/book/`, { headers });

        if (response.status === 200) {
          const filteredData = response.data.filter(
            (booking) => booking.roomName === roomName && booking.confirmation === false && booking.approval.archive === false
          );
          setBookings(filteredData);
        } else {
          console.error("Response status is not OK");
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
      }
    };

    fetchBookings();
  }, [roomName]);

  const calculateReason = (booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const duration = (endTime - startTime) / (1000 * 60 * 60); // Duration in hours

    if (roomName === "Palawan and Boracay") {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      approval: {
        ...prevFormData.approval,
        [name]: value,
      },
    }));
  };

  const cancelReject = () => {
    setRejectModal(false);
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setRejectModal(true);
  };

  const cancelApprove = () => {
    setAcceptModal(false);
  };

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setAcceptModal(true);
  };

  const handleApproveConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updatedReserve = {
        ...selectedBooking,
        confirmation: true,
        approval: {
          archive: true,
          status: "Approved",
          reason: "",
        },
      };

      const updateResponse = await axios.patch(
        `https://pdmnnewshub.ddns.net:8800/api/book/edit/${selectedBooking._id}`,
        updatedReserve,
        { headers }
      );

      if (updateResponse.status === 200) {
        try {
          const token = localStorage.getItem("adminToken");
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const emailData = {
            _id: selectedBooking._id,
            email: selectedBooking.user.email
          };

          const emailResponse = await axios.post(
            `https://pdmnnewshub.ddns.net:8800/api/email/approval`,
            emailData,
            { headers }
          );

          if (emailResponse.status === 201) {
            const date = new Date(updateResponse.data.scheduleDate).toLocaleDateString();
            const messageContent = `Your reservation <strong>${updateResponse.data.title}</strong> on <strong>${date}</strong> has been approved`;
            const notifData = {
              booking: updateResponse.data._id,
              message: messageContent,
              sender: "66861570dd3fc08ab2a6557d",
              senderType: "admin",
              receiver: updateResponse.data.user._id,
              receiverType: "user",
              createdAt: new Date().toISOString(),
            };
            
            try {
              const token = localStorage.getItem("adminToken");
              const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              };

              const notifResponse = await axios.post(
                `https://pdmnnewshub.ddns.net:8800/api/notif/new`,
                notifData,
                { headers }
              );

              if (notifResponse.status === 201) {
                try {
                  const token = localStorage.getItem("adminToken");
                  const headers = {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  };

                  const inviteResponse = await axios.post(
                    `https://pdmnnewshub.ddns.net:8800/api/email/invite/${selectedBooking._id}`,
                    {},
                    { headers }
                  );

                  if (inviteResponse.status === 201) {
                    setBookings(bookings.filter(booking => booking._id !== selectedBooking._id));
                    setAcceptModal(false);
                  }

                } catch (error) {
                  // console.error("Error sending invites:", error);
                  toast.error("Unexpected error occured. Please try again later.");
                  setAcceptModal(false);
                }
              }
            } catch (error) {
              toast.error("Error updating information. Please try again later.");
              setAcceptModal(false);
            }
          }
        } catch (error) {
          toast.error(error.message);
          setAcceptModal(false);
        }
      }
    } catch (error) {
      toast.error(error.message);
      setAcceptModal(false);
    } finally {
      setAcceptModal(false);
      setLoading(false);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.approval.reason) {
      toast.error("Please state your reason.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updatedReserve = {
        ...selectedBooking,
        confirmation: false,
        approval: {
          archive: true,
          status: "Declined",
          reason: formData.approval.reason,
        },
      };

      const updateResponse = await axios.patch(
        `https://pdmnnewshub.ddns.net:8800/api/book/edit/${selectedBooking._id}`,
        updatedReserve,
        { headers }
      );

      if (updateResponse.status === 200) {
        try {
          const token = localStorage.getItem("adminToken");
          const headers = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

          const emailData = {
            _id: selectedBooking._id,
            email: selectedBooking.user.email
          };

          const emailResponse = await axios.post(
            `https://pdmnnewshub.ddns.net:8800/api/email/approval`,
            emailData,
            { headers }
          );

          if (emailResponse.status === 201) {
            const date = new Date(updateResponse.data.user.scheduleDate).toLocaleDateString();
            const messageContent = `Your reservation ${updateResponse.data.title} on ${date} has been rejected`;
            const notifData = {
              booking: updateResponse.data._id,
              message: messageContent,
              sender: "66861570dd3fc08ab2a6557d",
              senderType: "admin",
              receiver: updateResponse.data.user._id,
              receiverType: "user",
              createdAt: new Date().toISOString(),
            };

            try {
              const token = localStorage.getItem("adminToken");
              const headers = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              };

              const notifResponse = await axios.post(
                `https://pdmnnewshub.ddns.net:8800/api/notif/new`,
                notifData,
                { headers }
              );

              if (notifResponse.status === 201) {
                setBookings(bookings.filter(booking => booking._id !== selectedBooking._id));
                setFormData({
                  approval: {
                    archive: false,
                    status: "",
                    reason: "",
                  },
                });
                setRejectModal(false);
              }
            } catch (error) {
              toast.error("Error updating information. Please try again later.");
              setRejectModal(false);
            }
          }
        } catch (error) {
          toast.error(error.message);
          setRejectModal(false);
        }
      }
    } catch (error) {
      toast.error(error.message);
      setRejectModal(false);
    } finally {
      setRejectModal(false);
      setLoading(false);
    }
  };

  return (
    <div
      className={`reason-room-page ${sidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
    >
      <Sidebar sidebarOpen={sidebarOpen} />

      <h1 style={{ marginBottom: '0' }}>{roomName} Approval Page</h1>
      <p style={{ margin: '0' }} className='note'><strong>Note: </strong>Bookings are sorted by priority, with the earliest booking displayed first, from left to right.</p>
      <div className="reason-room-content">
        {bookings.length === 0 ? (
          <p>No pending approvals.</p>
        ) : (
          bookings.map((booking) => (
            <div key={booking._id} className="booking-details">
              <h2>{booking.title}</h2>
              <p>
                <strong>Date:{" "}</strong>
                {new Date(booking.startTime).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
              </p>
              <p>
                <strong>Time:{" "}</strong>

                {new Date(booking.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}

                {new Date(booking.endTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
              <strong>Reserved By: </strong>{booking.user ? `${booking.user.firstName} ${booking.user.surName}` : "Unknown"}
              </p>
              {booking.attendees && booking.attendees.length > 0 && (
                <p><strong>Members: </strong>{booking.attendees.join(", ")}</p>
              )}
              {booking.guest && booking.guest.length > 0 && (
                <p>Guests: {booking.guest.join(", ")}</p>
              )}
              <hr />
              <p>
                <strong>Reason for Pending Status:</strong>{" "}
                {calculateReason(booking)}
                {booking.caps.reason && (
                  <>
                    <br />
                    <strong>Additional Reason:</strong> {booking.caps.reason}.
                  </>
                )}
                {/* {booking.agenda && (
                  <>
                    <br />
                    Agenda: {booking.agenda}.
                  </>
                )} */}
              </p>
              <div className="approval-actions">
                <button onClick={() => handleApprove(booking)} disabled={loading}>Approve</button>
                <button onClick={() => handleReject(booking)}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
      {acceptModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Approve Booking</h2>
            <p>Are you sure you want to approve this booking?</p>
            <div className="modal-actions">
              <button onClick={handleApproveConfirm} disabled={loading}>{loading ? "Please Wait..." : "Yes"}</button>
              <button onClick={cancelApprove}>No</button>
            </div>
          </div>
        </div>
      )}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Reject Booking</h2>
            <p>Are you sure you want to reject this booking?</p>
            <textarea
              name="reason"
              value={formData.approval.reason}
              onChange={handleChange}
              placeholder="Enter reason for rejection"
            />
            <div className="modal-actions">
              <button onClick={handleRejectConfirm}>{loading ? "Please Wait..." : "Submit"}</button>
              <button onClick={cancelReject}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithAuthAdmin(ApprovalDetails);
