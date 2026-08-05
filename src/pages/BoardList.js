 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '';

const BoardList = () => {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState('');
  const [joinBoardId, setJoinBoardId] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  // Fetch boards
  const fetchBoards = () => {
    fetch(`${API_URL}/api/boards`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setBoards(data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchBoards();
  }, [token]);

  // Create new board
  const createBoard = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API_URL}/api/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title }),
    });
    const board = await res.json();
    setBoards([...boards, board]);
    setTitle('');
  };

  // Join existing board by ID
  const joinBoard = async (e) => {
    e.preventDefault();
    if (!joinBoardId.trim()) return;

    try {
      const res = await fetch(`${API_URL}/api/boards/${joinBoardId.trim()}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || 'Failed to join board');
        return;
      }

      // Success: refresh board list and clear input
      await fetchBoards();
      setJoinBoardId('');
    } catch (error) {
      console.error('Join error:', error);
      alert('Could not join board. Please check the ID and try again.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Collaborative Boards</h2>

      {/* Create Board Form */}
      <form onSubmit={createBoard} style={styles.form}>
        <input
          style={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Board name"
          required
        />
        <button type="submit" style={styles.createBtn}>
          Create
        </button>
      </form>

      {/* Join Board Form */}
      <form onSubmit={joinBoard} style={styles.form}>
        <input
          style={styles.input}
          value={joinBoardId}
          onChange={(e) => setJoinBoardId(e.target.value)}
          placeholder="Paste board ID to join"
        />
        <button type="submit" style={styles.joinBtn}>
          Join
        </button>
      </form>

      {/* Board List */}
      <ul style={styles.list}>
        {boards.map(board => (
          <li key={board._id} style={styles.boardItem}>
            <span style={styles.boardTitle}>
              {board.title} ({board.members.length} members)
            </span>
            <button
              onClick={() => navigate(`/board/${board._id}`)}
              style={styles.openBtn}
            >
              Open
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Indie Flower, cursive',
  },
  heading: {
    fontFamily: 'Caveat, cursive',
    fontSize: '32px',
    color: '#4a2c17',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
  },
  input: {
    flex: 1,
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #d4a373',
    fontFamily: 'Indie Flower, cursive',
    fontSize: '16px',
  },
  createBtn: {
    padding: '8px 16px',
    background: '#f4d03f',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: 'Caveat, cursive',
    fontSize: '20px',
  },
  joinBtn: {
    padding: '8px 16px',
    background: '#6c5ce7',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontFamily: 'Caveat, cursive',
    fontSize: '20px',
  },
  list: {
    listStyle: 'none',
    padding: 0,
  },
  boardItem: {
    background: '#fff9e0',
    border: '1px solid #d4a373',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  boardTitle: {
    fontSize: '18px',
    color: '#6b4226',
  },
  openBtn: {
    background: '#6c5ce7',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default BoardList;
