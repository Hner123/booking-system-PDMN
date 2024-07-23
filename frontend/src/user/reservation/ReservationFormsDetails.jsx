import React, { useState, useEffect, useRef } from "react";
import Autosuggest from "react-autosuggest";
import { useNavigate } from "react-router-dom";
import roomBg from "../../assets/roombg.jpg";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import WithoutAuthReserve from "../../auth/WithAuthReserve";

const ReservationFormsDetails = () => {
  const formRef = useRef();
  const [pax, setPax] = useState("");
  const [attendees, setAttendees] = useState([]);
  const [attendeeInput, setAttendeeInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [bookData, setBookData] = useState("");
  const [userData, setUserData] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(""); // New state for selected room

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    caps: {
      pax: "",
      reason: "",
    },
    attendees: [],
    title: "",
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
    } else {
      setFormData({ ...formData, [name]: value });
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
          `http://localhost:8800/api/book/${reserveId}`,
          { headers }
        );
        if (response.status === 200) {
          setBookData(response.data);
          setSelectedRoom(response.data.roomName); // Set selected room
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchBookData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`http://localhost:8800/api/user/`, {
          headers,
        });
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

    if (bookData) {
      fetchUserData();
    }
  }, [bookData]);

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0
      ? []
      : userData.filter(
          (user) =>
            user.userName.toLowerCase().includes(inputValue) && !user.disabled
        );
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.userName;

  const renderSuggestion = (suggestion) => (
    <div className="suggestion-chip">{suggestion.userName}</div>
  );

  const onAttendeeInputChange = (event, { newValue }) => {
    setAttendeeInput(newValue);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    const updatedAttendees = [...attendees, suggestion.userName];
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
        user.userName === removedAttendee ? { ...user, disabled: false } : user
      )
    );
  };

  const inputProps = {
    placeholder: "Type attendee names",
    value: attendeeInput,
    onChange: onAttendeeInputChange,
    style: { width: "100%" },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the number of attendees meets the requirement
    if (selectedRoom === "Palawan and Boracay" && attendees.length < 8) {
      toast.error(
        "For 'Palawan and Boracay', you must have at least 8 attendees."
      );
      return;
    }

    const updatedReserve = {
      caps: {
        pax: formData.caps.pax,
        reason: formData.caps.reason,
      },
      attendees: formData.attendees,
      title: formData.title,
      confirmation:
        bookData.confirmation === false ||
        formData.caps.pax === "1-2" ||
        bookData.agenda
          ? false
          : true,
    };

    try {
      const reserveId = localStorage.getItem("reserveToken");
      const token = localStorage.getItem("authToken");

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.patch(
        `http://localhost:8800/api/book/edit/${reserveId}`,
        updatedReserve,
        { headers }
      );

      if (updateResponse.status === 201) {
        toast.success("Successfully updated information.");
        navigate("/confirmation");
      } else {
        toast.error("Failed to update information.");
      }
    } catch (error) {
      console.error("Error during patch:", error);
      toast.error("Error updating information. Please try again later.");
    }
  };

  return (
    <div className="form-page">
      <ToastContainer />
      <h1>Booking Details</h1>
      <div className="reservation-details-container">
        <div className="form-column">
          <div className="form-title">
            <h2>Reservation Details</h2>
            <p>
              Please enter the correct information and check the details before
              confirming your booking.
            </p>
          </div>

          <form
            className="reservation-form"
            ref={formRef}
            onSubmit={handleSubmit}
          >
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

            <div>
              <label htmlFor="pax">Number of Pax</label>
              <div className="radio-group" style={{ display: "flex" }}>
                <div className="radio-option half-width">
                  <input
                    type="radio"
                    id="pax-1-2"
                    name="pax"
                    value="1-2"
                    checked={formData.caps.pax === "1-2"}
                    onChange={handlePaxChange}
                    disabled={selectedRoom !== "Palawan"}
                    style={{ width: "auto" }}
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
                    disabled={selectedRoom !== "Palawan"}
                    style={{ width: "auto" }}
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

            <label htmlFor="attendees">Attendees:</label>
            <div className="attendees-container">
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
            </div>

            <label htmlFor="title">Meeting Title:</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter meeting title"
              required
            />

            <button type="submit" style={{ alignItems: "center" }}>
              Book
            </button>
            <p
              style={{
                marginTop: "10px",
                fontSize: "12px",
                color: "#666",
                textAlign: "center",
              }}
            >
              You cannot edit the meeting details once you book. Please check
              the details before confirming.
            </p>
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
      </div>
    </div>
  );
};

export default WithoutAuthReserve(ReservationFormsDetails);
