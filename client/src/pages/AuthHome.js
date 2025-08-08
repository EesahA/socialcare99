import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from '../components/Calendar';
import KanbanBoard from '../components/KanbanBoard';
import SummaryCards from '../components/SummaryCards';
import './AuthHome.css';

const AuthHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTaskChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="auth-home">
      <div className="dashboard-sections">
        <SummaryCards refreshTrigger={refreshTrigger} />
        <div className="schedule-section">
          <Calendar refreshTrigger={refreshTrigger} />
        </div>
      </div>
      <div className="kanban-section">
        <h2>Task Management</h2>
        <KanbanBoard 
          showCreateButtons={false} 
          onTaskCreated={handleTaskChange} 
        />
      </div>
    </div>
  );
};

export default AuthHome; 