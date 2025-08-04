import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthHome.css';

const AuthHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Sample data for summary cards
  const summaryData = [
    { title: 'Total Cases', value: 24, color: '#3498db', icon: '🗂️' },
    { title: 'Pending Tasks', value: 12, color: '#2ecc71', icon: '⏳' },
    { title: 'Blocked Tasks', value: 3, color: '#f1c40f', icon: '❌' },
    { title: 'Overdue Tasks', value: 7, color: '#e74c3c', icon: '👤' }
  ];

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
        <p>This is your dashboard. More features coming soon.</p>
      </div>

      {/* Dashboard Top Section - Split into two columns */}
      <div className="dashboard-top-section">
        <div className="dashboard-left">
          <h2 className="section-title">Summary</h2>
          <div className="summary-cards-grid">
            {summaryData.map((card) => (
              <div className="summary-card" key={card.title}>
                <div className="summary-card-icon" style={{ backgroundColor: card.color + '20' }}>
                  <span style={{ color: card.color }}>{card.icon}</span>
                </div>
                <div className="summary-card-content">
                  <div className="summary-card-value">{card.value}</div>
                  <div className="summary-card-title">{card.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="dashboard-right">
          <h2 className="section-title">Upcoming Schedule</h2>
          <div className="schedule-placeholder">
            <p>Calendar and upcoming events will be displayed here</p>
          </div>
        </div>
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