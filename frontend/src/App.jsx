import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import useStore from './store/useStore';

// We will create these pages next
import LandingPage from './pages/customer/LandingPage';
import QueueStatus from './pages/customer/QueueStatus';
import Login from './pages/admin/Login';
import Signup from './pages/admin/Signup';
import Dashboard from './pages/admin/Dashboard';
import Transactions from './pages/admin/Transactions';
import Analytics from './pages/admin/Analytics';
import Settings from './pages/admin/Settings';
import AdminLayout from './components/layout/AdminLayout';

export const socket = io('http://localhost:5000');

function App() {
  const { user, setShopSettings } = useStore();

  useEffect(() => {
    // Fetch settings on load
    fetch('http://localhost:5000/api/settings')
      .then((res) => res.json())
      .then((data) => setShopSettings(data))
      .catch((err) => console.error(err));
  }, [setShopSettings]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Routes>
        {/* Customer Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/queue" element={<QueueStatus />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={!user ? <Login /> : <Navigate to="/admin/dashboard" />} />
        <Route path="/admin/signup" element={!user ? <Signup /> : <Navigate to="/admin/dashboard" />} />
        
        <Route path="/admin" element={user ? <AdminLayout /> : <Navigate to="/admin/login" />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
