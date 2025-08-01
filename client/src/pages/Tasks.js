import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Tasks.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('/api/items');
        setTasks(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch tasks');
        console.error('Error fetching tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div className="loading">Loading tasks...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="tasks">
      <h1>Tasks</h1>
      <p>Manage your care tasks and assignments</p>
      
      <div className="tasks-grid">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <h3>{task.name}</h3>
            <p>Task ID: {task.id}</p>
            <div className="task-status">
              <span className="status-badge">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;