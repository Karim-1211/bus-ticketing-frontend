import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Login.js';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BusManagement from './pages/BusManagement';
import RouteManagement from './pages/RouteManagement';
import ScheduleManagement from './pages/ScheduleManagement';
import BookTicket from './pages/BookTicket';
import WalkinBooking from './pages/WalkinBooking';
import BookingHistory from './pages/BookingHistory';
import Reports from './pages/Reports';
import ManageStaff from './pages/ManageStaff';
import Navbar from './components/Navbar';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<><Navbar /><Dashboard /></>} />
        <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/buses" element={<PrivateRoute><Navbar /><BusManagement /></PrivateRoute>} />
        <Route path="/routes" element={<PrivateRoute><Navbar /><RouteManagement /></PrivateRoute>} />
        <Route path="/schedules" element={<PrivateRoute><Navbar /><ScheduleManagement /></PrivateRoute>} />
        <Route path="/walkin" element={<PrivateRoute><Navbar /><WalkinBooking /></PrivateRoute>} />
        <Route path="/book" element={<PrivateRoute><Navbar /><BookTicket /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><Navbar /><BookingHistory /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Navbar /><Reports /></PrivateRoute>} />
        <Route path="/staff" element={<PrivateRoute><Navbar /><ManageStaff /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;