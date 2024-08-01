import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import WithAuthAdmin from '../auth/WithAuthAdmin';

const ApprovalBoracay = () => {
  const [rejectModal, setRejectModal] = useState(false);
  const [acceptModal, setAcceptModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [formData, setFormData] = useState({
    approval: {
      archive: false,
      status: "",
      reason: "",
    },
  });

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

  const [bookData, setBookData] = useState([]);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`https://booking-system-ge1i.onrender.com/api/book/`, {
          headers,
        });

        if (response.status === 200) {
          const filteredData = response.data.filter(
            (event) => event.roomName === "Boracay" && event.confirmation === false && event.approval.archive === false
          );
          setBookData(filteredData);
        } else {
          console.error("origData or roomName is not available");
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, []);

  const calculateReason = (booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const duration = (endTime - startTime) / (1000 * 60 * 60); // Duration in hours

    if (duration > 1 && booking.caps.pax === "1-2") {
      return "Reservation is for more than 1 hour and only 1-2 people.";
    } else if (duration > 1) {
      return "Reservation is for more than 1 hour.";
    } else if (booking.caps.pax === "1-2") {
      return "Reservation is for only 1-2 people.";
    } else {
      return booking.reason || "No specific reason provided.";
    }
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

    const updatedReserve = {
      ...selectedBooking,
      confirmation: true,
      approval: {
        archive: true,
        status: "Approved",
        reason: "",
      },
    };

    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.patch(
        `https://booking-system-ge1i.onrender.com/api/book/edit/${selectedBooking._id}`,
        updatedReserve,
        { headers }
      );

      if (updateResponse.status === 200) {
        try {
          const emailData = {
            _id: selectedBooking._id,
            email: selectedBooking.user.email
          };

          const emailResponse = await axios.post(
            `https://booking-system-ge1i.onrender.com/api/auth/approval`,
            emailData,
            { headers }
          );

          if (emailResponse.status === 201) {
            const date = new Date(updateResponse.data.user.scheduleDate).toLocaleDateString();
            const messageContent = `Your reservation ${updateResponse.data.title} on ${date} has been approved`
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

              const notifResponse = await axios.post(
                `https://booking-system-ge1i.onrender.com/api/notif/new`,
                notifData,
                { headers }
              );

              if (notifResponse.status === 201) {
                const { message } = emailResponse.data;
                setBookData(emailResponse.data)
                toast.success(message);
                setAcceptModal(false);
              }
            } catch (error) {
              toast.error("Error updating information. Please try again later.");
            }
          }
        } catch (error) {
          console.error("Error details:", error.response ? error.response.data : error.message);
          toast.error(error);
        }
      }
    } catch (error) {
      console.error("Error details:", error.response ? error.response.data : error.message);
      toast.error(error);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();

    if (!formData.approval.reason) {
      toast.error("Please state your reason.");
      return;
    }

    const updatedReserve = {
      ...selectedBooking,
      confirmation: false,
      approval: {
        archive: true,
        status: "Declined",
        reason: formData.approval.reason,
      },
    };

    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.patch(
        `https://booking-system-ge1i.onrender.com/api/book/edit/${selectedBooking._id}`,
        updatedReserve,
        { headers }
      );

      if (updateResponse.status === 200) {
        try {
          const emailData = {
            _id: selectedBooking._id,
            email: selectedBooking.user.email
          };

          const emailResponse = await axios.post(
            `https://booking-system-ge1i.onrender.com/api/auth/approval`,
            emailData,
            { headers }
          );

          if (emailResponse.status === 201) {
            const date = new Date(updateResponse.data.user.scheduleDate).toLocaleDateString();
            const messageContent = `Your reservation ${updateResponse.data.title} on ${date} has been rejected`
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

              const notifResponse = await axios.post(
                `https://booking-system-ge1i.onrender.com/api/notif/new`,
                notifData,
                { headers }
              );

              if (notifResponse.status === 201) {
                const { message } = emailResponse.data;
                setBookData(emailResponse.data)
                setFormData(() => ({
                  ...emailResponse.data,
                  approval: {
                    reason: ""
                  }
                }));
                toast.success(message);
                setRejectModal(false);
              }
            } catch (error) {
              toast.error("Error updating information. Please try again later.");
            }
          }
        } catch (error) {
          toast.error(error);
        }
      }
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <div className='listCont1'>
      <ToastContainer />
      <h1>For Approval - BORACAY ROOM</h1>
      <div className='approvalGroup'>
        {Array.isArray(bookData) &&
          bookData
            .filter(
              (book) =>
                book.title &&
                book.scheduleDate !== null &&
                book.startTime !== null
            )
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime)) // Sorting by startTime from earliest to latest
            .map((booking, index) => (
              <div className='approvalMeets' key={index}>
                <div className='approvalDeets'>
                  <h2>Meeting With Client</h2>
                  <p>Title: {booking.title}</p>
                  <p>Date and Time: {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p>
                  <p>Reserved By: {booking.user.firstName} {booking.user.surName}</p>
                  {booking.attendees && booking.attendees.length > 0 && (
                    <p>Members: {booking.attendees.join(', ')}</p>
                  )}
                  {booking.guest && booking.guest.length > 0 && (
                    <p>Guests: {booking.guest.join(', ')}</p>
                  )}
                  <hr />
                  <p>
                    Reason: {calculateReason(booking)}
                    {booking.caps.reason && ` ${booking.caps.reason}.`}
                    {booking.agenda && (
                      <>
                        <br />
                        Agenda: {booking.agenda}.
                      </>
                    )}
                  </p>
                  <div className='approvalGrp'>
                    <button type='not-appr' onClick={() => handleReject(booking)}>Reject</button>
                    <button type='appr' onClick={() => handleApprove(booking)}>Approve</button>
                  </div>
                </div>
              </div>
            ))}
      </div>

      {rejectModal && (
        <div className='gen_modal'>
          <div className='gen_modal-content'>
            <p>Are you sure you want to reject the meeting?</p>
            <input
              id='reason'
              name='reason'
              placeholder="Reason for rejecting"
              value={formData.approval.reason}
              type='text'
              onChange={handleChange}
              required
            />
            <button type='cancel' onClick={cancelReject}>Cancel</button>
            <button type='reject' onClick={handleRejectConfirm}>Yes, reject</button>
          </div>
        </div>
      )}

      {acceptModal && (
        <div className='gen_modal'>
          <div className='gen_modal-content'>
            <p>Are you sure you want to approve the meeting?</p>
            <button type='cancel' onClick={cancelApprove}>Cancel</button>
            <button type='approve' onClick={handleApproveConfirm}>Yes, approve</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithAuthAdmin(ApprovalBoracay);
