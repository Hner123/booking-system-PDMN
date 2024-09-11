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
          <button
                onClick={() => setEditDeptModal(false)}
                className="cancel-button"
              >Delete</button>
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
    "Philippine Dragon Media Network": "#C0392B",
    "GDS Capital": "#E74C3C",
    "GDS Travel Agency": "#F39C12",
    "FEILONG Legal": "#D4AC0D",
    STARLIGHT: "#F7DC6F",
    "Dragon AI": "#1E8449",
    SuperNova: "#E59866",
    ClearPath: "#2874A6",
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
                style={{
                  height:
                    state.activeTab === "Palawan and Boracay"
                      ? "1000px"
                      : "815px",
                }}
                defaultView={Views.WEEK}
                views={[Views.WEEK, Views.DAY, Views.AGENDA]}
                min={new Date(2024, 7, 1, 7, 0)} // Limits the start time to 7 AM
                max={new Date(2024, 7, 1, 20, 0)} // Limits the end time to 8 PM
                eventPropGetter={(event) => {
                  let backgroundColor;
                
                  if (state.activeTab === "Palawan and Boracay") {
                    if (event.room === "Palawan") {
                      backgroundColor = "#C0392B"; // Red color for Palawan
                    } else if (event.room === "Boracay") {
                      backgroundColor = "#F39C12"; // Yellow color for Boracay
                    } else if (event.room === "Palawan and Boracay") {
                      backgroundColor = "#2874A6"; // Blue color for combined room
                    } else {
                      backgroundColor = "purple"; // Default color for other rooms
                    }
                  } else {
                    backgroundColor = departmentColors[event.department] || "#45813"; // Default department color
                  }
                
                  return {
                    className: "event-hover",
                    style: {
                      backgroundColor,
                      color: "#fff",
                      cursor: "pointer",
                      transition: "background-color 0.3s",
                      borderRadius: "5px",
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
                              ? "#C0392B"
                              : event.room === "Boracay"
                              ? "#F39C12"
                              : event.room === "Palawan and Boracay"
                              ? "#2874A6" // Color for events where the room is "Palawan and Boracay"
                              : "#E74C3C" // Fallback color in case none of the conditions match
                            : departmentColors[event.department] || "#45813", // Default color for other tabs
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
                    </div>
                  ),
                }}
              />
            )}
          </div>

          {/* Conditionally render the legend based on activeTab */}
          <div className="dpt-legend">
            {state.activeTab === "Palawan and Boracay" ? (
              <>
                <div className="legend-item">
                  <span className="pdmn"></span>
                  <p>Palawan</p>
                </div>
                <div className="legend-item">
                  <span className="gds"></span>
                  <p>Boracay</p>
                </div>
                <div className="legend-item">
                  <span className="cp"></span>
                  <p>Palawan and Boracay</p>
                </div>
              </>
            ) : (
              <>
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
              </>
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
