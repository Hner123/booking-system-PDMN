import React from 'react';
import { useNavigate } from 'react-router-dom';
import roomBg from '../assets/roombg.jpg'; // Adjust path to your room background image
import './User.css';

const room = ["Palawan", "Boracay", "Palawan and Boracay"];

const Dashboard = () => {
    const navigate = useNavigate();

    const handleReserveClick = () => {
        navigate('/reserve');
    };

    return (
        <div className="dashboard">
            <main className="dashboard-main">
                <h1>My Dashboard</h1>
                <h2>Book a Meeting Room</h2>
                <div className="card-container">
                    {room.map((place, index) => (
                        <div
                            key={index}
                            className="card"
                            style={{ backgroundImage: `url(${roomBg})` }}
                        >
                            <div className="overlay">
                                <h3>{place}</h3>
                                <button className="reserve-btn" onClick={handleReserveClick}>
                                    Reserve
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <h2>My Reservations</h2>
                <table className="reservation-table">
                    <thead>
                        <tr>
                            <th>Meeting Title</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Meeting Room</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <a href="#" className="meeting-link">Team Sync</a>
                            </td>
                            <td>
                                <span className="status pending">Pending</span>
                            </td>
                            <td>2024-07-03</td>
                            <td>10:00 AM</td>
                            <td>Room A</td>
                        </tr>
                        <tr>
                            <td>
                                <a href="#" className="meeting-link">Client Meeting</a>
                            </td>
                            <td>
                                <span className="status approved">Approved</span>
                            </td>
                            <td>2024-07-04</td>
                            <td>02:00 PM</td>
                            <td>Room B</td>
                        </tr>
                        {/* Add more reservation rows as needed */}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default Dashboard;
