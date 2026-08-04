 import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { TimeProvider } from './context/TimeContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ThreeBackground from './components/ThreeBackground';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUserBoard from './pages/AdminUserBoard';
import ConnectionBoard from './pages/ConnectionBoard';
import HowToRules from './pages/HowToRules';
// Remove the old import
// import AIChat from './components/AIChat';

// Add the new import
import ChatBot from './components/ChatBot';
 
 
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <TimeProvider>
            <ThreeBackground />
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/user/:userId" element={<AdminRoute><AdminUserBoard /></AdminRoute>} />
              <Route path="/board" element={<ProtectedRoute><ConnectionBoard /></ProtectedRoute>} />
              <Route path="/howto" element={<HowToRules />} />            
            </Routes>
             <ChatBot />
          </TimeProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;