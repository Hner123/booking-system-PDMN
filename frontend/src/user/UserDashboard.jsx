import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roomBg from '../assets/roombg.jpg';
import './User.css';
import { useTable } from 'react-table';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMyReservations, setShowMyReservations] = useState(true);
  const [showOtherMeetings, setShowOtherMeetings] = useState(true);
  const [firstLogin, setFirstLogin] = useState(true); // Track first login state
  const [isPasswordChangeChecked, setIsPasswordChangeChecked] = useState(false); // Track password change checkbox state

  const [userData, setUsers] = useState(null);
  const [loading, setLoading] = useState(true)

  const userName = "John Doe"; // Replace with actual user name
  const department = "Starlight";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("authToken");
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const response = await axios.get(
          `http://localhost:8800/api/user/${userId}`,
          { headers }
        );
        if (response.status === 200) {
          setUsers(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Mock data for reservations and other meetings
  const [reservations, setReservations] = useState([
    {
      title: 'Team Sync',
      status: 'Pending',
      date: '2024-07-03',
      time: '10:00 AM',
      room: 'Palawan',
      creator: userName,
      members: ['John Doe', 'Jane Smith', 'Alex Johnson'],
      details: 'This is a team sync meeting',
    },
    {
      title: 'Client Meeting',
      status: 'Approved',
      date: '2024-07-04',
      time: '02:00 PM',
      room: 'Boracay',
      creator: userName,
      members: ['Client A', 'Client B'],
      details: 'This is a client meeting',
    },
    {
      title: 'New Project',
      status: 'Approved',
      date: '2024-07-03',
      time: '11:00 AM',
      room: 'Palawan',
      creator: userName,
      members: ['John Doe', 'Jane Smith', 'Alex Johnson'],
      details: 'This is a team sync meeting',
    },
    {
      title: 'Business Meeting',
      status: 'Approved',
      date: '2024-07-04',
      time: '05:00 PM',
      room: 'Boracay',
      creator: userName,
      members: ['Client A', 'Client B'],
      details: 'This is a client meeting',
    },
  ]);

  const otherMeetings = [
    {
      title: 'Project Kickoff',
      status: 'Approved',
      date: '2024-07-05',
      time: '09:00 AM',
      room: 'Palawan',
      creator: 'John Smith',
      members: ['John Smith', 'Jane Doe'],
      details: 'Starting a new project',
    },
    {
      title: 'Training Session',
      status: 'Pending',
      date: '2024-07-06',
      time: '11:00 AM',
      room: 'Boracay',
      creator: 'Alex Johnson',
      members: ['Alex Johnson', 'Emily Brown'],
      details: 'Training on new software tools',
    },
  ];

  const rooms = ["Palawan", "Boracay", "Palawan and Boracay"];

  const handleReserveClick = () => {
    navigate('/reserve');
  };

  const handleMeetingClick = (meeting) => {
    setSelectedMeeting(meeting);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDeleteReservation = (index) => {
    setReservations((prevReservations) =>
      prevReservations.filter((_, i) => i !== index)
    );
  };

  const toggleMyReservations = () => {
    setShowMyReservations(!showMyReservations);
  };

  const toggleOtherMeetings = () => {
    setShowOtherMeetings(!showOtherMeetings);
  };

  const myReservationsColumns = React.useMemo(
    () => [
      { Header: 'Meeting Title', accessor: 'title' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span className={`status ${value.toLowerCase()}`}>{value}</span>
        ),
      },
      { Header: 'Date', accessor: 'date' },
      { Header: 'Time', accessor: 'time' },
      { Header: 'Meeting Room', accessor: 'room' },
      { Header: 'Meeting Creator', accessor: 'creator' },
      {
        Header: '',
        accessor: 'actions',
        Cell: ({ row }) => (
          <>
            <button className="full-btn" onClick={() => handleMeetingClick(row.original)}>
              <i className="fas fa-info-circle"></i> Details
            </button>
            <button className="delete-btn" onClick={() => handleDeleteReservation(row.index)}>
              <i className="fas fa-trash-alt"></i> Cancel Meeting
            </button>
          </>
        ),
      },
    ],
    []
  );

  const otherMeetingsColumns = React.useMemo(
    () => [
      { Header: 'Meeting Title', accessor: 'title' },
      {
        Header: 'Status',
        accessor: 'status',
        Cell: ({ value }) => (
          <span className={`status ${value.toLowerCase()}`}>{value}</span>
        ),
      },
      { Header: 'Date', accessor: 'date' },
      { Header: 'Time', accessor: 'time' },
      { Header: 'Meeting Room', accessor: 'room' },
      { Header: 'Meeting Creator', accessor: 'creator' },
      {
        Header: '',
        accessor: 'actions',
        Cell: ({ row }) => (
          <button className="full-btn" onClick={() => handleMeetingClick(row.original)}>
            <i className="fas fa-info-circle"></i> Details
          </button>
        ),
      },
    ],
    []
  );

  const myReservationsTable = useTable({ columns: myReservationsColumns, data: reservations });
  const otherMeetingsTable = useTable({ columns: otherMeetingsColumns, data: otherMeetings });

  const handleRegistrationSubmit = (event) => {
    event.preventDefault();
    // Handle registration form submission here
    // For example, you can update user state to indicate registration completion
    setFirstLogin(false);
  };

  const handleCheckboxChange = (event) => {
    setIsPasswordChangeChecked(event.target.checked);
  };

  return (
    <div className="dashboard">
      {firstLogin && (
        <div className="modal-overlay">
          <div className="registration-form-modal">
            {userData && (
              <h2>Welcome, {userData.userName}!</h2>
            )}
            <form onSubmit={handleRegistrationSubmit}>
              <div className="form-section">
                <label htmlFor="email">Email Address</label>
                <p>*Please enter your email address so we can notify you about confirmations, advisory, etc.</p>
                <input type="email" id="email" placeholder="Placeholder" required />
              </div>
              <div className="form-section">
                <label htmlFor="department">Department</label>
                <p>*Please enter your designated department for specification of the meeting.</p>
                <select id="department" required>
                  <option value="" disabled selected>Placeholder</option>
                  <option value="Starlight">Starlight</option>
                  <option value="Moonlight">Moonlight</option>
                </select>
              </div>
              <div className="form-section-divider"></div>
              <div className="pass-section">
                <p>Would you like to change the password that was provided?<br />
                  If yes, please check the box to set a new password. If not, leave the box empty.</p>
                <div className="form-check">
                  <input
                    type="checkbox"
                    id="change-password"
                    checked={isPasswordChangeChecked}
                    onChange={handleCheckboxChange}
                  />
                  <label htmlFor="change-password">Yes, I want to change my initial password.</label>
                </div>
                {isPasswordChangeChecked && (
                  <>
                  <div className="newpass-section">
                    <label htmlFor="new-password">*Please enter your new password.</label>
                    <input
                      type="password"
                      id="new-password"
                      placeholder="Placeholder"
                      required
                    />
                  </div>
                  </>
                )}
              </div>
              <button type="submit">Log In</button>
            </form>
          </div>
        </div>
      )}
      <main className="dashboard-main">
        <h1>My Dashboard</h1>
        
        {!firstLogin && ( // Render meeting rooms cards if it's not the first login
          <>
            <h2>Book a Meeting Room</h2>
            <div className="card-container">
              {rooms.map((place, index) => (
                <div key={`room-${index}`} className="card" style={{ backgroundImage: `url(${roomBg})` }}>
                  <div className="overlay">
                    <h3>{place}</h3>
                    <button className="reserve-btn" onClick={handleReserveClick}>
                      Reserve
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Render my reservations table */}
            <div className="toggle-header" onClick={toggleMyReservations}>
              <h2>
                My Reservations ({reservations.length}){' '}
                {showMyReservations ? <FaChevronDown /> : <FaChevronRight />}
              </h2>
            </div>
            {showMyReservations && (
              <div className="table-container">
                <table className="reservation-table" {...myReservationsTable.getTableProps()}>
                  <thead>
                    {myReservationsTable.headerGroups.map(headerGroup => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                          <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...myReservationsTable.getTableBodyProps()}>
                    {myReservationsTable.rows.map(row => {
                      myReservationsTable.prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map(cell => (
                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Render other meetings table */}
            <div className="toggle-header" onClick={toggleOtherMeetings}>
              <h2>
                Other Meetings ({otherMeetings.length}){' '}
                {showOtherMeetings ? <FaChevronDown /> : <FaChevronRight />}
              </h2>
            </div>
            {showOtherMeetings && (
              <div className="table-container">
                <table className="reservation-table1" {...otherMeetingsTable.getTableProps()}>
                  <thead>
                    {otherMeetingsTable.headerGroups.map(headerGroup => (
                      <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                          <th {...column.getHeaderProps()}>{column.render('Header')}</th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody {...otherMeetingsTable.getTableBodyProps()}>
                    {otherMeetingsTable.rows.map(row => {
                      otherMeetingsTable.prepareRow(row);
                      return (
                        <tr {...row.getRowProps()}>
                          {row.cells.map(cell => (
                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Meeting Details Modal */}
            {showModal && selectedMeeting && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2>{selectedMeeting.title}</h2>
                  <p><strong>Status:</strong> {selectedMeeting.status}</p>
                  <p><strong>Date:</strong> {selectedMeeting.date}</p>
                  <p><strong>Time:</strong> {selectedMeeting.time}</p>
                  <p><strong>Room:</strong> {selectedMeeting.room}</p>
                  <p><strong>Creator:</strong> {selectedMeeting.creator}</p>
                  <p><strong>Members:</strong> {selectedMeeting.members.join(', ')}</p>
                  <p><strong>Details:</strong> {selectedMeeting.details}</p>
                  <button className="close-btn" onClick={handleCloseModal}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
