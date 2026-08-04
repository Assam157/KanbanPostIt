 import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.cardRow}>
        <div style={styles.card} onClick={() => navigate('/register')}>
          <div style={styles.iconWrap}><span style={{fontSize:'30px'}}>📝</span></div>
          <h3 style={styles.cardTitle}>Register</h3>
          <p>Create your account</p>
          <div style={styles.cardFooter}><span>Get Started</span><span>→</span></div>
        </div>
        <div style={styles.card} onClick={() => navigate('/login')}>
          <div style={styles.iconWrap}><span style={{fontSize:'30px'}}>🔑</span></div>
          <h3 style={styles.cardTitle}>Login</h3>
          <p>Access your board</p>
          <div style={styles.cardFooter}><span>Sign In</span><span>→</span></div>
        </div>
        <div style={styles.card} onClick={() => navigate('/howto')}>
          <div style={styles.iconWrap}><span style={{fontSize:'30px'}}>📜</span></div>
          <h3 style={styles.cardTitle}>How‑to & Rules</h3>
          <p>Learn how everything works</p>
          <div style={styles.cardFooter}><span>Read More</span><span>→</span></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '30px',
  },
  cardRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '24px',
    maxWidth: '900px',   // wider to fit three cards
    width: '100%',
  },
  card: {
    background: '#fff9e0',
    borderRadius: '8px',
    padding: '24px',
    cursor: 'pointer',
    boxShadow: '3px 4px 8px rgba(0,0,0,0.15)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    transform: 'rotate(-0.5deg)',
    border: '1px solid #d4a373',
    textAlign: 'center',
    fontFamily: 'Indie Flower, cursive',
  },
  iconWrap: {
    width: '60px',
    height: '60px',
    background: '#f4d03f',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
    boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
  },
  cardTitle: {
    fontFamily: 'Caveat, cursive',
    fontSize: '28px',
    color: '#6b4226',
    margin: '8px 0',
  },
  cardFooter: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#6b4226',
    fontWeight: 'bold',
  },
};

export default Home;