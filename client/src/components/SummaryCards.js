import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SummaryCards.css';

const SummaryCards = ({ refreshTrigger }) => {
  const [summaryData, setSummaryData] = useState({
    pendingTasks: 0,
    blockedTasks: 0,
    overdueTasks: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchSummaryData = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tasks', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const tasks = response.data;
      const now = new Date();

      // Calculate summary data
      const pendingTasks = tasks.filter(task => task.status !== 'Complete').length;
      const blockedTasks = tasks.filter(task => task.status === 'Blocked').length;
      const overdueTasks = tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < now && task.status !== 'Complete';
      }).length;

      setSummaryData({
        pendingTasks,
        blockedTasks,
        overdueTasks
      });
    } catch (error) {
      console.error('Failed to fetch summary data:', error);
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
      value: 1,
      color: '#3498db', 
      icon: '📁' 
    },
    { 
      title: 'Pending Tasks', 
      value: summaryData.pendingTasks, 
      color: '#f1c40f', 
      icon: '⏳' 
    },
    { 
      title: 'Blocked Tasks', 
      value: summaryData.blockedTasks, 
      color: '#e74c3c', 
      icon: '🚫' 
    },
    { 
      title: 'Overdue Tasks', 
      value: summaryData.overdueTasks, 
      color: '#e67e22', 
      icon: '⚠️' 
    }
  ];

  if (loading) {
    return (
      <div className="summary-section">
        <div className="summary-grid">
          {cards.map((card, index) => (
            <div key={index} className="summary-card loading">
              <div className="summary-card-content">
                <div className="summary-card-icon" style={{ color: card.color }}>
                  {card.icon}
                </div>
                <div className="summary-card-info">
                  <h3>{card.title}</h3>
                  <div className="loading-skeleton"></div>
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
  );
};

export default SummaryCards; 