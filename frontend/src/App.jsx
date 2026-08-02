import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import useStore from './store/useStore';

// Customer Pages
import LandingPage from './pages/customer/LandingPage';
import QueueStatus from './pages/customer/QueueStatus';

// Admin Pages
import Login from './pages/admin/Login';
import Signup from './pages/admin/Signup';
import Dashboard from './pages/admin/Dashboard';
import Transactions from './pages/admin/Transactions';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import AdminLayout from './components/layout/AdminLayout';

const API_URL = 'https://barber-management-backend.onrender.com';

export const socket = io(API_URL);

// ======================
// Role Selection Page
// ======================
function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700">
            ✂️ TrimFlow
          </h1>

          <p className="text-gray-500 mt-3">
            Barber Queue Management System
          </p>
        </div>

        <button
          onClick={() => navigate('/customer')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl text-lg font-semibold transition duration-300 mb-5"
        >
          👤 Continue as Customer
        </button>

        <button
          onClick={() => navigate('/admin/login')}
          className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl text-lg font-semibold transition duration-300"
        >
          🔐 Continue as Admin
        </button>

      </div>
    </div>
  );
}

function App() {
  const { user, setShopSettings } = useStore();

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then((res) => res.json())
      .then((data) => setShopSettings(data))
      .catch((err) => console.error(err));
  }, [setShopSettings]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Routes>

        {/* Home */}
        <Route path="/" element={<RoleSelection />} />

        {/* Customer */}
        <Route path="/customer" element={<LandingPage />} />
        <Route path="/queue" element={<QueueStatus />} />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={!user ? <Login /> : <Navigate to="/admin/dashboard" />}
        />

        {/* Admin Signup */}
        <Route
          path="/admin/signup"
          element={!user ? <Signup /> : <Navigate to="/admin/dashboard" />}
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={user ? <AdminLayout /> : <Navigate to="/admin/login" />}
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Unknown Route */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </div>
  );
}

export default App;
