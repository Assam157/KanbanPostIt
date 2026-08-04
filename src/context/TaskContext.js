 import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useAuth } from './AuthContext';

const TaskContext = createContext();
export const useTasks = () => useContext(TaskContext);

const API_URL = process.env.REACT_APP_API_URL || '';

export const TaskProvider = ({ children }) => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setTasks(data);
    }
  }, [token]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (title, description, deadline) => {
    const res = await fetch(`${API_URL}/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, description, deadline }),
    });
    if (res.ok) {
      const newTask = await res.json();
      setTasks(prev => [...prev, newTask]);
    }
  };

  // NEW: moveTask now takes a target status ('todo', 'inprogress', 'done')
  const moveTask = async (taskId, newStatus) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    if (task.status === newStatus) return; // no change
    const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
    }
  };

  const deleteTask = async (taskId) => {
    const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    }
  };

  return (
    <TaskContext.Provider value={{ tasks, fetchTasks, addTask, moveTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};