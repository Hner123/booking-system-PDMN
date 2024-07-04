import React, { useState } from 'react';
import moment from 'moment';
import './RoomReservation.css';
import DatePicker from 'react-datepicker';
import TimePicker from 'rc-time-picker';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-time-picker/assets/index.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useNavigate } from 'react-router-dom';

const RoomReservation = () => {
  const localizer = momentLocalizer(moment);
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(moment().hours(9).minutes(0));
  const [endTime, setEndTime] = useState(moment().hours(10).minutes(0));
  const [events, setEvents] = useState([]);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [agenda, setAgenda] = useState('');
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const handleReserve = () => {
    const start = moment(startDate).set({
      hour: startTime.hour(),
      minute: startTime.minute(),
    });
    const end = moment(startDate).set({
      hour: endTime.hour(),
      minute: endTime.minute(),
    });

    const durationHours = moment.duration(end.diff(start)).asHours();
    if (durationHours <= 0 || start.isSameOrAfter(end)) {
      setFeedbackMessage('Please select a valid start and end time.');
      return;
    }

    const overlap = events.some((event) =>
      (moment(start).isBetween(event.start, event.end, null, '[]') ||
       moment(end).isBetween(event.start, event.end, null, '[]')) ||
      (moment(event.start).isBetween(start, end, null, '[]') ||
       moment(event.end).isBetween(start, end, null, '[]'))
    );
    if (overlap) {
      setFeedbackMessage('Time slot overlaps with an existing reservation.');
      return;
    }

    if (durationHours > 1) {
      setShowAgendaForm(true);
    } else {
      reserveEvent();
    }
  };

  const reserveEvent = () => {
    const newEvent = {
      start: moment(startDate).set({
        hour: startTime.hour(),
        minute: startTime.minute(),
      }).toDate(),
      end: moment(startDate).set({
        hour: endTime.hour(),
        minute: endTime.minute(),
      }).toDate(),
      title: 'Reserved',
      agenda: agenda,
    };
    setEvents([...events, newEvent]);
    setShowAgendaForm(false);
    setAgenda('');
    setFeedbackMessage('Appointment reserved successfully!');
    navigate('/reserveform'); // Navigate to the ReservationFormsDetails page
  };

  const handleBlockTime = () => {
    setShowDiscardModal(true);
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    navigate('/dashboard');
  };

  const handleCancelDiscard = () => {
    setShowDiscardModal(false);
  };

  const handleEventClick = (event) => {
    setExpandedEvent(event);
  };

  const closeEventDetails = () => {
    setExpandedEvent(null);
  };

  return (
    <div className="room-reservation-container">
      <h1>Reserve Room</h1>
      <div className="main-container">
        <div className="left-column">
          <div className="booking-controls">
            <h2>Book a Room</h2>
            <div className="date-time-picker">
              <div className="date-picker">
                <DatePicker
                  selected={startDate}
                  minDate={new Date()}
                  maxDate={moment().add(7, 'days').toDate()}
                  onChange={(date) => setStartDate(date)}
                  inline
                  calendarClassName="custom-calendar"
                />
              </div>
              <div className="time-pickers">
                <div className="time-picker">
                  <h3>Start Time</h3>
                  <TimePicker
                    showSecond={false}
                    defaultValue={startTime}
                    onChange={setStartTime}
                  />
                </div>
                <div className="time-picker">
                  <h3>End Time</h3>
                  <TimePicker
                    showSecond={false}
                    defaultValue={endTime}
                    onChange={setEndTime}
                  />
                </div>
              </div>
            </div>
            <div className="buttons">
              <button className="block-btn" onClick={handleBlockTime}>Cancel</button>
              <button className="reserve-btn" onClick={handleReserve}>Reserve</button>
            </div>
            {showAgendaForm && (
              <div className="agenda-form">
                <h2>Provide Agenda</h2>
                <input
                  type="text"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Enter agenda or reason"
                />
                <button onClick={reserveEvent}>Submit</button>
              </div>
            )}
            {feedbackMessage && (
              <div className="feedback-message">
                {feedbackMessage}
              </div>
            )}
          </div>

          <div className="legend-controls">
            <div className="legend">
              <div className="legend-item">
                <span className="pdmn"></span>
                <p>Philippine Dragon Media Network</p>
              </div>
              <div className="legend-item">
                <span className="gds"></span>
                <p>GDS Travel Agency</p>
              </div>
              <div className="legend-item">
                <span className="lgl"></span>
                <p>FEILONG Legal</p>
              </div>
              <div className="legend-item">
                <span className="strlgt"></span>
                <p> STARLIGHT</p>
              </div>
              <div className="legend-item">
                <span className="bvp"></span>
                <p>BIG VISION PRODS.</p>
              </div>
              <div className="legend-item">
                <span className="sn"></span>
                <p>SuperNova</p>
              </div>
              <div className="legend-item">
                <span className="cp"></span>
                <p>ClearPath</p>
              </div>

            </div>
          </div>
        </div>
        <div className="calendar-column">
          <h3>Meetings For This Week</h3>
          <div className="calendar-container">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor: '#45813',
                  borderRadius: '4px',
                  border: 'none',
                  color: '#fff',
                  padding: '2px 4px',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s',
                },
              })}
              components={{
                event: ({ event }) => (
                  <div
                    onClick={() => handleEventClick(event)}
                    style={{ cursor: 'pointer' }}
                  >
                    <strong>{moment(event.start).format('h:mm a')}</strong>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </div>

      {expandedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            <span className="close" onClick={closeEventDetails}>&times;</span>
            <h2>{expandedEvent.title}</h2>
            <p><strong>Start:</strong> {moment(expandedEvent.start).format('MMMM Do YYYY, h:mm a')}</p>
            <p><strong>End:</strong> {moment(expandedEvent.end).format('MMMM Do YYYY, h:mm a')}</p>
          </div>
        </div>
      )}

      {showDiscardModal && (
        <div className="discard-modal">
          <div className="modal-content">
            <h2>Discard Changes</h2>
            <p>Are you sure you want to discard your changes and go back to the dashboard?</p>
            <button className="block-btn" onClick={handleConfirmDiscard}>Yes, Discard</button>
            <button className="block-btn" onClick={handleCancelDiscard}>No, Keep Working</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomReservation;

