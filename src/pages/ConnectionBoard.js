 import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { getRotation } from '../utils';

const stickyColors = ['#FFF9C4', '#FFCCBC', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#D1C4E9'];

const ConnectionBoard = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const [selected, setSelected] = useState(null);
  const [connections, setConnections] = useState([]);

  // Position state: { [taskId]: { x: number, y: number } }
  const [positions, setPositions] = useState({});
  const boardRef = useRef(null);
  const taskRefs = useRef({});

  // --- Drag state ---
  const [dragging, setDragging] = useState(null); // taskId being dragged
  const dragOffset = useRef({ x: 0, y: 0 });
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Initial random placement inside board (once tasks load)
  useEffect(() => {
    if (!boardRef.current) return;
    const boardWidth = boardRef.current.clientWidth;
    const boardHeight = boardRef.current.clientHeight || 600;
    const newPos = {};
    tasks.forEach((task) => {
      if (!positions[task._id]) {
        newPos[task._id] = {
          x: Math.random() * (boardWidth - 220) + 20,
          y: Math.random() * (boardHeight - 160) + 80,
        };
      }
    });
    if (Object.keys(newPos).length > 0) {
      setPositions(prev => ({ ...prev, ...newPos }));
    }
  }, [tasks]);

  // --- Dragging handlers ---
  const handleMouseDown = (e, taskId) => {
    e.stopPropagation();
    const pos = positions[taskId];
    if (!pos) return;
    setDragging(taskId);
    // Calculate offset from mouse to element's top-left corner
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging) return;
      const board = boardRef.current;
      if (!board) return;
      const boardRect = board.getBoundingClientRect();
      const newX = e.clientX - boardRect.left - dragOffset.current.x;
      const newY = e.clientY - boardRect.top - dragOffset.current.y;

      setPositions(prev => ({
        ...prev,
        [dragging]: { x: newX, y: newY },
      }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      if (dragging) setDragging(null);
    };

    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // --- Connection logic ---
  const handleTaskClick = (taskId) => {
    if (dragging) return; // ignore clicks during drag
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

  // --- Line geometry ---
  const getLineCoords = useCallback((fromId, toId) => {
    const fromPos = positions[fromId];
    const toPos = positions[toId];
    if (!fromPos || !toPos) return null;
    // Use the centre of the note (approx half its size)
    const noteWidth = 180;
    const noteHeight = 100;
    return {
      x1: fromPos.x + noteWidth / 2,
      y1: fromPos.y + noteHeight / 2,
      x2: toPos.x + noteWidth / 2,
      y2: toPos.y + noteHeight / 2,
    };
  }, [positions]);

  const getLineMidpoint = (fromId, toId) => {
    const coords = getLineCoords(fromId, toId);
    if (!coords) return null;
    return {
      x: (coords.x1 + coords.x2) / 2,
      y: (coords.y1 + coords.y2) / 2,
    };
  };

  const getTaskTitle = (id) => {
    const task = tasks.find(t => t._id === id);
    return task ? task.title : 'Unknown';
  };

  return (
    <div
      ref={boardRef}
      style={{
        ...styles.board,
        userSelect: dragging ? 'none' : 'auto', // prevent text selection while dragging
      }}
    >
      {/* Back button */}
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
        ← Back to Board
      </button>

      <h2 style={styles.title}>Connection Board</h2>
      <p style={styles.instructions}>
        Drag notes to reposition. Click two notes to connect them. Click ✕ on a line to remove it.
      </p>

      {/* SVG layer for arrows */}
      <svg style={styles.svg}>
        {connections.map((conn, i) => {
          const coords = getLineCoords(conn.from, conn.to);
          if (!coords) return null;
          return (
            <line
              key={i}
              x1={coords.x1} y1={coords.y1}
              x2={coords.x2} y2={coords.y2}
              stroke="#6c5ce7"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
          );
        })}
      </svg>

      {/* Remove buttons placed at line midpoints */}
      {connections.map((conn, i) => {
        const mid = getLineMidpoint(conn.from, conn.to);
        if (!mid) return null;
        return (
          <button
            key={`btn-${i}`}
            onClick={() => removeConnection(i)}
            style={{
              ...styles.removeBtn,
              left: mid.x,
              top: mid.y,
            }}
          >
            ✕ Remove
          </button>
        );
      })}

      {/* Draggable post‑it notes */}
      {tasks.map((task, idx) => {
        const pos = positions[task._id];
        if (!pos) return null; // skip until position is set
        const rotation = getRotation(task._id);
        const bgColor = stickyColors[idx % stickyColors.length];
        return (
          <div
            key={task._id}
            ref={(el) => (taskRefs.current[task._id] = el)}
            onMouseDown={(e) => handleMouseDown(e, task._id)}
            onClick={() => handleTaskClick(task._id)}
            style={{
              ...styles.note,
              left: pos.x,
              top: pos.y,
              transform: `rotate(${rotation}deg)`,
              background: bgColor,
              border: selected === task._id ? '3px solid #6c5ce7' : '1px solid #d4a373',
              boxShadow:
                selected === task._id
                  ? '0 0 15px rgba(108,92,231,0.4)'
                  : dragging === task._id
                  ? '0 10px 20px rgba(0,0,0,0.3)'
                  : '2px 3px 6px rgba(0,0,0,0.2)',
              cursor: dragging === task._id ? 'grabbing' : 'grab',
              zIndex: dragging === task._id ? 10 : 2,
              transition: dragging ? 'none' : 'box-shadow 0.2s',
            }}
          >
            <div style={styles.pin}>📌</div>
            <strong style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>
              {task.title}
            </strong>
            <p style={{ fontSize: '14px', margin: '8px 0' }}>{task.description}</p>
            <span style={{ fontSize: '12px', color: '#555' }}>{task.status}</span>
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  board: {
    position: 'relative',
    width: '100%',
    minHeight: '85vh',
    padding: '30px',
    background: 'url("https://www.transparenttextures.com/patterns/corkboard.png"), #d4a373',
    boxShadow: 'inset 0 0 30px rgba(0,0,0,0.2)',
    overflow: 'auto',
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
  title: {
    fontFamily: 'Caveat, cursive',
    fontSize: '36px',
    color: '#4a2c17',
    textAlign: 'center',
    margin: '0 0 10px',
  },
  instructions: {
    textAlign: 'center',
    color: '#6b4226',
    fontFamily: 'Indie Flower, cursive',
    fontSize: '18px',
    marginBottom: '10px',
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 1,
  },
  note: {
    position: 'absolute',
    width: '180px',
    minHeight: '100px',
    padding: '16px',
    borderRadius: '2px',
    transition: 'box-shadow 0.2s',
  },
  pin: {
    position: 'absolute',
    top: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '24px',
    filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))',
  },
  removeBtn: {
    position: 'absolute',
    transform: 'translate(-50%, 8px)',
    zIndex: 3,
    background: '#ffb4a2',
    border: '1px solid #d63031',
    borderRadius: '4px',
    padding: '2px 8px',
    fontSize: '12px',
    fontFamily: 'Indie Flower, cursive',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
};

export default ConnectionBoard;