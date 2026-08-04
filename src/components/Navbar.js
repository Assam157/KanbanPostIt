import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useServerTime } from '../context/TimeContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { serverTime } = useServerTime();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.brand} onClick={() => navigate('/')}>
        📌 Post-it Kanban
      </div>
      <div style={styles.right}>
        {serverTime && (
          <span style={styles.time}>🕒 {formatTime(serverTime)}</span>
        )}
        {currentUser ? (
          <>
            <span style={styles.user}>
              {currentUser.role === 'admin' ? '👑 Admin' : `👤 ${currentUser.name || currentUser.email}`}
              {currentUser.flagged && <span style={styles.flagBadge}>⚠️</span>}
            </span>
            <button style={styles.navBtn} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <button style={styles.navBtn} onClick={() => navigate('/login')}>Login</button>
            <button style={styles.navBtn} onClick={() => navigate('/register')}>Register</button>
          </>
        )}
        <button style={styles.navBtn} onClick={() => navigate('/board')}>📊 Connection Board</button>
        <button style={styles.navBtn} onClick={() => navigate('/boards')}>👥 Boards</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    background: 'rgba(255, 248, 220, 0.9)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    borderBottom: '2px solid #d4a373',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontSize: '28px',
    fontFamily: 'Caveat, cursive',
    fontWeight: 700,
    color: '#6b4226',
    cursor: 'pointer',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  time: {
    fontSize: '16px',
    background: '#fefae0',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1px dashed #d4a373',
    color: '#6b4226',
    fontWeight: 600,
  },
  user: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '18px',
    color: '#6b4226',
  },
  flagBadge: {
    background: '#ffb4a2',
    borderRadius: '50%',
    padding: '2px 6px',
    fontSize: '14px',
  },
  navBtn: {
    padding: '6px 16px',
    borderRadius: '20px',
    border: '2px solid #d4a373',
    background: '#faedcd',
    color: '#6b4226',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontFamily: 'Indie Flower, cursive',
    fontSize: '16px',
  },
};

export default Navbar;