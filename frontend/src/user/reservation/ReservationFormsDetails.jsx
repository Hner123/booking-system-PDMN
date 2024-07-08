import React, { useState } from 'react';
import Autosuggest from 'react-autosuggest';
import { useNavigate } from 'react-router-dom';
import roomBg from '../../assets/roombg.jpg';

const ReservationFormsDetails = () => {
  const [phone, setPhone] = useState('');
  const [meeting, setMeeting] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const [agenda, setAgenda] = useState('');
  const [pax, setPax] = useState('');
  const [reason, setReason] = useState('');
  const [attendees, setAttendees] = useState([]);
  const [attendeeInput, setAttendeeInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  const allAttendees = ['Alice Johnson', 'Bob Smith', 'Charlie Davis', 'Dana Wilson', 'Eli Martinez'];

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Form submitted:', { attendees });
    navigate('/confirmation');
  };

  const getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    return inputLength === 0 ? [] : allAttendees.filter(attendee =>
      attendee.toLowerCase().includes(inputValue)
    );
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    setSuggestions(getSuggestions(value));
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion;

  const renderSuggestion = (suggestion) => (
    <div className="suggestion-chip">
      {suggestion}
    </div>
  );

  const onAttendeeInputChange = (event, { newValue }) => {
    setAttendeeInput(newValue);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setAttendees([...attendees, suggestion]);
    setAttendeeInput('');
  };

  const removeAttendee = (index) => {
    setAttendees(attendees.filter((_, i) => i !== index));
  };

  const inputProps = {
    placeholder: "Type attendee names",
    value: attendeeInput,
    onChange: onAttendeeInputChange,
    style: { width: '100%' }
  };

  return (
    <div className='form-page'>
      <h1>Booking Details</h1>
      <div className="reservation-details-container">
        <div className="form-column">
          <div className='form-title'>
            <h2>Reservation Details</h2>
            <p>Please enter the correct information and check the details before confirming your booking.</p>
          </div>
          
          <form className="reservation-form" onSubmit={handleSubmit}>
            <div className='read-only-group'>
              <div style={{ flex: 1 }}>
                <label htmlFor="name">Username:</label>
                <div id="name" className="read-only">
                  John Doe
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="department">Department:</label>
                <div id="department" className="read-only">
                  IT Department
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="pax">Number of Pax</label>
              <div className="radio-group" style={{ display: 'flex' }}>
                <div className="radio-option half-width">
                  <input
                    type="radio"
                    id="pax-1-2"
                    name="pax"
                    value="1-2"
                    checked={pax === '1-2'}
                    onChange={(event) => setPax(event.target.value)}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="pax-1-2">1-2 attendees</label>
                </div>
                <div className="radio-option half-width">
                  <input
                    type="radio"
                    id="pax-3-more"
                    name="pax"
                    value="3-more"
                    checked={pax === '3-more'}
                    onChange={(event) => setPax(event.target.value)}
                    style={{ width: 'auto' }}
                  />
                  <label htmlFor="pax-3-more">3 or more attendees</label>
                </div>
              </div>
            </div>

            {pax === '1-2' && (
              <div>
                <label htmlFor="reason">Reason for 1-2 attendees</label>
                <input
                  type="text"
                  id="reason"
                  name="reason"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Enter reason"
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
                  container: 'autosuggest-container',
                  suggestionsContainerOpen: 'suggestions-container',
                  suggestionsList: 'suggestions-list',
                  suggestion: 'suggestion-chip'
                }}
              />
              <div className="attendees-row">
                {attendees.map((attendee, index) => (
                  <div key={index} className="attendee-chip">
                    <span className="attendee-text">{attendee}</span>
                    <button type="button" className="remove-button" onClick={() => removeAttendee(index)}>×</button>
                  </div>
                ))}
              </div>
            </div>

            <label htmlFor="meeting">Meeting Title:</label>
            <input
              type="text"
              id="meeting"
              name="meeting"
              value={meeting}
              onChange={(event) => setMeeting(event.target.value)}
              placeholder="Enter meeting title"
            />

            <button type="submit" style={{ alignItems: 'center' }}>Book</button>
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
              You cannot edit the meeting details once you book. Please check the details before confirming.
            </p>
          </form>
        </div>

        <div className="details-column" style={{ flex: '1', position: 'relative' }}>
          <div className="background-image" style={{ backgroundImage: `url(${roomBg})` }}>
            <div className="color-overlay"></div>
            <div className="details">
              <h1>ROOM NAME</h1>
              <div className="separator"></div>
              <p>
                <strong>Date:</strong> {date}
              </p>
              <p>
                <strong>Meeting Start:</strong> {time}
              </p>
              <p>
                <strong>Meeting End:</strong> {time}
              </p>
              {meeting && (
                <p>
                  <strong>Meeting Title:</strong> {meeting}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationFormsDetails;
