 import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { useServerTime } from '../context/TimeContext';
import TaskColumn from '../components/TaskColumn';
import { useWindowSize } from '../hooks/useWindowSize';

const UserDashboard = () => {
  const { tasks, addTask, moveTask, deleteTask } = useTasks();
  const { serverTime } = useServerTime();
  const { isMobile } = useWindowSize();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await addTask(title, desc, deadline);
    setTitle('');
    setDesc('');
    setDeadline('');
    setShowAdd(false);
  };

  const isOverdue = (deadlineStr) => {
    if (!deadlineStr) return false;
    return serverTime && new Date(deadlineStr) < serverTime;
  };

  // Button‑based move logic (passed to TaskColumn)
  const handleMove = (taskId, direction) => {
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;
    const statusOrder = ['todo', 'inprogress', 'done'];
    const currentIdx = statusOrder.indexOf(task.status);
    const newIdx = direction === 'left' ? currentIdx - 1 : currentIdx + 1;
    if (newIdx >= 0 && newIdx < statusOrder.length) {
      moveTask(taskId, statusOrder[newIdx]);
    }
  };

  const styles = {
    page: {
      padding: isMobile ? '15px' : '30px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Indie Flower, cursive',
    },
    mainTitle: {
      fontFamily: 'Caveat, cursive',
      fontSize: isMobile ? '28px' : '36px',
      color: '#4a2c17',
      textAlign: 'center',
      marginBottom: '24px',
    },
    addBtn: {
      padding: '10px 20px',
      background: '#f4d03f',
      border: '2px solid #d4a373',
      borderRadius: '8px',
      fontFamily: 'Caveat, cursive',
      fontSize: isMobile ? '18px' : '22px',
      fontWeight: 'bold',
      color: '#4a2c17',
      cursor: 'pointer',
      boxShadow: '2px 2px 4px rgba(0,0,0,0.2)',
    },
    addForm: {
      background: '#fff9e0',
      padding: '20px',
      borderRadius: '8px',
      border: '1px solid #d4a373',
      marginBottom: '24px',
      maxWidth: '400px',
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
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: isMobile ? '10px' : '20px',
    },
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.mainTitle}>My Post‑it Board</h2>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button style={styles.addBtn} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? '✖ Close' : '✚ Add a sticky note'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} style={styles.addForm}>
          <input style={styles.input} placeholder="Task title" value={title}
            onChange={(e) => setTitle(e.target.value)} required />
          <textarea style={styles.input} placeholder="Description (optional)" value={desc}
            onChange={(e) => setDesc(e.target.value)} rows={2} />
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px' }}>⏰ Deadline:</label>
            <input style={styles.input} type="datetime-local" value={deadline}
              onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <button type="submit" style={styles.submitBtn}>Stick it!</button>
        </form>
      )}

      <div style={styles.board}>
        <TaskColumn
          title="To Do"
          status="todo"
          tasks={tasks}
          moveTask={handleMove}
          deleteTask={deleteTask}
          isOverdue={isOverdue}
        />
        <TaskColumn
          title="In Progress"
          status="inprogress"
          tasks={tasks}
          moveTask={handleMove}
          deleteTask={deleteTask}
          isOverdue={isOverdue}
        />
        <TaskColumn
          title="Done"
          status="done"
          tasks={tasks}
          moveTask={handleMove}
          deleteTask={deleteTask}
          isOverdue={isOverdue}
        />
      </div>
    </div>
  );
};

export default UserDashboard;