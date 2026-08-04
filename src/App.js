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
import ConnectionBoard from './pages/ConnectionBoard';
import HowToRules from './pages/HowToRules';
import BoardList from './pages/BoardList';                     // new
import CollaborativeBoard from './pages/CollaborativeBoard';   // new
import JoinBoard from './pages/JoinBoard';                     // new
import AdminDashboard from './pages/AdminDashboard';
import AdminUserBoard from './pages/AdminUserBoard';
import ChatBot from './components/ChatBot'; // if you have the AI chatbot

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
              <Route path="/board" element={<ProtectedRoute><ConnectionBoard /></ProtectedRoute>} />
              <Route path="/howto" element={<HowToRules />} />

              {/* ---- Collaborative routes ---- */}
              <Route path="/boards" element={<ProtectedRoute><BoardList /></ProtectedRoute>} />
              <Route path="/board/:boardId" element={<ProtectedRoute><CollaborativeBoard /></ProtectedRoute>} />
              <Route path="/board/:boardId/join" element={<ProtectedRoute><JoinBoard /></ProtectedRoute>} />

              {/* Admin routes (used only in admin app, but keep them here if you want) */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/user/:userId" element={<AdminRoute><AdminUserBoard /></AdminRoute>} />
            </Routes>
            <ChatBot />
          </TimeProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;