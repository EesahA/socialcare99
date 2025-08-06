import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
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
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    if (task._id) {
      fetchComments();
    }
  }, [task._id]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/tasks/${task._id}/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
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

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      
      const response = await axios.post(`http://localhost:3000/api/tasks/${task._id}/comments`, {
        text: newComment.trim()
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      alert('Failed to add comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getAvatarColor = (userId) => {
    const colors = [
      '#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6',
      '#1abc9c', '#e67e22', '#34495e', '#16a085', '#c0392b'
    ];
    return colors[userId.charCodeAt(userId.length - 1) % colors.length];
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

          {/* Comments Section */}
          <div className="comments-section">
            <div className="comments-header">
              <h3 className="comments-title">Comments</h3>
              <span className="comment-count">{comments.length}</span>
            </div>

            <div className="comment-input-section">
              <div className="comment-input-container">
                <div className="comment-input-avatar">
                  <div 
                    className="avatar-initials"
                    style={{ backgroundColor: getAvatarColor(currentUser?.id || '') }}
                  >
                    {getInitials(currentUser?.firstName, currentUser?.lastName)}
                  </div>
                </div>
                <div className="comment-input">
                  <textarea
                    className="comment-textarea"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows="3"
                  />
                  <div className="comment-actions">
                    <button 
                      className="comment-cancel-btn"
                      onClick={() => setNewComment('')}
                    >
                      Cancel
                    </button>
                    <button 
                      className="comment-submit-btn"
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || commentLoading}
                    >
                      {commentLoading ? 'Adding...' : 'Add Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="comments-empty">No comments yet. Be the first to comment!</div>
              ) : (
                comments.map((comment) => (
                  <Comment 
                    key={comment._id} 
                    comment={comment} 
                    currentUser={currentUser}
                  />
                ))
              )}
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