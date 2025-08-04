import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tasks.css';

const Tasks = () => {
  const navigate = useNavigate();

  // Sample data for the Kanban board
  const [kanbanData, setKanbanData] = useState({
    Backlog: [
    ],
    'In Progress': [
    ],
    Blocked: [
    ],
    Done: [
    ]
  });

  const handleCreateTask = (column = null) => {
    console.log(`Create task${column ? ` in ${column}` : ''} clicked`);
    // Add your create task logic here
    // If column is provided, you can pre-select the column for the new task
  };

  return (
    <div className="tasks-page">
      {/* Tasks Content */}
      <div className="tasks-content">
        <div className="tasks-header-section">
          <div className="tasks-title-section">
            <h1>Tasks Management</h1>
            <p>Manage and track all your care tasks efficiently</p>
          </div>
          <button 
            className="create-task-btn"
            onClick={() => handleCreateTask()}
          >
            <span className="btn-icon">➕</span>
            Create Task
          </button>
        </div>

        {/* Kanban Board */}
        <div className="kanban-section">
          <div className="kanban-board">
            {Object.keys(kanbanData).map((column) => (
              <div className="kanban-column" key={column}>
                <div className="kanban-column-header">
                  <h3 className="kanban-column-title">{column}</h3>
                  <span className="kanban-column-count">{kanbanData[column].length}</span>
                </div>
                <div className="kanban-tasks">
                  {kanbanData[column].map((task) => (
                    <div className="kanban-task" key={task.id}>
                      <div className="task-title">{task.title}</div>
                    </div>
                  ))}
                </div>
                <button 
                  className="column-create-task-btn"
                  onClick={() => handleCreateTask(column)}
                >
                  <span className="btn-icon">➕</span>
                  Add Task
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;