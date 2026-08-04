import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '';

const JoinBoard = () => {
  const { boardId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const join = async () => {
      try {
        await fetch(`${API_URL}/api/boards/${boardId}/join`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error(err);
      } finally {
        navigate(`/board/${boardId}`);
      }
    };
    join();
  }, [boardId, token, navigate]);

  return (
    <div style={{ textAlign: 'center', paddingTop: '40px', fontFamily: 'Indie Flower, cursive' }}>
      Joining board...
    </div>
  );
};

export default JoinBoard;