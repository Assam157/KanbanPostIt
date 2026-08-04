import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

export default function DragDropContextWrapper({ onDragEnd, children }) {
  return <DragDropContext onDragEnd={onDragEnd}>{children}</DragDropContext>;
}