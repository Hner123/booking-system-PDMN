import React, { useState, useEffect } from "react";
import moment from "moment";
import "./RoomReservation.css";
import DatePicker from "react-datepicker";
import TimePicker from "rc-time-picker";
import "react-datepicker/dist/react-datepicker.css";
import "rc-time-picker/assets/index.css";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "../../user/reservation/CustomBigCalendar.scss";
import WithoutAuthReserve from "../../auth/WithAuthReserve";

const RoomReservation = () => {
  const localizer = momentLocalizer(moment);
  const navigate = useNavigate();

  // State variables
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(moment().hours(9).minutes(0));
  const [endTime, setEndTime] = useState(moment().hours(10).minutes(0));
  const [events, setEvents] = useState([]);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [agenda, setAgenda] = useState("");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [bookData, setBookData] = useState(null);
  const [origData, setOrigData] = useState();

  const departmentColors = {
    "Philippine Dragon Media Network": "#dc3545",
    "GDS Travel Agency": "#fccd32",
    "FEILONG Legal": "#d8a330",
    "STARLIGHT": "#f0f000",
    "BIG VISION PRODS.": "#28a745",
    "SuperNova": "#272727",
    "ClearPath": "#2a8fc7",
  };

  useEffect(() => {
    const fetchOrigData = async () => {
      try {
        const reserveToken = localStorage.getItem("reserveToken");
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `http://localhost:8800/api/book/${reserveToken}`,
          {
            headers,
          }
        );
        if (response.status === 200) {
          setOrigData(response.data);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    fetchOrigData();
  }, []);

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
          if (origData && origData.roomName) {
            const filteredData = response.data.filter(
              (event) => event.roomName === origData.roomName
            );
            const fetchedEvents = filteredData.map((event) => ({
              id: event._id,
              start: new Date(event.startTime),
              end: new Date(event.endTime),
              title: event.title,
              agenda: event.agenda,
              status: event.confirmation,
              department: event.user.department,
            }));
            setEvents(fetchedEvents);
            setBookData(filteredData);
          } else {
            console.error("origData or roomName is not available");
          }
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      }
    };

    // Call fetchBookData only if origData is available
    if (origData) {
      fetchBookData();
    }
  }, [origData]);

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Set to Monday of this week

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End of week (Sunday)

  const filteredEvents = events.filter((event) => {
    const eventStart = new Date(event.start);
    const eventDay = eventStart.getDay();
    return eventDay !== 0; // Exclude Sundays (0)
  });

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
      setFeedbackMessage("Please select a valid start and end time.");
      return;
    }

    const overlap = events.some(
      (event) =>
        moment(start).isBetween(event.start, event.end, null, "[]") ||
        moment(end).isBetween(event.start, event.end, null, "[]") ||
        moment(event.start).isBetween(start, end, null, "[]") ||
        moment(event.end).isBetween(start, end, null, "[]")
    );
    if (overlap) {
      setFeedbackMessage("Time slot overlaps with an existing reservation.");
      return;
    }

    if (durationHours > 1) {
      setShowAgendaForm(true);
    } else {
      reserveEvent();
    }
  };

  const reserveEvent = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (
      !agenda &&
      moment.duration(moment(endTime).diff(moment(startTime))).asHours() > 1
    ) {
      setFeedbackMessage(
        "Please provide an agenda for meetings longer than 1 hour."
      );
      return;
    }

    const startDateTime = moment(startDate)
      .set({
        hour: startTime.hour(),
        minute: startTime.minute(),
        second: 0,
        millisecond: 0,
      })
      .toDate();

    const endDateTime = moment(startDate)
      .set({
        hour: endTime.hour(),
        minute: endTime.minute(),
        second: 0,
        millisecond: 0,
      })
      .toDate();

    const newEvent = {
      start: startDateTime,
      end: endDateTime,
      title: "Reserved",
      agenda: agenda,
      status: "pending",
    };

    setEvents([...events, newEvent]);
    setShowAgendaForm(false);
    setAgenda("");
    setFeedbackMessage("Appointment request submitted for approval.");

    const reserveData = {
      scheduleDate: moment(startDate).format("YYYY-MM-DD"),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      agenda: agenda,
      caps: {
        pax: "",
        reason: "",
      },
      confirmation: agenda ? false : true,
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
        reserveData,
        { headers }
      );

      if (updateResponse.status === 201) {
        navigate("/reserveform");
      }
    } catch (error) {
      console.error("Error during patch:", error);
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
        `http://localhost:8800/api/book/delete/${reserveId}`,
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

  const minTime = 8; // 8:00 AM
  const maxTime = 21; // 9:00 PM

  const disabledHours = () => {
    const hours = [];
    for (let i = 0; i < minTime; i++) {
      hours.push(i);
    }
    for (let i = maxTime + 1; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  };

  const disabledMinutes = (hour) => {
    if (hour < minTime || hour > maxTime) {
      return Array.from({ length: 60 }, (_, i) => i); 
    }
    return [];
  };

  const isNotSunday = (date) => {
    const day = date.getDay();
    return day !== 0;
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
      <ToastContainer />
      <h1>Reserve Room</h1>
      <div className="main-container">
        <div className="rsrv-column">
          <div className="booking-controls">
            <h2>Book a Room</h2>
            <div className="date-time-picker">
              <div className="date-picker">
                <DatePicker
                  selected={startDate}
                  minDate={new Date()}
                  maxDate={moment().add(8, "days").toDate()}
                  onChange={(date) => setStartDate(date)}
                  inline
                  calendarClassName="custom-calendar"
                  filterDate={isNotSunday} 
                />
                <p>Reservation of meeting can't be made prior 1 week ahead.</p>
              </div>
              <div className="custom-time-picker">
                <h3>Start Time</h3>
                <TimePicker
                  value={startTime}
                  showSecond={false}
                  use12Hours
                  format="h:mm a"
                  disabledHours={disabledHours}
                  disabledMinutes={disabledMinutes}
                  minuteStep={10}
                  hideDisabledOptions
                />
              </div>
              <div className="custom-time-picker">
                <h3>End Time</h3>
                <TimePicker
                  value={endTime}
                  showSecond={false}
                  use12Hours
                  format="h:mm a"
                  disabledHours={disabledHours}
                  disabledMinutes={disabledMinutes}
                  minuteStep={10}
                  hideDisabledOptions
                  placeholder="Select Time"
                />
              </div>
            </div>

            <div className="rsrv-buttons">
              <button className="cancel-btn" onClick={handleCancelTime}>
                Cancel
              </button>
              <button className="reserve-btn" onClick={handleReserve}>
                Reserve
              </button>
            </div>
            {showAgendaForm && (
              <div className="agenda-form">
                <label>Provide Agenda</label>
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
              <div className="feedback-message">{feedbackMessage}</div>
            )}
            <p>
              The maximum meeting duration is 1 hour. If it exceeds this limit,
              please state your reason.
            </p>
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
                <p>STARLIGHT</p>
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
              style={{ height: "100%" }}
              min={new Date().setHours(8, 0, 0)} 
              max={new Date().setHours(21, 0, 0)} 
              defaultView={Views.WEEK}
              views={[Views.WEEK, Views.DAY, Views.AGENDA]} 
              eventPropGetter={(event) => ({
                style: {
                  backgroundColor:
                    departmentColors[event.department] || "#45813",
                  borderRadius: "4px",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                },
              })}
              components={{
                event: ({ event }) => (
                  <div
                    onClick={() => handleEventClick(event)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{event.title}</strong>
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </div>

      {/* Expanded Event Modal */}
      {expandedEvent && (
        <div className="event-details-modal">
          <div className="modal-content">
            {/* Event details */}
            <span className="close" onClick={closeEventDetails}>
              &times;
            </span>
            <h2>{expandedEvent.title}</h2>
            <p>
              <strong>Start:</strong>{" "}
              {moment(expandedEvent.start).format("MMMM Do YYYY, h:mm a")}
            </p>
            <p>
              <strong>End:</strong>{" "}
              {moment(expandedEvent.end).format("MMMM Do YYYY, h:mm a")}
            </p>
          </div>
        </div>
      )}

      {/* Discard Changes Modal */}
      {showDiscardModal && (
        <div className="discard-modal">
          <div className="discard-content">
            <h2>Discard Changes</h2>
            <p>
              Are you sure you want to discard your changes and go back to the
              dashboard?
            </p>
            <div className="rsrv-buttons">
              <button className="reserve-btn" onClick={handleConfirmDiscard}>
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
  );
};

export default WithoutAuthReserve(RoomReservation);
