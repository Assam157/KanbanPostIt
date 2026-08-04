import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';

const ConnectionBoard = () => {
  const { tasks } = useTasks();
  const [selected, setSelected] = useState(null); // task ID
  const [connections, setConnections] = useState([]); // [{ from, to }]
  const boardRef = useRef(null);
  const taskRefs = useRef({}); // store refs to task elements

  const handleTaskClick = (taskId) => {
    if (!selected) {
      setSelected(taskId);
    } else if (selected === taskId) {
      setSelected(null);
    } else {
      setConnections(prev => [...prev, { from: selected, to: taskId }]);
      setSelected(null);
    }
  };

  const removeConnection = (index) => {
    setConnections(prev => prev.filter((_, i) => i !== index));
  };

  // Compute line coordinates between two task cards
  const getLineCoords = (fromId, toId) => {
    const fromEl = taskRefs.current[fromId];
    const toEl = taskRefs.current[toId];
    if (!fromEl || !toEl || !boardRef.current) return null;
    const boardRect = boardRef.current.getBoundingClientRect();
    const fromRect = fromEl.getBoundingClientRect();
    const toRect = toEl.getBoundingClientRect();
    return {
      x1: fromRect.left + fromRect.width/2 - boardRect.left,
      y1: fromRect.top + fromRect.height/2 - boardRect.top,
      x2: toRect.left + toRect.width/2 - boardRect.left,
      y2: toRect.top + toRect.height/2 - boardRect.top,
    };
  };

  return (
    <div ref={boardRef} style={styles.board}>
      <h2>Connection Board – Click two notes to link them</h2>
      <svg style={styles.svg}>
        {connections.map((conn, i) => {
          const coords = getLineCoords(conn.from, conn.to);
          if (!coords) return null;
          return (
            <line
              key={i}
              x1={coords.x1} y1={coords.y1}
              x2={coords.x2} y2={coords.y2}
              stroke="#6c5ce7" strokeWidth="2"
              strokeDasharray="5,5"
              onClick={() => removeConnection(i)}
              style={{ cursor: 'pointer' }}
            />
          );
        })}
      </svg>
      <div style={styles.notesContainer}>
        {tasks.map(task => (
          <div
            key={task._id}
            ref={el => taskRefs.current[task._id] = el}
            onClick={() => handleTaskClick(task._id)}
            style={{
              ...styles.note,
              border: selected === task._id ? '3px solid #6c5ce7' : '1px solid #d4a373',
              background: '#FFF9C4',
              transform: `rotate(${(Math.random()*2-1).toFixed(2)}deg)`,
            }}
          >
            <div style={styles.pin}>📌</div>
            <strong>{task.title}</strong>
            <p>{task.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  board: {
    position: 'relative',
    width: '100%',
    minHeight: '80vh',
    padding: '20px',
    background: 'url("https://www.transparenttextures.com/patterns/corkboard.png"), #d4a373',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // allow clicks through to notes, but lines themselves are clickable
  },
  notesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px',
    justifyContent: 'center',
    marginTop: '30px',
  },
  note: {
    width: '180px',
    minHeight: '100px',
    padding: '16px',
    borderRadius: '2px',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    position: 'relative',
    transition: 'transform 0.2s',
  },
  pin: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '24px',
  },
};

export default ConnectionBoard;