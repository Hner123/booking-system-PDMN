import React, { useState, useRef, useEffect } from "react";
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
import WithAuthReserve from "../../auth/WithAuthReserve";

const API = import.meta.env.VITE_REACT_APP_API || "http://localhost:3001";

const RoomReservation = () => {
  const localizer = momentLocalizer(moment);
  const navigate = useNavigate();

  const initializeHour = (hoursToAdd = 0) => {
    return moment().startOf("hour").add(hoursToAdd, "hours");
  };

  const [startTime, setStartTime] = useState(initializeHour());
  const [endTime, setEndTime] = useState(initializeHour(1));
  const [startDate, setStartDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [agenda, setAgenda] = useState("");
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [bookData, setBookData] = useState(null);
  const [origData, setOrigData] = useState();
  const [roomName, setRoomName] = useState("");
  const [loading, setLoading] = useState(false);

  const departmentColors = {
    "Philippine Dragon Media Network": "#C0392B",
    "GDS Capital": "#E74C3C",
    "GDS Travel Agency": "#F39C12",
    "FEILONG Legal": "#D4AC0D",
    STARLIGHT: "#F7DC6F",
    "Dragon AI": "#1E8449",
    SuperNova: "#E59866",
    ClearPath: "#2874A6",
    Palawan: "#C0392B",
    Boracay: "#2874A6",
    "Palawan and Boracay": "#F39C12",
  };

  useEffect(() => {
    const fetchOrigData = async () => {
      try {
        setLoading(true);

        const reserveToken = localStorage.getItem("reserveToken");
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`${API}/api/book/${reserveToken}`, {
          headers,
        });
        if (response.status === 200) {
          setOrigData(response.data);
          setRoomName(response.data.roomName);
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrigData();
  }, []);

  const headerColor = departmentColors[roomName] || "#000";

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(`${API}/api/book/`, {
          headers,
        });

        if (response.status === 200) {
          if (origData && origData.roomName) {
            let filteredData = response.data;

            if (origData.roomName !== "Palawan and Boracay") {
              filteredData = response.data.filter(
                (event) =>
                  (event.roomName === origData.roomName &&
                    event.approval.status !== "Declined") ||
                  event.roomName === "Palawan and Boracay"
              );
            }

            const fetchedEvents = filteredData.map((event) => {
              let combinedAttendees = [];

              if (event.attendees && event.attendees.length > 0) {
                combinedAttendees = [...event.attendees];
              }

              if (event.guest && event.guest.length > 0) {
                combinedAttendees = [...combinedAttendees, ...event.guest];
              }

              return {
                id: event._id,
                start: new Date(event.startTime),
                end: new Date(event.endTime),
                title: event.title,
                agenda: event.agenda,
                status: event.approval.status,
                department: event.user?.department,
                room: event.roomName,
                user: `${event.user?.firstName} ${event.user?.surName}`,
                attendees: combinedAttendees,
              };
            });

            setEvents(fetchedEvents);
            setBookData(filteredData);
          } else {
            console.error("origData or roomName is not available");
          }
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (origData) {
      fetchBookData();
    }
  }, [origData]);

  const startOfWeek = new Date();
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const handleReserve = async () => {
    setLoading(true);

    const start = moment(startDate).set({
      hour: startTime.hour(),
      minute: startTime.minute(),
      second: 0,
      millisecond: 0,
    });
    const end = moment(startDate).set({
      hour: endTime.hour(),
      minute: endTime.minute(),
      second: 0,
      millisecond: 0,
    });

    const durationHours = moment.duration(end.diff(start)).asHours();
    if (durationHours <= 0 || start.isSameOrAfter(end)) {
      setFeedbackMessage("Please select a valid start and end time.");
      setLoading(false);
      return;
    }

    const overlap = events.some((event) => {
      const eventStart = moment(event.start).set({
        second: 0,
        millisecond: 0,
      });
      const eventEnd = moment(event.end).set({
        second: 0,
        millisecond: 0,
      });

      return start.isBefore(eventEnd) && end.isAfter(eventStart);
    });

    if (overlap) {
      setFeedbackMessage(
        "The selected time slot overlaps with an existing reservation. Please choose a different time."
      );
      setLoading(false);
      return;
    }

    if (durationHours > 1 && !agenda) {
      setFeedbackMessage(
        "Your meeting exceeds 1 hour. Please provide your reason below."
      );
      setShowAgendaForm(true);
      setLoading(false);
      return;
    }

    const startDateTime = start.toDate();
    const endDateTime = end.toDate();

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

    let confirmationStatus =
      !agenda && origData.roomName !== "Palawan and Boracay";

    const reserveData = {
      scheduleDate: moment(startDate).format("YYYY-MM-DD"),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      agenda: agenda,
      caps: {
        pax: "",
        reason: "",
      },
      approval: {
        archive: false,
        status: "Pending",
        reason: "",
      },
      confirmation: confirmationStatus,
    };

    try {
      const reserveId = localStorage.getItem("reserveToken");
      const token = localStorage.getItem("authToken");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const updateResponse = await axios.patch(
        `${API}/api/book/edit/${reserveId}`,
        reserveData,
        { headers }
      );

      if (updateResponse.status === 200) {
        navigate("/reserveform");
      }
    } catch (error) {
      console.error("Error during patch:", error);
    } finally {
      setLoading(false);
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
        `${API}/api/book/delete/${reserveId}`,
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

  const minTime = 8;
  const maxTime = 21;

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

  const handleStartTimeChange = (value) => {
    setStartTime(value);

    // Calculate the new end time as one hour after the start time
    const newEndTime = moment(value).add(1, "hour");
    setEndTime(newEndTime);
  };

  return (
    <div className="room-reservation-container">
      <ToastContainer />
      <h1 style={{ textAlign: "Center", margin: "0" }}>
        Reserve{" "}
        {roomName ? (
          <span style={{ color: headerColor }}>{roomName}</span>
        ) : (
          " "
        )}{" "}
        Room
      </h1>
      <div className="main-container">
        <div className="rsrv-column">
          <div className="booking-controls">
            <h2>Book {roomName}</h2>
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
                  disabled={loading}
                />
                <p>Reservation of meeting can't be made prior 1 week ahead.</p>
              </div>
              <div className="custom-time-picker">
                <h3>Start Time</h3>
                <TimePicker
                  value={startTime}
                  onChange={handleStartTimeChange} // Use the new function
                  showSecond={false}
                  use12Hours
                  format="h:mm a"
                  disabledHours={disabledHours}
                  disabledMinutes={disabledMinutes}
                  minuteStep={5}
                  hideDisabledOptions
                  placeholder="Select Time"
                  defaultValue={moment()}
                  defaultOpenValue={moment()}
                  disabled={loading}
                />
              </div>
              <div className="custom-time-picker">
                <h3>End Time</h3>
                <TimePicker
                  value={endTime}
                  onChange={(value) => setEndTime(value)}
                  showSecond={false}
                  use12Hours
                  format="h:mm a"
                  disabledHours={disabledHours}
                  disabledMinutes={disabledMinutes}
                  minuteStep={5}
                  hideDisabledOptions
                  placeholder="Select Time"
                  defaultValue={moment().add(1, "hours")}
                  defaultOpenValue={moment().add(1, "hours")}
                  disabled={loading}
                />
              </div>
            </div>
            <p>
              The maximum meeting duration is 1 hour. If it exceeds this limit,
              please state your reason.
            </p>
            {feedbackMessage && (
              <div className="feedback-message">{feedbackMessage}</div>
            )}
            {showAgendaForm && (
              <div className="agenda-form">
                <label htmlFor="agenda">Reason:</label>
                <input
                  id="agenda"
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  placeholder="Enter reason"
                />
              </div>
            )}
            <div className="rsrv-buttons">
              <button
                className="cancel-btn"
                onClick={handleCancelTime}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="reserve-button"
                onClick={handleReserve}
                disabled={loading}
              >
                {loading ? <span>Loading...</span> : <span>Submit</span>}
              </button>
            </div>
          </div>

          <div className="legend-controls">
            <div className="legend">
              <h3>Legend</h3>
              <div className="legend-item">
                <span className="pdmn"></span>
                <p>Philippine Dragon Media Network</p>
              </div>
              <div className="legend-item">
                <span className="cptl"></span>
                <p>GDS Capital</p>
              </div>
              <div className="legend-item">
                <span className="gds"></span>
                <p>GDS Travel Agency</p>
              </div>
              <div className="legend-item">
                <span className="ai"></span>
                <p>DragonAi</p>
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
          <h3>Meetings for the Week</h3>
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
                  color: "#fff",
                  cursor: "pointer",
                  transition: "background-color 0.3s",
                },
              })}
              components={{
                event: ({ event }) => (
                  <div
                    onClick={() => handleEventClick(event)}
                    style={{
                      cursor: "pointer",
                      padding: "5px",
                      backgroundColor:
                        departmentColors[event.department] || "#45813",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%", // Ensures full height is clickable
                      overflow: "hidden", // Avoids overflow issues
                      borderRadius: "4px", // Optional: For better visuals
                    }}
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
        <div className="expanded-event-modal">
          <div className="expanded-event-content">
            <h2>{expandedEvent.title}</h2>
            <div className="modal-columns">
              <div className="left-content">
                <p>
                  <strong>Booked by:</strong> {expandedEvent.user}
                </p>
                <p>
                  <strong>Department:</strong> {expandedEvent.department}
                </p>
                <p>
                  <strong>Attendees:</strong>{" "}
                  {expandedEvent.attendees && expandedEvent.attendees.length > 0
                    ? expandedEvent.attendees.join(", ")
                    : "No attendees listed"}
                </p>
              </div>
              <div className="right-content">
                <h3 style={{ margin: "0" }}>{expandedEvent.room}</h3>
                <p>
                  <strong>Date:</strong>{" "}
                  {moment(expandedEvent.start).format("MMMM D, YYYY")}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {moment(expandedEvent.start).format("h:mm A")} -{" "}
                  {moment(expandedEvent.end).format("h:mm A")}
                </p>
                <p>
                  <strong>Status:</strong> {expandedEvent.status}
                </p>
              </div>
            </div>
            <div className="closetab">
              <button
                className="close-btn"
                onClick={() => setExpandedEvent(null)}
              >
                &times;
              </button>
            </div>
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

export default WithAuthReserve(RoomReservation);
