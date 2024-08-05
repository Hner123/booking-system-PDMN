import React, { useState, useEffect, useRef } from "react";
import Autosuggest from "react-autosuggest";
import { useNavigate } from "react-router-dom";
import roomBg from "../../assets/palawan.jpg";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import WithAuthReserve from "../../auth/WithAuthReserve";

const ReservationFormsDetails = () => {
  const formRef = useRef();
  const [pax, setPax] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [bookData, setBookData] = useState("");
  const [userData, setUserData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showGuestInput, setShowGuestInput] = useState(false);
  const [guestNames, setGuestNames] = useState("");
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    caps: {
      pax: "",
      reason: "",
    },
    attendees: [],
    title: "",
    guest: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "reason") {
      setFormData({
        ...formData,
        caps: {
          ...formData.caps,
          reason: value,
        },
      });
    } else if (name === "guestNames") {
      setGuestNames(value);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Move fetchUserData function outside of useEffect
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const response = await axios.get(
        `https://booking-system-ge1i.onrender.com/api/user/`,
        {
          headers,
        }
      );
      if (response.status === 200) {
        const users = response.data.filter(
          (user) => user._id !== bookData.user._id
        );
        const usersWithDisabled = users.map((user) => ({
          ...user,
          disabled: false,
        }));
        setUserData(usersWithDisabled);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handlePaxChange = (event) => {
    const { value } = event.target;
    setPax(value);
    setFormData({
      ...formData,
      caps: {
        ...formData.caps,
        pax: value,
        reason: "",
      },
    });

    if (value === "1-2" || value === "3-More" || value === "8-More") {
      setAttendees([]);
      setAttendeeInput("");
      setSuggestions([]);
      fetchUserData(); // Now this can be called here
    }
  };

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
          setSelectedRoom(response.data.roomName);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, []);

  useEffect(() => {
    if (bookData) {
      fetchUserData(); // Fetch user data whenever bookData changes
    }
  }, [bookData]);

  const getSuggestions = (value) => {
    if (!value) return [];

    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0
      ? []
      : userData.filter(
          (user) =>
            (
              user.firstName.toLowerCase() +
              " " +
              user.surName.toLowerCase()
            ).includes(inputValue) && !user.disabled
        );
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) =>
    suggestion.firstName + " " + suggestion.surName;

  const renderSuggestion = (suggestion) => (
    <div className="suggestion-chip">
      {suggestion.firstName + " " + suggestion.surName}
    </div>
  );

  const onAttendeeInputChange = (event, { newValue }) => {
    setAttendeeInput(newValue);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    const updatedAttendees = [
      ...attendees,
      suggestion.firstName + " " + suggestion.surName,
    ];
    setAttendees(updatedAttendees);

    setFormData({
      ...formData,
      attendees: updatedAttendees,
    });

    setUserData(
      userData.map((user) =>
        user._id === suggestion._id ? { ...user, disabled: true } : user
      )
    );

    setAttendeeInput("");
  };

  const removeAttendee = (index) => {
    const removedAttendee = attendees[index];
    setAttendees(attendees.filter((_, i) => i !== index));

    setUserData(
      userData.map((user) =>
        user.firstName + " " + user.surName === removedAttendee
          ? { ...user, disabled: false }
          : user
      )
    );
  };

  const inputProps = {
    placeholder: "Type attendee names",
    value: attendeeInput || "",
    onChange: onAttendeeInputChange,
    style: { width: "100%" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.caps.pax === "") {
      toast.error("Please select number of attendees");
      return;
    }

    const additionalAttendees = guestNames
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name);

    const confirmationStatus =
      bookData.confirmation === false && formData.caps.pax === "3-More"
        ? false
        : bookData.confirmation === true && formData.caps.pax === "1-2"
        ? false
        : bookData.confirmation === true && formData.caps.pax === "3-More"
        ? true
        : false;

    const approvalStatus =
      bookData.confirmation === false && formData.caps.pax === "3-More"
        ? "Pending"
        : bookData.confirmation === true && formData.caps.pax === "1-2"
        ? "Pending"
        : bookData.confirmation === true && formData.caps.pax === "3-More"
        ? "Approved"
        : "Pending";

    const updatedReserve = {
      caps: {
        pax: formData.caps.pax,
        reason: formData.caps.reason,
      },
      attendees: formData.attendees,
      guest: additionalAttendees,
      title: formData.title,
      confirmation: confirmationStatus,
      approval: {
        archive: false,
        status: approvalStatus,
        reason: "",
      },
    };

    const totalAttendees = attendees.length + additionalAttendees.length;

    if (selectedRoom === "Palawan and Boracay" && totalAttendees < 7) {
      toast.error(
        "For 'Palawan and Boracay', you must have at least 8 attendees."
      );
      return;
    }

    if (
      formData.caps.pax === "3-More" &&
      (totalAttendees < 2 || totalAttendees > 7)
    ) {
      toast.error("You must have between 3 and 7 people accompanying you.");
      return;
    }

    if (formData.caps.pax === "1-2" && totalAttendees !== 1) {
      toast.error("You must have exactly 1 person accompanying you.");
      return;
    }

    try {
      const reserveId = localStorage.getItem("reserveToken");
      const token = localStorage.getItem("authToken");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.patch(
        `https://booking-system-ge1i.onrender.com/api/book/edit/${reserveId}`,
        updatedReserve,
        { headers }
      );

      if (updateResponse.status === 200) {
        if (updatedReserve.confirmation) {
          toast.success("Successfully updated information.");
          navigate("/confirmation");
        } else {
          const messageContent = `A new reservation titled '${updateResponse.data.title}' by ${updateResponse.data.user.firstName} ${updateResponse.data.user.surName} for the ${updateResponse.data.roomName} room needs approval.`;
          const notifData = {
            booking: updateResponse.data._id,
            message: messageContent,
            sender: updateResponse.data.user._id,
            senderType: "user",
            receiver: "66861570dd3fc08ab2a6557d",
            receiverType: "admin",
          };

          try {
            const notifResponse = await axios.post(
              `https://booking-system-ge1i.onrender.com/api/notif/new`,
              notifData,
              { headers }
            );

            if (notifResponse.status === 201) {
              toast.success("Successfully updated information.");
              navigate("/confirmation");
            }
          } catch (error) {
            console.log(error);
            toast.error("Error updating information. Please try again later.");
          }
        }
      } else {
        toast.error("An error occurred while updating the reservation.");
      }
    } catch (error) {
      toast.error("An error occurred while updating the reservation.");
    }
  };

  const handleCancelTime = () => {
    setShowDiscardModal(true);
  };

  const handleConfirmDiscard = async (e) => {
    setShowDiscardModal(false);

    try {
      const reserveId = localStorage.getItem("reserveToken");
      const token = localStorage.getItem("authToken");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.delete(
        `https://booking-system-ge1i.onrender.com/api/book/delete/${reserveId}`,
        { headers }
      );

      if (updateResponse.status === 200) {
        localStorage.removeItem("reserveToken");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error during delete:", error);
    }
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  return (
    <div className="form-page">
      <ToastContainer />
      <main>
        <h1>Booking Details</h1>
        <div className="reservation-details-container">
          <div className="form-column">
            <div className="form-title">
              <h2>Reservation Details</h2>
              <p>
                Please enter the correct information and check the details
                before confirming your booking.
              </p>
            </div>

            <form
              className="reservation-form"
              ref={formRef}
              onSubmit={handleSubmit}
            >
              <div>
                <div className="read-only-group ">
                    <button className="read-only-btn">Book for me</button>
                    <button className="read-only-btn">Book for someoneelse</button>
                </div>
              </div>
              <div className="read-only-group">
                <div style={{ flex: 1 }}>
                  <label htmlFor="name">Username:</label>
                  {bookData && (
                    <div id="name" className="read-only">
                      {bookData.user.userName}
                    </div>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="department">Department:</label>
                  {bookData && (
                    <div id="department" className="read-only">
                      {bookData.user.department}
                    </div>
                  )}
                </div>
              </div>
              <div className="m-title">
                <label htmlFor="title">Meeting Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter meeting title"
                  required
                />
              </div>
              <div>
                <div className="pax">
                  <label htmlFor="pax">Number of Pax *</label>
                  <p className="note">
                    The count includes the person making the booking.
                  </p>
                </div>
                <div className="radio-group" style={{ display: "flex" }}>
                  <div className="radio-option half-width">
                    <input
                      type="radio"
                      id="pax-1-2"
                      name="pax"
                      value="1-2"
                      checked={formData.caps.pax === "1-2"}
                      onChange={handlePaxChange}
                      disabled={
                        selectedRoom !== "Boracay" && selectedRoom !== "Palawan"
                      }
                      style={{ width: "auto", marginRight: "10px" }}
                    />
                    <label htmlFor="pax-1-2">1-2 attendees</label>
                  </div>
                  <div className="radio-option half-width">
                    <input
                      type="radio"
                      id="pax-3-more"
                      name="pax"
                      value="3-More"
                      checked={formData.caps.pax === "3-More"}
                      onChange={handlePaxChange}
                      disabled={
                        selectedRoom !== "Boracay" && selectedRoom !== "Palawan"
                      }
                      style={{ width: "auto", marginRight: "10px" }}
                    />
                    <label htmlFor="pax-3-more">3 - 8 attendees</label>
                  </div>
                  {selectedRoom === "Palawan and Boracay" && (
                    <div className="radio-option half-width">
                      <input
                        type="radio"
                        id="pax-8-more"
                        name="pax"
                        value="8-More"
                        checked={formData.caps.pax === "8-More"}
                        onChange={handlePaxChange}
                        style={{ width: "auto" }}
                        required
                      />
                      <label htmlFor="pax-8-more">8 or more attendees</label>
                    </div>
                  )}
                </div>
              </div>

              {pax === "1-2" && (
                <div>
                  <label htmlFor="reason">Reason for 1-2 attendees</label>
                  <p className="note">
                    Please provide a reason to justify reserving the meeting
                    room for a small group.
                  </p>
                  <input
                    type="text"
                    id="reason"
                    name="reason"
                    value={formData.caps.reason}
                    onChange={handleChange}
                    placeholder="Enter reason"
                    required={pax === "1-2"}
                  />
                </div>
              )}
              <div className="attendees-container">
                <div className="a-title">
                  <label htmlFor="attendees">Attendees:</label>
                </div>
                <Autosuggest
                  suggestions={suggestions}
                  onSuggestionsFetchRequested={onSuggestionsFetchRequested}
                  onSuggestionsClearRequested={onSuggestionsClearRequested}
                  getSuggestionValue={getSuggestionValue}
                  renderSuggestion={renderSuggestion}
                  inputProps={inputProps}
                  onSuggestionSelected={onSuggestionSelected}
                  theme={{
                    container: "autosuggest-container",
                    suggestionsContainerOpen: "suggestions-container",
                    suggestionsList: "suggestions-list",
                    suggestion: "suggestion-chip",
                  }}
                />
                <div className="attendees-row">
                  {attendees.map((attendee, index) => (
                    <div key={index} className="attendee-chip">
                      <span className="attendee-text">{attendee}</span>
                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeAttendee(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="guest-input-section">
                  <div className="guest-option">
                    <input
                      type="checkbox"
                      checked={showGuestInput}
                      onChange={() => setShowGuestInput(!showGuestInput)}
                      style={{ width: "auto", marginRight: "10px" }}
                    />
                    <label className="checkbox-label">Have any Guest</label>
                  </div>
                  {showGuestInput && (
                    <div className="guest-input-wrapper">
                      <label htmlFor="guestNames" className="guest-names-label">
                        Enter guest names (comma separated):
                      </label>
                      <input
                        type="text"
                        id="guestNames"
                        name="guestNames"
                        value={guestNames}
                        onChange={handleChange}
                        placeholder="Enter guest names"
                        className="guest-names-input"
                      />
                    </div>
                  )}
                </div>
              </div>
              <p className="end-note">
                You cannot edit the meeting details once you book. Please check
                the details before confirming.
              </p>
              <div className="reservation-button-group">
                <button
                  className="reserve-button"
                  style={{ alignItems: "center" }}
                >
                  Book
                </button>
                <button className="cancel-button" onClick={handleCancelTime}>
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div
            className="details-column"
            style={{ flex: "1", position: "relative" }}
          >
            <div
              className="background-image"
              style={{ backgroundImage: `url(${roomBg})` }}
            >
              <div className="color-overlay"></div>
              {bookData && (
                <>
                  <div className="details">
                    <h1>{bookData.roomName}</h1>
                    <div className="separator"></div>
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
                    <p>
                      <strong>Meeting Title: </strong> {formData.title}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          {showDiscardModal && (
            <div className="discard-modal">
              <div className="discard-content">
                <h2>Discard Changes</h2>
                <p>
                  Are you sure you want to discard your changes and go back to
                  the dashboard?
                </p>
                <div className="rsrv-buttons">
                  <button
                    className="reserve-btn"
                    onClick={handleConfirmDiscard}
                  >
                    Yes, Discard
                  </button>
                  <button className="cancel-btn" onClick={handleCancelDiscard}>
                    No, Keep Working
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default WithAuthReserve(ReservationFormsDetails);
