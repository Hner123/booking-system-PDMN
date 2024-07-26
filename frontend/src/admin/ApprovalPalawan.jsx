import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';

const ApprovalPalawan = () => {
  const [rejectModal, setRejectModal] = useState(false);
  const [acceptModal, setAcceptModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [bookData, setBookData] = useState([]);

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`http://localhost:8800/api/book/`, {
          headers,
        });

        if (response.status === 200) {
          const filteredData = response.data.filter(
            (event) => event.roomName === "Palawan" && event.confirmation === false
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

  console.log(bookData)

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
    setRejectReason('');
  };

  const cancelApprove = () => {
    setAcceptModal(false);
  };

  const handleApprove = (booking) => {
    setSelectedBooking(booking);
    setAcceptModal(true);
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setRejectModal(true);
  };

  const handleRejectConfirm = () => {
    console.log('Reject Reason:', rejectReason);
    setRejectModal(false);
    setRejectReason('');
  };

  const handleReasonChange = (event) => {
    setRejectReason(event.target.value);
  };

  return (
    <div className='listCont1'>
      <h1>For Approval - PALAWAN ROOM</h1>
      <div className='approvalGroup'>
        {bookData
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
                  {booking.caps.reason && ` ${booking.caps.reason}`}
                  {booking.agenda && (
                    <>
                      <br />
                      Agenda: {booking.agenda}
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
              placeholder="Reason for rejecting"
              value={rejectReason}
              type='reject'
              onChange={handleReasonChange}
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
            <button type='approve'>Yes, approve</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalPalawan;
