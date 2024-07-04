import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '/src/assets/utilities/Header.jsx';
import UserLogin from './user/UserLogin';
import UserDashboard from './user/UserDashboard';
import Room from './user/reservation/RoomReservation';
import ReservationFormsDetails from './user/reservation/ReservationFormsDetails';
import Edit from '/src/assets/utilities/EditProfile.jsx';
import Confirmation from './user/reservation/Confirmation';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/dashboard" element={
          <>
            <Header />
            <UserDashboard />
          </>
        } />
        <Route path="/reserve" element={
          <>
            <Header />
            <Room />
          </>
        } />
        <Route path="/reserveform" element={
          <>
            <Header />
            <ReservationFormsDetails />
          </>
        } />
        <Route path="/confirmation" element={
          <>
            <Header />
            <Confirmation />
          </>
        } />
        <Route path ="/user/edit" element={
          <>
            <Edit />
          </>
        } />

      </Routes>
    </Router>
  );
}

export default App;
