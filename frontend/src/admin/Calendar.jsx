import React, { useState, useEffect } from "react";
import moment from "moment";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../admin/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Sub-components for better structure
const Tabs = ({ activeTab, onTabClick }) => (
  <div className="tabs">
    {["Palawan", "Boracay", "Palawan and Boracay"].map((room) => (
      <button
        key={room}
        className={activeTab === room ? "active-tab" : ""}
        onClick={() => onTabClick(room)}
      >
        {room}
      </button>
    ))}
  </div>
);

const EventModal = ({ event, onClose }) => (
  <div className="expanded-event-modal">
    <div className="expanded-event-content">
      <h2>{event.title}</h2>
      <div className="modal-columns">
        <div className="left-content">
          <p><strong>Booked by:</strong> {event.user}</p>
          <p><strong>Department:</strong> {event.department}</p>
          <p>
            <strong>Attendees:</strong> 
            {event.attendees?.length > 0 ? event.attendees.join(", ") : "No attendees listed"}
          </p>
        </div>
        <div className="right-content">
          <h3>{event.room}</h3>
          <p><strong>Date:</strong> {moment(event.start).format("MMMM D, YYYY")}</p>
          <p>
            <strong>Time:</strong> 
            {moment(event.start).format("h:mm A")} - {moment(event.end).format("h:mm A")}
          </p>
          <p><strong>Status:</strong> {event.status}</p>
        </div>
      </div>
      <button className="close-btn" onClick={onClose}>&times;</button>
    </div>
  </div>
);

const RoomReservation = () => {
  const localizer = momentLocalizer(moment);
  const navigate = useNavigate();

  const [state, setState] = useState({
    startDate: new Date(),
    events: [],
    roomName: "Palawan",
    origData: [],
    sidebarOpen: true,
    activeTab: "Palawan",
    expandedEvent: null,
    loading: false,
  });

  const departmentColors = {
    "Philippine Dragon Media Network": "#dc3545",
    "GDS Capital": "#fd0645",
    "GDS Travel Agency": "#fccd32",
    "FEILONG Legal": "#d8a330",
    STARLIGHT: "#f0f000",
    "Dragon AI": "#28a745",
    SuperNova: "#F9A380",
    ClearPath: "#2a8fc7",
  };

  useEffect(() => {
    const fetchBookData = async () => {
      setState((prevState) => ({ ...prevState, loading: true }));

      try {
        const token = localStorage.getItem("adminToken");
        if (!token) throw new Error("No auth token found in localStorage.");

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          "https://booking-system-ge1i.onrender.com/api/book/",
          { headers }
        );

        if (response.status === 200) {
          const fetchedEvents = response.data
            .filter((event) => event.title && event.title.trim() !== "")
            .map((event) => ({
              id: event._id,
              start: new Date(event.startTime),
              end: new Date(event.endTime),
              title: event.title,
              agenda: event.agenda,
              status: event.approval.status,
              department: event.user?.department,
              room: event.roomName,
              user: `${event.user?.firstName} ${event.user?.surName}`,
              attendees: event.attendees,
            }));

          setState((prevState) => ({
            ...prevState,
            origData: fetchedEvents,
            events: fetchedEvents.filter(
              (event) =>
                event.room === state.roomName ||
                state.roomName === "Palawan and Boracay"
            ),
            loading: false,
          }));
        } else {
          throw new Error("Failed to fetch data.");
        }
      } catch (error) {
        console.error("Error fetching book data:", error);
        toast.error("Failed to load events. Please try again later.");
        setState((prevState) => ({ ...prevState, loading: false }));
      }
    };

    fetchBookData();
  }, [state.roomName]);

  const handleTabClick = (room) => {
    setState((prevState) => ({
      ...prevState,
      roomName: room,
      activeTab: room,
      events: prevState.origData.filter(
        (event) => event.room === room || room === "Palawan and Boracay"
      ),
    }));
  };

  return (
    <div
      className={`room-reservation admin-page ${
        state.sidebarOpen ? "sidebar-open" : "sidebar-closed"
      }`}
    >
      <Sidebar sidebarOpen={state.sidebarOpen} />
      <div className="admin-content">
        <ToastContainer />
        <Tabs activeTab={state.activeTab} onTabClick={handleTabClick} />
        <div>
          <div className="calendar-container">
            {state.loading ? (
              <p>Loading...</p>
            ) : (
              <Calendar
                localizer={localizer}
                events={state.events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: state.activeTab === "Palawan and Boracay" ? "1100px" : "850px" }}
                defaultView={Views.WEEK}
                views={[Views.WEEK, Views.DAY, Views.AGENDA]}
                min={new Date(2024, 7, 1, 7, 0)} // Limits the start time to 7 AM
                max={new Date(2024, 7, 1, 20, 0)} // Limits the end time to 8 PM
                eventPropGetter={(event) => {
                  let backgroundColor;
                  let borderStyle = "";
                  let width = "auto"; // Default width
                
                  if (state.activeTab === "Palawan and Boracay") {
                    if (event.room === "Palawan") {
                      backgroundColor = "#dc3545";
                      borderStyle = "3px solid #dc3545";
                      width = "50%"; // Set specific width for Palawan
                    } else if (event.room === "Boracay") {
                      backgroundColor = "#d8a330";
                      borderStyle = "3px solid #d8a330";
                      width = "50%"; // Set specific width for Boracay
                    } else {
                      backgroundColor = "purple"; // Default for other rooms
                      width = "100%"; // Set default width for other rooms
                    }
                  } else {
                    backgroundColor = departmentColors[event.department] || "#45813";
                    width = "auto"; // Default width for other tabs
                  }
                
                  return {
                    className: "event-hover",
                    style: {
                      backgroundColor,
                      color: "#fff",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                      border: borderStyle,
                      borderRadius: "5px",
                      width, // Apply the width
                    },
                  };
                }}
                components={{
                  event: ({ event }) => (
                    <div
                      onClick={() =>
                        setState((prevState) => ({
                          ...prevState,
                          expandedEvent: event,
                        }))
                      }
                      style={{
                        cursor: "pointer",
                        padding: "5px",
                        backgroundColor:
                          state.activeTab === "Palawan and Boracay"
                            ? event.room === "Palawan"
                              ? "#dc3545"
                              : event.room === "Boracay"
                              ? "#d8a330"
                              : "purple" // Default for other rooms
                            : departmentColors[event.department] || "#45813",
                        color: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        position: "relative",
                        width: "100%", // Ensure width is always 100%
                      }}
                    >
                      <strong>{event.title}</strong>
                      {/* {state.activeTab === "Palawan and Boracay" && (
                        <span
                          style={{
                            fontSize: "0.75em",
                            position: "absolute",
                            bottom: "5px",
                            right: "5px",
                            backgroundColor: "#fff",
                            color:
                              event.room === "Palawan"
                                ? "blue"
                                : event.room === "Boracay"
                                ? "green"
                                : "purple", // Default for other rooms
                            padding: "2px 5px",
                            borderRadius: "3px",
                          }}
                        >
                          {event.room}
                        </span>
                      )} */}
                    </div>
                  ),
                }}
              />
            )}
          </div>
        </div>
        {state.expandedEvent && (
          <EventModal
            event={state.expandedEvent}
            onClose={() =>
              setState((prevState) => ({ ...prevState, expandedEvent: null }))
            }
          />
        )}
      </div>
    </div>
  );
};

export default RoomReservation;
