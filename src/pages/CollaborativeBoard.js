 import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import TaskColumn from '../components/TaskColumn';
import { useWindowSize } from '../hooks/useWindowSize';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const CollaborativeBoard = () => {
  const { boardId } = useParams();
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [board, setBoard] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const socketRef = useRef();
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();

  // ---------- Fetch board & tasks ----------
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/boards/${boardId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBoard(data);
      } catch (err) {
        console.error('Failed to fetch board:', err);
      }
    };

    const fetchTasks = async () => {
      try {
        const res = await fetch(`${API_URL}/api/boards/${boardId}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTasks(data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }
    };

    fetchBoard();
    fetchTasks();
  }, [boardId, token]);

  // ---------- Socket.IO ----------
  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });
    socket.emit('joinBoard', boardId);
    socketRef.current = socket;

    socket.on('taskCreated', ({ task }) => {
      setTasks(prev => [...prev, task]);
    });

    socket.on('taskUpdated', ({ task }) => {
      setTasks(prev => prev.map(t => (t._id === task._id ? task : t)));
    });

    socket.on('taskDeleted', ({ taskId }) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    });

    return () => {
      socket.emit('leaveBoard', boardId);
      socket.disconnect();
    };
  }, [boardId]);

  // ---------- Add task ----------
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      await fetch(`${API_URL}/api/boards/${boardId}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: desc.trim(),
          deadline: deadline || null,
        }),
      });

      // Reset form
      setTitle('');
      setDesc('');
      setDeadline('');
      setShowAdd(false);

      // The task will be added to the list by the 'taskCreated' socket event
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  // ---------- Move task between columns ----------
  const handleMoveTask = async (taskId, direction) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    const statusOrder = ['todo', 'inprogress', 'done'];
    const currentIdx = statusOrder.indexOf(task.status);
    const newIdx = direction === 'left' ? currentIdx - 1 : currentIdx + 1;
    if (newIdx < 0 || newIdx >= statusOrder.length) return;

    // Optimistic update (the socket event will later confirm it)
    setTasks(prev =>
      prev.map(t => (t._id === taskId ? { ...t, status: statusOrder[newIdx] } : t))
    );

    try {
      await fetch(`${API_URL}/api/tasks/${boardId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: statusOrder[newIdx] }),
      });
    } catch (err) {
      console.error('Failed to move task:', err);
    }
  };

  // ---------- Delete task ----------
  const handleDeleteTask = async (taskId) => {
    try {
      await fetch(`${API_URL}/api/tasks/${boardId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      // Socket event will remove it from state
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // ---------- Copy invite link ----------
  const copyInviteLink = () => {
    const link = `${window.location.origin}/board/${boardId}/join`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Invite link copied!');
    });
  };

  // ---------- Render ----------
  return (
    <div style={styles.page}>
      {/* ---- Header ---- */}
      <div style={styles.header}>
        <button onClick={() => navigate('/boards')} style={styles.backBtn}>
          ← Back to Boards
        </button>
        <h2 style={styles.title}>{board?.title || 'Loading...'}</h2>
        <button onClick={copyInviteLink} style={styles.inviteBtn}>
          📋 Copy Invite Link
        </button>
      </div>

      {/* ---- Add task button & form ---- */}
      <div style={styles.addSection}>
        <button onClick={() => setShowAdd(!showAdd)} style={styles.addBtn}>
          {showAdd ? '✖ Close' : '✚ Add a sticky note'}
        </button>
        {showAdd && (
          <form onSubmit={handleAddTask} style={styles.addForm}>
            <input
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <textarea
              style={{ ...styles.input, resize: 'vertical' }}
              placeholder="Description (optional)"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={2}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '14px' }}>⏰ Deadline:</label>
              <input
                style={styles.input}
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
            </div>
            <button type="submit" style={styles.submitBtn}>
              Stick it!
            </button>
          </form>
        )}
      </div>

      {/* ---- Board columns ---- */}
      <div style={styles.board}>
        <TaskColumn
          title="To Do"
          status="todo"
          tasks={tasks}
          moveTask={handleMoveTask}
          deleteTask={handleDeleteTask}
          isOverdue={() => false}
        />
        <TaskColumn
          title="In Progress"
          status="inprogress"
          tasks={tasks}
          moveTask={handleMoveTask}
          deleteTask={handleDeleteTask}
          isOverdue={() => false}
        />
        <TaskColumn
          title="Done"
          status="done"
          tasks={tasks}
          moveTask={handleMoveTask}
          deleteTask={handleDeleteTask}
          isOverdue={() => false}
        />
      </div>
    </div>
  );
};

// ---------- Styles ----------
const styles = {
  page: {
    padding: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: 'Indie Flower, cursive',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  backBtn: {
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
    fontSize: '32px',
    color: '#4a2c17',
    margin: 0,
    flex: 1,
    textAlign: 'center',
  },
  inviteBtn: {
    background: '#f4d03f',
    border: '2px solid #d4a373',
    borderRadius: '6px',
    padding: '8px 16px',
    fontFamily: 'Indie Flower, cursive',
    fontSize: '16px',
    cursor: 'pointer',
  },
  addSection: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  addBtn: {
    padding: '10px 20px',
    background: '#f4d03f',
    border: '2px solid #d4a373',
    borderRadius: '8px',
    fontFamily: 'Caveat, cursive',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#4a2c17',
    cursor: 'pointer',
  },
  addForm: {
    background: '#fff9e0',
    padding: '20px',
    borderRadius: '8px',
    border: '1px solid #d4a373',
    marginTop: '10px',
    maxWidth: '500px',
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '2px 3px 6px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #d4a373',
    fontFamily: 'Indie Flower, cursive',
    fontSize: '16px',
    outline: 'none',
  },
  submitBtn: {
    background: '#f4d03f',
    border: 'none',
    borderRadius: '4px',
    padding: '8px',
    fontFamily: 'Caveat, cursive',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#4a2c17',
    cursor: 'pointer',
  },
  board: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },
};

export default CollaborativeBoard;