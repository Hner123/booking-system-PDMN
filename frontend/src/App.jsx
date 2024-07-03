import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '/src/assets/utilities/Header.jsx';
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
        <Route path="/user/dashboard" element={
          <>
            <Header />
            <UserDashboard />
          </>
        } />
        <Route path="/user/reserve" element={
          <>
            <Header />
            <Room />
          </>
        } />
        <Route path="/user/reserveform" element={
          <>
            <Header />
            <ReservationFormsDetails />
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;