 import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useWindowSize } from '../hooks/useWindowSize';
import { getRotation } from '../utils';

const stickyColors = ['#FFF9C4', '#FFCCBC', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#D1C4E9'];

const ConnectionBoard = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { isMobile } = useWindowSize();

  const [selected, setSelected] = useState(null);
  const [connections, setConnections] = useState([]);
  const [positions, setPositions] = useState({});
  const boardRef = useRef(null);
  const taskRefs = useRef({});
  const [dragging, setDragging] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Helper to get absolute centre of a task card
  const getTaskCenter = (taskId) => {
    const el = taskRefs.current[taskId];
    const board = boardRef.current;
    if (!el || !board) return null;
    const boardRect = board.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x: elRect.left + elRect.width / 2 - boardRect.left,
      y: elRect.top + elRect.height / 2 - boardRect.top,
    };
  };

  const getLineMidpoint = (fromId, toId) => {
    const from = getTaskCenter(fromId);
    const to = getTaskCenter(toId);
    if (!from || !to) return null;
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  };

  // Random initial positions (only on first load)
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
      setPositions((prev) => ({ ...prev, ...newPos }));
    }
  }, [tasks, positions]);

  // ---------- Drag start ----------
  const handleDragStart = (clientX, clientY, taskId) => {
    const pos = positions[taskId];
    if (!pos) return;
    setDragging(taskId);
    dragOffset.current = {
      x: clientX - pos.x,
      y: clientY - pos.y,
    };
  };

  // Mouse events
  const handleMouseDown = (e, taskId) => {
    e.stopPropagation();
    e.preventDefault(); // prevent text selection
    handleDragStart(e.clientX, e.clientY, taskId);
  };

  // Touch events
  const handleTouchStart = (e, taskId) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;
    handleDragStart(touch.clientX, touch.clientY, taskId);
  };

  // ---------- Drag move ----------
  const handleDragMove = (clientX, clientY) => {
    if (!dragging || !boardRef.current) return;
    const boardRect = boardRef.current.getBoundingClientRect();
    const newX = clientX - boardRect.left - dragOffset.current.x;
    const newY = clientY - boardRect.top - dragOffset.current.y;
    setPositions((prev) => ({
      ...prev,
      [dragging]: { x: newX, y: newY },
    }));
  };

  // ---------- Drag end ----------
  const handleDragEnd = () => {
    setDragging(null);
  };

  // Mouse move/up listeners
  useEffect(() => {
    if (!dragging) return;
    const handleMouseMove = (e) => handleDragMove(e.clientX, e.clientY);
    const handleMouseUp = () => handleDragEnd();
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // Touch move/end listeners
  useEffect(() => {
    if (!dragging) return;
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      handleDragMove(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => handleDragEnd();
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [dragging]);

  // ---------- Connection logic (works for both mouse/touch) ----------
  const handleTaskClick = (taskId) => {
    if (dragging) return; // ignore clicks during drag
    if (!selected) {
      setSelected(taskId);
    } else if (selected === taskId) {
      setSelected(null);
    } else {
      setConnections((prev) => [...prev, { from: selected, to: taskId }]);
      setSelected(null);
    }
  };

  const removeConnection = (index) => {
    setConnections((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------- Render ----------
  return (
    <div
      ref={boardRef}
      style={{
        ...styles.board,
        userSelect: dragging ? 'none' : 'auto',
        touchAction: 'none', // prevent browser scrolling while dragging
      }}
    >
      <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
        ← Back to Board
      </button>
      <h2 style={styles.title}>Connection Board</h2>
      <p style={styles.instructions}>
        Drag notes to reposition. Tap a note to select it, tap another to connect. Use the ✕ button to remove a line.
      </p>

      {/* SVG lines */}
      <svg style={styles.svg}>
        {connections.map((conn, i) => {
          const from = getTaskCenter(conn.from);
          const to = getTaskCenter(conn.to);
          if (!from || !to) return null;
          return (
            <line
              key={i}
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke="#6c5ce7"
              strokeWidth="3"
              strokeDasharray="6,4"
            />
          );
        })}
      </svg>

      {/* Remove buttons at line midpoints */}
      {connections.map((conn, i) => {
        const mid = getLineMidpoint(conn.from, conn.to);
        if (!mid) return null;
        return (
          <button
            key={`btn-${i}`}
            onClick={() => removeConnection(i)}
            style={{ ...styles.removeBtn, left: mid.x, top: mid.y }}
          >
            ✕ Remove
          </button>
        );
      })}

      {/* Post‑it notes */}
      {tasks.map((task, idx) => {
        const pos = positions[task._id];
        if (!pos) return null;
        const rotation = getRotation(task._id);
        const bgColor = stickyColors[idx % stickyColors.length];
        return (
          <div
            key={task._id}
            ref={(el) => (taskRefs.current[task._id] = el)}
            onMouseDown={(e) => handleMouseDown(e, task._id)}
            onTouchStart={(e) => handleTouchStart(e, task._id)}
            onClick={() => handleTaskClick(task._id)}
            style={{
              ...styles.note,
              left: pos.x,
              top: pos.y,
              transform: `rotate(${rotation}deg)`,
              background: bgColor,
              border:
                selected === task._id ? '3px solid #6c5ce7' : '1px solid #d4a373',
              boxShadow:
                selected === task._id
                  ? '0 0 15px rgba(108,92,231,0.4)'
                  : dragging === task._id
                  ? '0 10px 20px rgba(0,0,0,0.3)'
                  : '2px 3px 6px rgba(0,0,0,0.2)',
              cursor: dragging === task._id ? 'grabbing' : 'grab',
              zIndex: dragging === task._id ? 10 : 2,
              transition: dragging ? 'none' : 'box-shadow 0.2s',
              touchAction: 'none', // prevent default touch behaviour
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
    pointerEvents: 'auto', // allow clicking on the button
  },
};

export default ConnectionBoard;
