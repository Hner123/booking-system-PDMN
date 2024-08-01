import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Header from './user/utilities/Header.jsx';
import UserLogin from './user/UserLogin';
import UserDashboard from './user/UserDashboard';
import Room from './user/reservation/RoomReservation';
import ReservationFormsDetails from './user/reservation/ReservationFormsDetails';
import Edit from './user/utilities/EditProfile.jsx';
import UserList from './user/utilities/UserList.jsx';
import Confirmation from './user/reservation/Confirmation';

import AdminLogin from './admin/AdminLogin.jsx';
import EmployeeList from './admin/EmployeeList.jsx';
import AddEmployee from './admin/AddEmployee.jsx';
import ApprovalDetails from './admin/ApprovalDetails.jsx';
import ApprovalPalawan from './admin/ApprovalPalawan.jsx';
import ApprovalBoracay from './admin/ApprovalBoracay.jsx';
import ApprovalBoth from './admin/ApprovalBoth.jsx';
import ApprovalRooms from './admin/ApprovalRooms.jsx';
import NotFoundPage from './auth/NotFoundPage.jsx';

import Sidebar from './admin/Sidebar.jsx'

import "react-toastify/dist/ReactToastify.css";
import 'react-datepicker/dist/react-datepicker.css';
import 'rc-time-picker/assets/index.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import MeetingRoomSchedule from './tablet/MeetingRoomSchedule.jsx';

import Verify from './user/utilities/Verify.jsx';
import ForgotPass from './user/utilities/ForgotPass.jsx';
import ResetPass from './user/utilities/ResetPass.jsx';

import './App.css';


function App() {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<UserLogin />} />
        <Route path="/page-not-found" element={<NotFoundPage />} />
        <Route
          path="/dashboard"
          element={
            <>
              <Header />
              <UserDashboard />
            </>
          }
        />
        <Route
          path="/reserve"
          element={
            <>
              <Header />
              <Room />
            </>
          }
        />
        <Route
          path="/reserveform"
          element={
            <>
              <Header />
              <ReservationFormsDetails />
            </>
          }
        />
        <Route
          path="/confirmation"
          element={
            <>
              <Header />
              <Confirmation />
            </>
          }
        />
        <Route
          path="/user/edit"
          element={
            <>
              <Header />
              <Edit />
            </>
          }
        />
        <Route
          path="/employee-list"
          element={
            <>
              <Header />
              <UserList />
            </>
          }
        />
        <Route
          path="/admin"
          element={
            <>
              <AdminLogin />
            </>
          }
        />
        <Route
          path="/admin/employee-list"
          element={
            <>
              <Sidebar />
              <EmployeeList />
            </>
          }
        />
        <Route
          path="/tablet"
          element={
            <>
              <MeetingRoomSchedule />
            </>
          }
        />
        <Route
          path="/admin/add-employee"
          element={
            <>
              <Sidebar />
              <AddEmployee />
            </>
          }
        />
        <Route
          path="/admin/approval-rooms"
          element={
            <>
              <Sidebar />
              <ApprovalRooms />
            </>
          }
        />
        <Route
          path="/admin/approval-palawan"
          element={
            <>
              <Sidebar />
              <ApprovalPalawan />
            </>
          }
        />
        <Route
          path="/admin/approval-boracay"
          element={
            <>
              <Sidebar />
              <ApprovalBoracay />
            </>
          }
        />
        <Route
          path="/admin/approval-both"
          element={
            <>
              <Sidebar />
              <ApprovalBoth />
            </>
          }
        />
        <Route
          path="/admin/approval/:roomName"
          element={
            <>
              <Sidebar />
              <ApprovalDetails />
            </>
          }
        />
        <Route
          path="/verify"
          element={
            <>
              <Verify />
            </>
          }
        />
        <Route
          path="/forgot-pass"
          element={
            <>
              <ForgotPass />
            </>
          }
        />
        <Route
          path="/reset-pass"
          element={
            <>
              <ResetPass />
            </>
        } />     
      </Routes>
    </div>
  );
}

export default App;
