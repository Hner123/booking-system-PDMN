import React, { useState } from 'react';

const ReservationFormsDetails = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [meeting, setMeeting] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [room, setRoom] = useState('');
  const [agenda, setAgenda] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Add validation and submission logic here
    console.log('Form submitted:', { name, email, phone, meeting, date, time, room, agenda });
  };

  return (
    <div className="reservation-details-container">
      <div className="left-column">
        {/* Left Column Content */}
        <h2>Reservation Details</h2>
        <form className="reservation-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Enter your name"
          />

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your email"
          />

          <label htmlFor="phone">Phone:</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Enter your phone number"
          />

          <label htmlFor="meeting">Meeting Title:</label>
          <input
            type="text"
            id="meeting"
            name="meeting"
            value={meeting}
            onChange={(event) => setMeeting(event.target.value)}
            placeholder="Enter meeting title"
          />

          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            name="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />

          <label htmlFor="time">Time:</label>
          <input
            type="time"
            id="time"
            name="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
          />

          <label htmlFor="room">Room:</label>
          <select
            id="room"
            name="room"
            value={room}
            onChange={(event) => setRoom(event.target.value)}
          >
            <option value="roomA">Room A</option>
            <option value="roomB">Room B</option>
            <option value="roomC">Room C</option>
          </select>

          <label htmlFor="agenda">Agenda:</label>
          <textarea
            id="agenda"
            name="agenda"
            value={agenda}
            onChange={(event) => setAgenda(event.target.value)}
            rows="4"
            placeholder="Enter meeting agenda"
          ></textarea>

          <button type="submit">Submit</button>
        </form>
      </div>
      <div className="right-column">
        {/* Right Column Content */}
        <h2>Additional Information</h2>
        <p>Include any additional information or requirements here.</p>
      </div>
    </div>
  );
};

export default ReservationFormsDetails;