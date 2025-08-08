import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SummaryCards.css';

const SummaryCards = ({ refreshTrigger }) => {
  const [summaryData, setSummaryData] = useState({
    totalCases: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchSummaryData = async () => {
    try {
      setLoading(true);
      
      // Fetch cases for the authenticated user
      const casesResponse = await axios.get('http://localhost:3000/api/cases', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Fetch tasks for the authenticated user
      const tasksResponse = await axios.get('http://localhost:3000/api/tasks', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      const tasks = tasksResponse.data;
      const today = new Date();

      const pendingTasks = tasks.filter(task => task.status === 'Backlog' || task.status === 'In Progress').length;
      const blockedTasks = tasks.filter(task => task.status === 'Blocked').length;
      const overdueTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task.status !== 'Complete';
      }).length;

      setSummaryData({
        totalCases: casesResponse.data.length,
        pendingTasks,
        blockedTasks,
        overdueTasks
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [refreshTrigger]);

  const cards = [
    { 
      title: 'Total Cases', 
      value: summaryData.totalCases, 
      color: '#3498db', 
      colorLight: '#5dade2',
      icon: '📁'
    },
    { 
      title: 'Pending Tasks', 
      value: summaryData.pendingTasks, 
      color: '#f39c12', 
      colorLight: '#f7dc6f',
      icon: '⏳'
    },
    { 
      title: 'Blocked Tasks', 
      value: summaryData.blockedTasks, 
      color: '#e74c3c', 
      colorLight: '#ec7063',
      icon: '🚫'
    },
    { 
      title: 'Overdue Tasks', 
      value: summaryData.overdueTasks, 
      color: '#e67e22', 
      colorLight: '#eb984e',
      icon: '⚠️'
    }
  ];

  if (loading) {
    return (
      <div className="summary-section">
        <div className="summary-grid">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="summary-card loading">
              <div className="card-content">
                <div className="card-icon skeleton"></div>
                <div className="card-info">
                  <div className="card-title skeleton"></div>
                  <div className="card-value skeleton"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="summary-section">
      <div className="summary-grid">
        {cards.map((card, index) => (
          <div 
            key={index} 
            className={`summary-card ${card.title === 'Overdue Tasks' ? 'overdue' : ''}`}
            style={{
              '--card-color': card.color,
              '--card-color-light': card.colorLight
            }}
          >
            <div className="card-content">
              <div className="card-icon">
                {card.icon}
              </div>
              <div className="card-info">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-value">
                  {card.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCards; 