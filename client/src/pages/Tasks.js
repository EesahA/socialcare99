import React, { useState } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import TaskForm from '../components/TaskForm';
import './Tasks.css';

const Tasks = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState(null);

  const handleTaskCreated = (task) => {
    setNewTask(task);
    setShowTaskForm(false);
  };

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <h1>Task Management</h1>
        <button 
          className="create-task-button"
          onClick={() => setShowTaskForm(true)}
        >
          + Create Task
        </button>
      </div>
      <div className="tasks-content">
        <KanbanBoard 
          showCreateButtons={true} 
          onTaskCreated={newTask}
        />
      </div>
      <TaskForm
        isOpen={showTaskForm}
        onClose={() => setShowTaskForm(false)}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
};

export default Tasks;