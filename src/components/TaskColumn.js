import React from 'react';

const stickyColors = ['#FFF9C4', '#FFCCBC', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#D1C4E9'];

const getRotation = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return (hash % 41) / 10 - 2; // -2 to 2 degrees
};

const TaskColumn = ({ title, status, tasks, moveTask, deleteTask, isOverdue }) => {
  const filtered = tasks.filter(t => t.status === status);

  return (
    <div style={styles.column}>
      <h3 style={styles.header}>{title} ({filtered.length})</h3>
      <div style={styles.list}>
        {filtered.map((task, idx) => {
          const rotation = getRotation(task._id);
          const bgColor = stickyColors[idx % stickyColors.length];
          const overdue = isOverdue(task.deadline);
          return (
            <div
              key={task._id}
              style={{
                ...styles.note,
                transform: `rotate(${rotation}deg)`,
                background: bgColor,
                border: overdue ? '2px solid #d63031' : '1px solid #d4a373',
              }}
            >
              <div style={styles.pin}>📌</div>
              <div style={styles.noteContent}>
                <strong style={{ fontSize: '18px', fontFamily: 'Caveat, cursive' }}>{task.title}</strong>
                {task.deadline && (
                  <span style={{ fontSize: '12px', display: 'block', color: overdue ? '#d63031' : '#555', marginTop: 4 }}>
                    ⏰ {new Date(task.deadline).toLocaleString()}
                  </span>
                )}
                <p style={{ margin: '8px 0', fontSize: '14px', wordBreak: 'break-word' }}>{task.description}</p>
              </div>
              <div style={styles.actions}>
                <button style={styles.moveBtn} onClick={() => moveTask(task._id, 'left')} disabled={status === 'todo'}>←</button>
                <button style={styles.moveBtn} onClick={() => moveTask(task._id, 'right')} disabled={status === 'done'}>→</button>
                <button style={styles.deleteBtn} onClick={() => deleteTask(task._id)}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  column: {
    background: 'url("https://www.transparenttextures.com/patterns/corkboard.png"), #d4a373',
    borderRadius: '12px',
    padding: '16px',
    minHeight: '300px',
    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    fontFamily: 'Caveat, cursive',
    fontSize: '28px',
    color: '#4a2c17',
    textAlign: 'center',
    marginBottom: '16px',
    textShadow: '1px 1px 0 rgba(255,255,255,0.5)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'center',
    flex: 1,
  },
  note: {
    width: '90%',
    maxWidth: '240px',
    minHeight: '120px',
    padding: '16px',
    borderRadius: '2px 2px 4px 2px',
    boxShadow: '2px 3px 6px rgba(0,0,0,0.2), 0 0 15px rgba(0,0,0,0.05) inset',
    position: 'relative',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
  },
  pin: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '24px',
    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
  },
  noteContent: {
    flex: 1,
    overflow: 'hidden',
    marginBottom: '8px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  moveBtn: {
    background: 'rgba(255,255,255,0.7)',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  },
};

export default TaskColumn;