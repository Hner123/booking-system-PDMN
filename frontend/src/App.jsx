import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './assets/Header.jsx';
import UserLogin from './user/UserLogin.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import Room from './user/reservation/RoomReservation.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <Routes>
        <Route path="/user" element={
            <>
            <UserLogin />
            </>
            } />
          <Route path="/user/dashboard" element={
            <>
            <Header/>
            <UserDashboard />
            </>            
            } />
          <Route path="/user/reserve" element={
            <>
            <Header/>
            <Room />
            </>
            } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
