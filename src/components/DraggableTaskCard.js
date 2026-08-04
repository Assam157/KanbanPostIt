import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { getRotation } from '../utils';

const stickyColors = ['#FFF9C4', '#FFCCBC', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#D1C4E9'];

const DraggableTaskCard = ({ task, index, deleteTask, isOverdue }) => {
  const rotation = getRotation(task._id);
  const bgColor = stickyColors[index % stickyColors.length];
  const overdue = isOverdue(task.deadline);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => {
        const style = {
          ...styles.note,
          transform: snapshot.isDragging
            ? 'rotate(0deg) scale(1.05)'
            : `rotate(${rotation}deg)`,
          background: bgColor,
          border: overdue ? '2px solid #d63031' : '1px solid #d4a373',
          boxShadow: snapshot.isDragging
            ? '0 15px 25px rgba(0,0,0,0.3)'
            : '2px 3px 6px rgba(0,0,0,0.2)',
        };

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={{ ...provided.draggableProps.style, ...style }}
          >
            <div style={styles.pin}>📌</div>
            <div style={styles.content}>
              <strong style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}>
                {task.title}
              </strong>
              {task.deadline && (
                <span style={{ fontSize: '12px', display: 'block', color: overdue ? '#d63031' : '#555', marginTop: 4 }}>
                  ⏰ {new Date(task.deadline).toLocaleString()}
                </span>
              )}
              <p style={{ margin: '8px 0', fontSize: '14px', wordBreak: 'break-word' }}>
                {task.description}
              </p>
            </div>
            <button
              style={styles.deleteBtn}
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task._id);
              }}
            >
              🗑️
            </button>
          </div>
        );
      }}
    </Draggable>
  );
};

const styles = {
  note: {
    width: '90%',
    maxWidth: '240px',
    minHeight: '120px',
    padding: '16px',
    borderRadius: '2px 2px 4px 2px',
    position: 'relative',
    transition: 'box-shadow 0.2s, transform 0.2s',
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
  content: {
    flex: 1,
    overflow: 'hidden',
    marginBottom: '8px',
  },
  deleteBtn: {
    alignSelf: 'center',
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
  },
};

export default DraggableTaskCard;