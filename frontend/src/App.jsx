import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Header from "./user/utilities/Header.jsx";
import Sidebar from "./admin/Sidebar.jsx";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "rc-time-picker/assets/index.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./App.css";

// User Imports
import UserLogin from "./user/UserLogin";
import UserDashboard from "./user/UserDashboard";
import Room from "./user/reservation/RoomReservation";
import ReservationFormsDetails from "./user/reservation/ReservationFormsDetails";
import Edit from "./user/utilities/EditProfile.jsx";
import UserList from "./user/utilities/UserList.jsx";
import Confirmation from "./user/reservation/Confirmation";
import Verify from "./user/utilities/Verify.jsx";
import ForgotPass from "./user/utilities/ForgotPass.jsx";
import ResetPass from "./user/utilities/ResetPass.jsx";

// Admin Imports
import AdminLogin from "./admin/AdminLogin.jsx";
import AdminDashboard from "./admin/AdminDashboard.jsx";
import EmployeeList from "./admin/EmployeeList.jsx";
import AddEmployee from "./admin/AddEmployee.jsx";
import ApprovalDetails from "./admin/ApprovalDetails.jsx";
import Calendar from "./admin/Calendar.jsx";
import ApprovalPalawan from "./admin/ApprovalPalawan.jsx";
import ApprovalRooms from "./admin/ApprovalRooms.jsx";

// Other Imports
import NotFoundPage from "./auth/NotFoundPage.jsx";
import MeetingRoomSchedule from "./tablet/MeetingRoomSchedule.jsx";

// Layout Components for Reusability
const UserLayout = ({ children }) => (
  <>
    <Header />
    {children}
  </>
);

const AdminLayout = ({ children }) => (
  <>
    <Sidebar />
    {children}
  </>
);

// Protected Route for Admin Pages
const ProtectedAdminRoute = ({ isLoggedIn, children }) => {
  return isLoggedIn ? children : <Navigate to="/admin" />;
};

function App() {
  const isLoggedIn = localStorage.getItem("adminToken");

  return (
    <div>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<UserLogin />} />
        <Route path="/page-not-found" element={<NotFoundPage />} />
        <Route path="/tablet" element={<MeetingRoomSchedule />} />

        {/* User Routes */}
        <Route
          path="/dashboard"
          element={
            <UserLayout>
              <UserDashboard />
            </UserLayout>
          }
        />
        <Route
          path="/reserve"
          element={
            <UserLayout>
              <Room />
            </UserLayout>
          }
        />
        <Route
          path="/reserveform"
          element={
            <UserLayout>
              <ReservationFormsDetails />
            </UserLayout>
          }
        />
        <Route
          path="/confirmation"
          element={
            <UserLayout>
              <Confirmation />
            </UserLayout>
          }
        />
        <Route
          path="/user/edit"
          element={
            <UserLayout>
              <Edit />
            </UserLayout>
          }
        />
        <Route
          path="/employee-list"
          element={
            <UserLayout>
              <UserList />
            </UserLayout>
          }
        />
        <Route path="/verify-success/:userId" element={<Verify />} />
        <Route path="/forgot-pass" element={<ForgotPass />} />
        <Route path="/reset-pass/:userId" element={<ResetPass />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            isLoggedIn ? <Navigate to="/admin/dashboard" /> : <AdminLogin />
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/employee-list"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn}>
              <AdminLayout>
                <EmployeeList />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/add-employee"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn}>
              <AdminLayout>
                <AddEmployee />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/calendar"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn}>
              <AdminLayout>
                <Calendar />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/approval-rooms"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn}>
              <AdminLayout>
                <ApprovalRooms />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/approval-palawan"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn}>
              <AdminLayout>
                <ApprovalPalawan />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
        <Route
          path="/admin/approval/:roomName"
          element={
            <ProtectedAdminRoute isLoggedIn={isLoggedIn}>
              <AdminLayout>
                <ApprovalDetails />
              </AdminLayout>
            </ProtectedAdminRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
