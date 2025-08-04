import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import KanbanBoard from '../components/KanbanBoard';
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
          <Calendar />
        </div>
      </div>

      {/* Kanban Board Section */}
      <div className="kanban-section">
        <h2>Task Management</h2>
        <KanbanBoard showCreateButtons={false} />
      </div>
    </div>
  );
};

export default AuthHome; 