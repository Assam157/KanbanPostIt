import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../context/TaskContext';
import { useWindowSize } from '../hooks/useWindowSize';
import { getRotation } from '../utils';

const stickyColors = ['#FFF9C4', '#FFCCBC', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#D1C4E9'];

const ConnectionBoard = () => {
  const navigate = useNavigate();
  const { tasks } = useTasks();
  const { isMobile } = useWindowSize();

  // Desktop state
  const [selected, setSelected] = useState(null);
  const [connections, setConnections] = useState([]);
  const [positions, setPositions] = useState({});
  const boardRef = useRef(null);
  const taskRefs = useRef({});
  const [dragging, setDragging] = useState(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Mobile state (also used for tap-to-select)
  const [mobileSelected, setMobileSelected] = useState(null);
  const [mobileConnections, setMobileConnections] = useState([]);

  // ---- Desktop drag helpers ----
  const getTaskCenter = useCallback((taskId) => {
    const el = taskRefs.current[taskId];
    const board = boardRef.current;
    if (!el || !board) return null;
    const boardRect = board.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x: elRect.left + elRect.width / 2 - boardRect.left,
      y: elRect.top + elRect.height / 2 - boardRect.top,
    };
  }, []);

  const getLineMidpoint = (fromId, toId) => {
    const from = getTaskCenter(fromId);
    const to = getTaskCenter(toId);
    if (!from || !to) return null;
    return { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  };

  // Initial random positions for desktop
  useEffect(() => {
    if (isMobile || !boardRef.current) return;
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
  }, [tasks, isMobile, positions]);

  // Desktop drag events
  const handleMouseDown = (e, taskId) => {
    if (isMobile) return;
    e.stopPropagation();
    const pos = positions[taskId];
    if (!pos) return;
    setDragging(taskId);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
  };

  useEffect(() => {
    if (isMobile || !dragging) return;
    const handleMouseMove = (e) => {
      const board = boardRef.current;
      if (!board) return;
      const boardRect = board.getBoundingClientRect();
      const newX = e.clientX - boardRect.left - dragOffset.current.x;
      const newY = e.clientY - boardRect.top - dragOffset.current.y;
      setPositions((prev) => ({ ...prev, [dragging]: { x: newX, y: newY } }));
    };
    const handleMouseUp = () => setDragging(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, isMobile]);

  // Desktop connection click
  const handleDesktopClick = (taskId) => {
    if (dragging) return;
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

  // ---- Mobile tap-to-connect ----
  const handleMobileTaskClick = (taskId) => {
    if (!mobileSelected) {
      setMobileSelected(taskId);
    } else if (mobileSelected === taskId) {
      setMobileSelected(null);
    } else {
      setMobileConnections((prev) => [...prev, { from: mobileSelected, to: taskId }]);
      setMobileSelected(null);
    }
  };

  const removeMobileConnection = (index) => {
    setMobileConnections((prev) => prev.filter((_, i) => i !== index));
  };

  // ---- Render ----
  const backBtnStyle = {
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
  };

  if (isMobile) {
    return (
      <div style={{ padding: '20px', background: '#fdf6e3', minHeight: '100vh', fontFamily: 'Indie Flower, cursive' }}>
        <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>
          ← Back to Board
        </button>
        <h2 style={{ fontFamily: 'Caveat, cursive', fontSize: '28px', color: '#4a2c17', textAlign: 'center' }}>
          Connection Board
        </h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '16px' }}>
          Tap a note to select it, tap another to connect. Tap a connection to remove it.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {tasks.map((task, idx) => (
            <div
              key={task._id}
              onClick={() => handleMobileTaskClick(task._id)}
              style={{
                background: stickyColors[idx % stickyColors.length],
                border: mobileSelected === task._id ? '3px solid #6c5ce7' : '1px solid #d4a373',
                borderRadius: '4px',
                padding: '12px',
                cursor: 'pointer',
                boxShadow: mobileSelected === task._id ? '0 0 10px rgba(108,92,231,0.3)' : '1px 1px 4px rgba(0,0,0,0.1)',
              }}
            >
              <strong style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>{task.title}</strong>
              <p style={{ margin: '4px 0', fontSize: '14px' }}>{task.description}</p>
            </div>
          ))}
        </div>

        {mobileConnections.length > 0 && (
          <div style={{ marginTop: '25px' }}>
            <h3 style={{ fontFamily: 'Caveat, cursive', color: '#4a2c17', fontSize: '24px' }}>Active Connections</h3>
            {mobileConnections.map((conn, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px dashed #d4a373',
                  fontSize: '16px',
                }}
              >
                <span>
                  {tasks.find((t) => t._id === conn.from)?.title} ↔ {tasks.find((t) => t._id === conn.to)?.title}
                </span>
                <button
                  onClick={() => removeMobileConnection(i)}
                  style={{
                    background: '#ffb4a2',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontFamily: 'Indie Flower, cursive',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div ref={boardRef} style={styles.board}>
      <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>
        ← Back to Board
      </button>
      <h2 style={styles.title}>Connection Board</h2>
      <p style={styles.instructions}>
        Drag notes to reposition. Click two notes to connect them. Click ✕ on a line to remove it.
      </p>

      {/* SVG layer for arrows */}
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
        if (!pos) return null;
        const rotation = getRotation(task._id);
        const bgColor = stickyColors[idx % stickyColors.length];
        return (
          <div
            key={task._id}
            ref={(el) => (taskRefs.current[task._id] = el)}
            onMouseDown={(e) => handleMouseDown(e, task._id)}
            onClick={() => handleDesktopClick(task._id)}
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
            <strong style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>{task.title}</strong>
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
    userSelect: 'none',
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
