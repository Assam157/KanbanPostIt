 import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import DraggableTaskCard from './DraggableTaskCard';

const DroppableColumn = ({ columnId, title, tasks, deleteTask, isOverdue }) => {
  return (
    <div style={styles.column}>
      <h3 style={styles.header}>
        {title} ({tasks.length})
      </h3>
      <Droppable droppableId={columnId}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={styles.list}
          >
            {tasks.map((task, index) => (
              <DraggableTaskCard
                key={task._id}
                task={task}
                index={index}
                deleteTask={deleteTask}
                isOverdue={isOverdue}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
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
    minHeight: '50px', // important for empty droppable
  },
};

export default DroppableColumn;