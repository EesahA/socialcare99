import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import './AuthHome.css';

const AuthHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Sample data for summary cards
  const summaryData = [
    { title: 'Total Cases', value: 24, color: '#3498db', icon: '🗂️' },
    { title: 'Pending Tasks', value: 12, color: '#f1c40f', icon: '⏳' },
    { title: 'Blocked Tasks', value: 3, color: '#e74c3c', icon: '❌' },
    { title: 'Overdue Tasks', value: 5, color: '#e67e22', icon: '⚠️' }
  ];

  // Sample data for the Kanban board
  const [kanbanData, setKanbanData] = useState({
    Backlog: [
      { id: 1, title: 'Review client intake forms' },
      { id: 2, title: 'Prepare care plan draft' },
      { id: 3, title: 'Schedule initial assessment' }
    ],
    'In Progress': [
      { id: 4, title: 'Complete risk assessment' },
      { id: 5, title: 'Update care plan' }
    ],
    Blocked: [
      { id: 6, title: 'Awaiting medical records' }
    ],
    Done: [
      { id: 7, title: 'Initial client meeting' },
      { id: 8, title: 'Documentation review' }
    ]
  });

  return (
    <div className="auth-home">
      {/* Summary Cards Section */}
      <div className="dashboard-sections">
        <div className="summary-section">
          <div className="summary-grid">
            {summaryData.map((card, index) => (
              <div key={index} className="summary-card" style={{ borderLeftColor: card.color }}>
                <div className="summary-card-content">
                  <div className="summary-card-icon" style={{ color: card.color }}>
                    {card.icon}
                  </div>
                  <div className="summary-card-info">
                    <h3>{card.title}</h3>
                    <p className="summary-card-value">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="schedule-section">
          <h2>Upcoming Schedule</h2>
          <Calendar />
        </div>
      </div>

      {/* Kanban Board Section */}
      <div className="kanban-section">
        <h2>Task Management</h2>
        <div className="kanban-board">
          {Object.keys(kanbanData).map((column) => (
            <div key={column} className="kanban-column">
              <h3 className="kanban-column-header">{column}</h3>
              <div className="kanban-column-content">
                {kanbanData[column].map((task) => (
                  <div key={task.id} className="kanban-task">
                    {task.title}
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