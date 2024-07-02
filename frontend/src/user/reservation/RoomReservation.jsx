import React, { useState } from 'react';
import moment from 'moment';
import './RoomReservation.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCalendar } from '@fortawesome/free-solid-svg-icons';
import DatePicker from 'react-datepicker';
import TimePicker from 'rc-time-picker';
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-time-picker/assets/index.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';


const RoomReservation = () => {
  const localizer = momentLocalizer(moment);

  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(moment().hours(9).minutes(0));
  const [endTime, setEndTime] = useState(moment().hours(10).minutes(0));
  const [events, setEvents] = useState([]);

  const handleReserve = () => {
    const newEvent = {
      start: moment(startDate).set({
        hour: startTime.hour(),
        minute: startTime.minute(),
      }).toDate(),
      end: moment(startDate).set({
        hour: endTime.hour(),
        minute: endTime.minute(),
      }).toDate(),
      title: 'Reserved'
    };
    setEvents([...events, newEvent]);
    console.log('Appointment reserved:', newEvent);
    alert('Appointment reserved successfully!');
  };

  const handleBlockTime = () => {
    console.log('Time interval blocked');
    alert('Time interval blocked!');
  };

  return (
    <div className="room-reservation-container">
      <div className="left-column">
        <div className="booking-controls">
          <h2>
            <FontAwesomeIcon icon={faCalendar}/>
            Booking Calendar
          </h2>
          <div className="date-time-picker">
            <div className="date-picker">
              <DatePicker
                selected={startDate}
                minDate={new Date()}
                maxDate={moment().add(7, 'days').toDate()}
                onChange={(date) => setStartDate(date)}
                inline
                calendarIcon={<FontAwesomeIcon icon={faCalendar}/>}
              />
            </div>
            <div className="time-pickers">
              <div className="time-picker">
                <h3>
                  Start Time <FontAwesomeIcon icon={faClock}/>
                </h3>
                <TimePicker
                  showSecond={false}
                  defaultValue={startTime}
                  onChange={setStartTime}
                />
              </div>
              <div className="time-picker">
                <h3>
                  End Time <FontAwesomeIcon icon={faClock} />
                </h3>
                <TimePicker
                  showSecond={false}
                  defaultValue={endTime}
                  onChange={setEndTime}
                />
              </div>
            </div>
          </div>
          <div className="buttons">
            <button onClick={handleReserve}>
              Reserve
            </button>
            <button onClick={handleBlockTime}>
              Block Time
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-column">
        <div className="calendar-container">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 'calc(100vh - 40px)' }} // Adjust height to account for padding/margin
            eventPropGetter={(event, start, end, isSelected) => ({
              style: {
                backgroundColor: '#3174ad', // Example background color for events
                borderRadius: '4px',
                border: 'none',
                color: '#fff',
                padding: '2px 4px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }
            })}
            components={{
              event: ({ event }) => (
                <div>
                  <strong>{event.title}</strong>
                </div>
              )
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default RoomReservation;
