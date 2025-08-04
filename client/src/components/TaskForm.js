import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskForm.css';

const TaskForm = ({ isOpen, onClose, onTaskCreated, prefillStatus = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Backlog',
    caseId: '',
    caseName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form when prefillStatus changes
  useEffect(() => {
    if (prefillStatus) {
      setFormData(prev => ({
        ...prev,
        status: prefillStatus
      }));
    }
  }, [prefillStatus]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }
    if (!formData.dueDate) {
      setError('Due date is required');
      return;
    }
    if (!formData.caseId.trim() || !formData.caseName.trim()) {
      setError('Case ID and Case Name are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('http://localhost:3000/api/tasks', {
        ...formData,
        createdAt: new Date().toISOString()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Backlog',
        caseId: '',
        caseName: ''
      });

      onClose();
      if (onTaskCreated) {
        onTaskCreated(response.data);
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="task-form-overlay">
      <div className="task-form-modal">
        <div className="task-form-header">
          <h2>Create New Task</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Task Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional context, instructions, or relevant notes"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignedTo">Assigned To</label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                placeholder="Team member name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                type="datetime-local"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="Backlog">Backlog</option>
                <option value="In Progress">In Progress</option>
                <option value="Blocked">Blocked</option>
                <option value="Complete">Complete</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="caseId">Case ID *</label>
              <input
                type="text"
                id="caseId"
                name="caseId"
                value={formData.caseId}
                onChange={handleInputChange}
                placeholder="Enter case ID"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="caseName">Case Name *</label>
              <input
                type="text"
                id="caseName"
                name="caseName"
                value={formData.caseName}
                onChange={handleInputChange}
                placeholder="Enter case name"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm; 