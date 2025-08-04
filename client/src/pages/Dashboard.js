import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeTasks: 12,
    pendingTasks: 5,
    totalClients: 28,
    completedToday: 8
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="welcome-section">
            <h1>Welcome back, {user.firstName}!</h1>
            <p>Here's what's happening with your care tasks today</p>
          </div>
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
              <div className="user-details">
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon active-tasks">📋</div>
            <div className="stat-info">
              <h3>{stats.activeTasks}</h3>
              <p>Active Tasks</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon pending-tasks">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingTasks}</h3>
              <p>Pending Tasks</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon total-clients">👥</div>
            <div className="stat-info">
              <h3>{stats.totalClients}</h3>
              <p>Total Clients</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon completed-today">✅</div>
            <div className="stat-info">
              <h3>{stats.completedToday}</h3>
              <p>Completed Today</p>
            </div>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="section-row">
            <div className="section-card">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <button className="action-btn primary">
                  <span className="action-icon">➕</span>
                  Create New Task
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">👤</span>
                  Add New Client
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">📊</span>
                  View Reports
                </button>
                <button className="action-btn secondary">
                  <span className="action-icon">📅</span>
                  Schedule View
                </button>
              </div>
            </div>

            <div className="section-card">
              <div className="section-header">
                <h2>Recent Activity</h2>
              </div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon completed">✅</div>
                  <div className="activity-content">
                    <p>Completed medication round for Mrs. Johnson</p>
                    <span className="activity-time">2 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon pending">⏳</div>
                  <div className="activity-content">
                    <p>New task assigned: Personal care for Mr. Smith</p>
                    <span className="activity-time">4 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon info">ℹ️</div>
                  <div className="activity-content">
                    <p>Client record updated for Mrs. Davis</p>
                    <span className="activity-time">6 hours ago</span>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon completed">✅</div>
                  <div className="activity-content">
                    <p>Completed mobility assessment for Mr. Wilson</p>
                    <span className="activity-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 