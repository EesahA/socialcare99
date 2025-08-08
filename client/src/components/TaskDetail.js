import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import './TaskDetail.css';

const TaskDetail = ({ task, isOpen, onClose, onTaskUpdated, onTaskDeleted }) => {
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
  const [isEditing, setIsEditing] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (task && isOpen) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        priority: task.priority || 'Medium',
        status: task.status || 'Backlog',
        caseId: task.caseId || '',
        caseName: task.caseName || ''
      });
      
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
      fetchComments();
    }
  }, [task, isOpen]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/tasks/${task._id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3000/api/tasks/${task._id}`, formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      onTaskUpdated(response.data);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/tasks/${task._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        onTaskDeleted(task._id);
        onClose();
      } catch (error) {
        setError('Failed to delete task');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
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
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/tasks/${task._id}/comments`, {
        text: newComment.trim()
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setComments(prev => [...prev, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/comments/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const canEditTask = () => {
    if (!currentUser || !task) return false;
    return task.createdBy === currentUser.id || task.assignedTo === `${currentUser.firstName} ${currentUser.lastName}`;
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    return comment.userId === currentUser.id;
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

          <div className="task-form-section">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              {isEditing ? (
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter task title"
                />
              ) : (
                <div className="readonly-field">{formData.title}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              {isEditing ? (
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                  rows="3"
                />
              ) : (
                <div className="readonly-field">{formData.description || 'No description'}</div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="assignedTo">Assigned To:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="assignedTo"
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleInputChange}
                    placeholder="Enter assignee"
                  />
                ) : (
                  <div className="readonly-field">{formData.assignedTo || 'Unassigned'}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Due Date:</label>
                {isEditing ? (
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                ) : (
                  <div className="readonly-field">
                    {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'No due date'}
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priority">Priority:</label>
                {isEditing ? (
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                ) : (
                  <div className="readonly-field">
                    <span className={`priority-badge priority-${formData.priority.toLowerCase()}`}>
                      {formData.priority}
                    </span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="status">Status:</label>
                {isEditing ? (
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
                ) : (
                  <div className="readonly-field">
                    <span className={`status-badge status-${formData.status.toLowerCase().replace(' ', '-')}`}>
                      {formData.status}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="caseId">Case ID:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="caseId"
                    name="caseId"
                    value={formData.caseId}
                    onChange={handleInputChange}
                    placeholder="Enter case ID"
                  />
                ) : (
                  <div className="readonly-field">{formData.caseId || 'No case linked'}</div>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="caseName">Case Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="caseName"
                    name="caseName"
                    value={formData.caseName}
                    onChange={handleInputChange}
                    placeholder="Enter case name"
                  />
                ) : (
                  <div className="readonly-field">{formData.caseName || 'No case linked'}</div>
                )}
              </div>
            </div>
          </div>

          <div className="comments-section">
            <div className="comments-header">
              <h3 className="comments-title">Comments</h3>
              <span className="comment-count">{comments.length}</span>
            </div>
            
            <div className="comment-input-section">
              <div className="comment-input-container">
                <div className="comment-input-avatar">
                  <div className="avatar-initials" style={{ backgroundColor: getAvatarColor(currentUser?.id || '') }}>
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
                    <button className="comment-cancel-btn" onClick={() => setNewComment('')}>
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
                    onDelete={canDeleteComment(comment) ? () => handleDeleteComment(comment._id) : null}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="task-detail-actions">
          {isEditing ? (
            <>
              <button className="save-button" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="cancel-button" onClick={handleCancel}>
                Cancel
              </button>
            </>
          ) : (
            <>
              {canEditTask() && (
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Task
                </button>
              )}
              {task.createdBy === currentUser?.id && (
                <button className="delete-button" onClick={handleDelete} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete Task'}
                </button>
              )}
            </>
          )}
          <button className="close-detail-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const getInitials = (firstName, lastName) => {
  if (!firstName || !lastName) return '?';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (userId) => {
  const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
  const index = userId ? userId.charCodeAt(0) % colors.length : 0;
  return colors[index];
};

export default TaskDetail; 