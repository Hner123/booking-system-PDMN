import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserLogin from './user/UserLogin';
import UserDashboard from './user/UserDashboard';
import Room from './user/reservation/RoomReservation';
import ReservationFormsDetails from './user/reservation/ReservationFormsDetails';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/user" element={<UserLogin />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/reserve" element={<Room />} />
        <Route path="/user/reserveform" element={<ReservationFormsDetails />} />
      </Routes>
    </Router>
  );
}

export default App;