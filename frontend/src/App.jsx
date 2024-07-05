import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../src/user/utilities/Header.jsx';
import UserLogin from './user/UserLogin';
import UserDashboard from './user/UserDashboard';
import Room from './user/reservation/RoomReservation';
import ReservationFormsDetails from './user/reservation/ReservationFormsDetails';
import Edit from '../src/user/utilities/EditProfile.jsx';
import Confirmation from './user/reservation/Confirmation';

import AdminLogin from './admin/AdminLogin.jsx';
import Sidebar from './admin/Sidebar.jsx';
import EmployeeList from './admin/EmployeeList.jsx';

import 'react-datepicker/dist/react-datepicker.css';
import 'rc-time-picker/assets/index.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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
      <Route path ="/admin/log-in" element={
        <>
          <AdminLogin/>
        </>
      }/>
      <Route path = "/admin/employee-list" element={
        <>
        <Sidebar/>
        <EmployeeList/>
        </>
      }/>
      </Routes>
    </Router>
  );
}

export default App;
