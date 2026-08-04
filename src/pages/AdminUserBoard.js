import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServerTime } from '../context/TimeContext';
import TaskColumn from '../components/TaskColumn';

const API_URL = process.env.REACT_APP_API_URL || '';

const AdminUserBoard = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { serverTime } = useServerTime();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch(`${API_URL}/api/tasks/admin/users/${userId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    };
    fetchTasks();
  }, [userId, token]);

  const moveTask = async (taskId, direction) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    const statusOrder = ['todo', 'inprogress', 'done'];
    const currentIdx = statusOrder.indexOf(task.status);
    const newIdx = direction === 'left' ? currentIdx - 1 : currentIdx + 1;
    if (newIdx >= 0 && newIdx < statusOrder.length) {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusOrder[newIdx] }),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: statusOrder[newIdx] } : t));
      }
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

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return serverTime && new Date(deadline) < serverTime;
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Indie Flower, cursive' }}>
      <button onClick={() => navigate('/admin')} style={{ background: 'none', border: 'none', color: '#6b4226', fontFamily: 'Indie Flower, cursive', cursor: 'pointer', fontSize: '18px', marginBottom: '20px' }}>
        ← Back to Admin
      </button>
      <h2 style={{ fontFamily: 'Caveat, cursive', fontSize: '32px', color: '#4a2c17' }}>User Board (Admin View)</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <TaskColumn title="To Do" status="todo" tasks={tasks} moveTask={moveTask} deleteTask={deleteTask} isOverdue={isOverdue} />
        <TaskColumn title="In Progress" status="inprogress" tasks={tasks} moveTask={moveTask} deleteTask={deleteTask} isOverdue={isOverdue} />
        <TaskColumn title="Done" status="done" tasks={tasks} moveTask={moveTask} deleteTask={deleteTask} isOverdue={isOverdue} />
      </div>
    </div>
  );
};

export default AdminUserBoard;