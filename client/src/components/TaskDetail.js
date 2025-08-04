import React, { useState } from 'react';
import axios from 'axios';
import './TaskDetail.css';

const TaskDetail = ({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted }) => {
  const [formData, setFormData] = useState({
    title: task.title || '',
    description: task.description || '',
    assignedTo: task.assignedTo || '',
    dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
    priority: task.priority || 'Medium',
    status: task.status || 'Backlog',
    caseId: task.caseId || '',
    caseName: task.caseName || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.put(`http://localhost:3000/api/tasks/${task._id}`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setIsEditing(false);
      if (onTaskUpdated) {
        onTaskUpdated(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.delete(`http://localhost:3000/api/tasks/${task._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      onClose();
      if (onTaskDeleted) {
        onTaskDeleted(task._id);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      priority: task.priority || 'Medium',
      status: task.status || 'Backlog',
      caseId: task.caseId || '',
      caseName: task.caseName || ''
    });
    setIsEditing(false);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="task-detail-overlay">
      <div className="task-detail-modal">
        <div className="task-detail-header">
          <h2>{isEditing ? 'Edit Task' : 'Task Details'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="task-detail-content">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={!isEditing}
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
              disabled={!isEditing}
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
                disabled={!isEditing}
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={!isEditing}
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
                disabled={!isEditing}
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
                disabled={!isEditing}
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
                disabled={!isEditing}
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
                disabled={!isEditing}
                required
              />
            </div>
          </div>

          <div className="task-meta-info">
            <div className="meta-item">
              <span className="meta-label">Created:</span>
              <span className="meta-value">
                {task.createdAt ? new Date(task.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Last Updated:</span>
              <span className="meta-value">
                {task.updatedAt ? new Date(task.updatedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="task-detail-actions">
            {!isEditing ? (
              <>
                <button 
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Task
                </button>
                <button 
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Task'}
                </button>
              </>
            ) : (
              <>
                <button 
                  className="save-button"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 