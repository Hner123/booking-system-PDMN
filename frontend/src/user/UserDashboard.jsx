import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import roomBg from '../assets/roombg.jpg';
import './User.css';
import { useTable } from 'react-table';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa'; // Importing icons from react-icons

const Dashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showMyReservations, setShowMyReservations] = useState(true);
  const [showOtherMeetings, setShowOtherMeetings] = useState(true);
  const userName = "John Doe"; // Replace with actual user name
  const department = "Starlight";

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

  return (
    <div className="dashboard">
      <main className="dashboard-main">
        <h1>My Dashboard</h1>
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

        {showModal && selectedMeeting && (
          <DetailsModal meeting={selectedMeeting} onClose={handleCloseModal} userName={userName} department={department} />
        )}
      </main>
    </div>
  );
};

const DetailsModal = ({ meeting, onClose, userName, department }) => {
  return (
    <div className="details-modal">
      <div className="details-content">
        <div className="closetab">
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <h2>{meeting.title}</h2>
        <div className="modal-columns">
          <div className="left-content">
            <p><strong>Username:</strong> {userName}</p>
            <p><strong>Department:</strong> {department}</p>
            <p><strong>Number of PAX:</strong></p>
            <p><strong>Purpose of the Meeting:</strong> {meeting.details}</p>
            <p className="members"><strong>Members:</strong> {meeting.members.join(', ')}</p>
          </div>
          <div className="right-content">
            <h3>{meeting.room}</h3>
            <p><strong>Date:</strong> {meeting.date}</p>
            <p><strong>Meeting Start:</strong> {meeting.time}</p>
            <p><strong>Meeting End:</strong> </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
