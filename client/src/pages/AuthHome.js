import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthHome.css';

const AuthHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));

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

  return (
    <div className="auth-home">
      {/* Welcome Content */}
      <div className="auth-home-content">
        <h1>Welcome, {user?.firstName || 'User'}!</h1>
      </div>

      {/* Kanban Board */}
      <div className="kanban-section">
        <h2 className="kanban-title">Tasks Board</h2>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthHome; 