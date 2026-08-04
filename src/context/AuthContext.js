 import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const API_URL = process.env.REACT_APP_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const setAuthToken = (newToken) => {
    setToken(newToken);
    if (newToken) localStorage.setItem('token', newToken);
    else localStorage.removeItem('token');
  };

  const fetchUser = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
      } else {
        setAuthToken(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchUser(); }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password) => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const logout = () => {
    setAuthToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};