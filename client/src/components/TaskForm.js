import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaskForm.css';

const TaskForm = ({ isOpen, onClose, onTaskCreated, prefillStatus = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    assignedCase: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Backlog'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [cases, setCases] = useState([]);
  const [loadingCases, setLoadingCases] = useState(false);

  // Update form when prefillStatus changes
  useEffect(() => {
    if (prefillStatus) {
      setFormData(prev => ({
        ...prev,
        status: prefillStatus
      }));
    }
  }, [prefillStatus]);

  // Fetch users and cases when form opens
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchCases();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchCases = async () => {
    try {
      setLoadingCases(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Filter for open cases only (Open and Ongoing status)
      const openCases = response.data.filter(caseData => 
        caseData.caseStatus === 'Open' || caseData.caseStatus === 'Ongoing'
      );
      setCases(openCases);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoadingCases(false);
    }
  };

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

    try {
      setLoading(true);
      setError('');

      // Get case details if a case is selected
      let caseId = '';
      let caseName = '';
      if (formData.assignedCase) {
        const selectedCase = cases.find(c => c.caseId === formData.assignedCase);
        if (selectedCase) {
          caseId = selectedCase.caseId;
          caseName = selectedCase.clientFullName;
        }
      }

      const taskData = {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
        caseId: caseId,
        caseName: caseName,
        createdAt: new Date().toISOString()
      };

      const response = await axios.post('http://localhost:3000/api/tasks', taskData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      setFormData({
        title: '',
        description: '',
        assignedTo: '',
        assignedCase: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Backlog'
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
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Additional context, instructions, or relevant notes"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="assignedTo">Assigned To</label>
              {loadingUsers ? (
                <select disabled>
                  <option>Loading users...</option>
                </select>
              ) : (
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                >
                  <option value="">Select a team member</option>
                  {users.map(user => (
                    <option key={user._id} value={`${user.firstName} ${user.lastName}`}>
                      {user.firstName} {user.lastName} ({user.role})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="assignedCase">Assigned Case</label>
              {loadingCases ? (
                <select disabled>
                  <option>Loading cases...</option>
                </select>
              ) : (
                <select
                  id="assignedCase"
                  name="assignedCase"
                  value={formData.assignedCase}
                  onChange={handleInputChange}
                >
                  <option value="">Select a case (optional)</option>
                  {cases.map(caseData => (
                    <option key={caseData._id} value={caseData.caseId}>
                      {caseData.caseId} - {caseData.clientFullName} ({caseData.caseStatus})
                    </option>
                  ))}
                </select>
              )}
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