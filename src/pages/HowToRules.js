import React from 'react';
import { useNavigate } from 'react-router-dom';

const HowToRules = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Back button */}
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← Back to Home
        </button>

        <h2 style={styles.mainTitle}>How to Use the Kanban Board</h2>

        {/* Section: Getting Started */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📝 Getting Started</h3>
          <ul style={styles.list}>
            <li>Register an account or login if you already have one.</li>
            <li>Once logged in, you'll see your personal <strong>Post‑it Board</strong>.</li>
            <li>
              Click <strong>✚ Add a sticky note</strong> to create a new task.
            </li>
            <li>Each task can have a title, optional description, and an optional deadline.</li>
          </ul>
        </div>

        {/* Section: Using the Board */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📌 Using the Board</h3>
          <ul style={styles.list}>
            <li>
              Your board has three columns: <strong>To Do</strong>, <strong>In Progress</strong>, and <strong>Done</strong>.
            </li>
            <li>
              Move a task between columns using the <strong>←</strong> and <strong>→</strong> buttons on each note.
            </li>
            <li>Click the 🗑️ button to delete a task permanently.</li>
            <li>If a task has a deadline, it will turn red when overdue.</li>
          </ul>
        </div>

        {/* Section: Connection Board */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🔗 Connection Board</h3>
          <ul style={styles.list}>
            <li>
              Access the <strong>Connection Board</strong> from the navbar.
            </li>
            <li>
              Here you can see all your tasks spread out on a large corkboard.
            </li>
            <li>Click two notes to draw a dashed line between them.</li>
            <li>Drag notes around – the lines will follow.</li>
            <li>Click the ✕ button on any line to remove it.</li>
          </ul>
        </div>

        {/* Section: Rules & Guidelines */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>📜 Rules & Guidelines</h3>
          <ul style={styles.list}>
            <li>Use the board for personal task management – keep it organised.</li>
            <li>No offensive or inappropriate content on task cards.</li>
            <li>Deadlines are based on the server clock – make sure to set them correctly.</li>
            <li>Administrators can view and moderate content; keep it friendly!</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '30px',
    background: '#fdf6e3',
    fontFamily: 'Indie Flower, cursive',
    display: 'flex',
    justifyContent: 'center',
  },
  container: {
    maxWidth: '700px',
    width: '100%',
  },
  backBtn: {
    display: 'inline-block',
    marginBottom: '20px',
    background: '#faedcd',
    border: '2px solid #d4a373',
    borderRadius: '6px',
    padding: '6px 14px',
    fontFamily: 'Indie Flower, cursive',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#6b4226',
  },
  mainTitle: {
    fontFamily: 'Caveat, cursive',
    fontSize: '36px',
    color: '#4a2c17',
    textAlign: 'center',
    marginBottom: '30px',
  },
  section: {
    background: '#fff9e0',
    border: '1px solid #d4a373',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.1)',
    transform: 'rotate(-0.3deg)',
  },
  sectionTitle: {
    fontFamily: 'Caveat, cursive',
    fontSize: '28px',
    color: '#6b4226',
    margin: '0 0 12px',
  },
  list: {
    paddingLeft: '20px',
    fontSize: '18px',
    color: '#5a3e2b',
    lineHeight: '1.8',
  },
};

export default HowToRules;