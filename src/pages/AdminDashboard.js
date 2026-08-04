import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/api/tasks/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleFlag = async (userId) => {
    const res = await fetch(`${API_URL}/api/tasks/admin/users/${userId}/flag`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, flagged: updated.flagged } : u));
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Indie Flower, cursive' }}>
      <h2 style={{ fontFamily: 'Caveat, cursive', fontSize: '36px', color: '#4a2c17' }}>Admin Panel</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {users.map(user => (
          <div key={user._id} style={{
            background: '#fff9e0',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '3px 4px 8px rgba(0,0,0,0.15)',
            border: '1px solid #d4a373',
            transform: 'rotate(-0.5deg)',
            position: 'relative',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Caveat, cursive', fontSize: '24px', color: '#6b4226' }}>{user.name}</h3>
              <span style={{ background: '#f4d03f', borderRadius: '12px', padding: '2px 10px', fontSize: '14px' }}>
                {user.taskCount} tasks
              </span>
            </div>
            <p style={{ color: '#6b4226' }}>{user.email}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                onClick={() => navigate(`/admin/user/${user._id}`)}
                style={{
                  background: '#faedcd',
                  border: '2px solid #d4a373',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontFamily: 'Indie Flower, cursive',
                  cursor: 'pointer',
                }}
              >
                View Board
              </button>
              <button
                onClick={() => toggleFlag(user._id)}
                style={{
                  background: user.flagged ? '#ffb4a2' : '#faedcd',
                  border: '2px solid #d4a373',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  fontFamily: 'Indie Flower, cursive',
                  cursor: 'pointer',
                }}
              >
                {user.flagged ? '⚠️ Unflag' : 'Flag'}
              </button>
            </div>
            {user.flagged && <div style={{ marginTop: '10px', background: '#ffe0e0', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' }}>🚩 Flagged</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;