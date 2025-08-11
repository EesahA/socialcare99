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
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        assignedTo: task.assignedTo || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        priority: task.priority || 'Medium',
        status: task.status || 'Backlog',
        caseId: task.caseId || '',
        caseName: task.caseName || ''
      });
    }
  }, [task]);

  useEffect(() => {
    if (isOpen && task?._id) {
      fetchComments();
      fetchCurrentUser();
      fetchUsers();
    }
  }, [isOpen, task?._id]);

  const fetchCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  };

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

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/tasks/${task._id}/comments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      // Sort comments by creation date (newest first)
      const sortedComments = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(sortedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setIsEditing(false);
      if (onTaskUpdated) {
        onTaskUpdated(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update task');
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
      await axios.delete(`http://localhost:3000/api/tasks/${task._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (onTaskDeleted) {
        onTaskDeleted(task._id);
      }
      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      priority: task.priority || 'Medium',
      status: task.status || 'Backlog',
      caseId: task.caseId || '',
      caseName: task.caseName || ''
    });
    setError('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/tasks/${task._id}/comments`,
        { text: newComment.trim() },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      // Refresh comments from server to get the correct order
      await fetchComments();
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
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
          
          <div className="task-form">
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            
            <div className="form-group">
              <label>Assigned To</label>
              {loadingUsers ? (
                <select disabled>
                  <option>Loading users...</option>
                </select>
              ) : (
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  disabled={!isEditing}
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
              <label>Due Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            
            <div className="form-group">
              <label>Priority</label>
              <select
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
            
            <div className="form-group">
              <label>Status</label>
              <select
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
            
            <div className="form-group">
              <label>Case ID</label>
              <input
                type="text"
                name="caseId"
                value={formData.caseId}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
            </div>
            
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                readOnly={!isEditing}
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label>Case Name</label>
              <input
                type="text"
                name="caseName"
                value={formData.caseName}
                onChange={handleInputChange}
                readOnly={!isEditing}
              />
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
                  <div className="avatar-initials">
                    {currentUser ? `${currentUser.firstName?.[0]}${currentUser.lastName?.[0]}` : 'U'}
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
                  <Comment key={comment._id} comment={comment} currentUser={currentUser} />
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="task-actions">
          {isEditing ? (
            <>
              <button className="cancel-button" onClick={handleCancel} disabled={loading}>
                Cancel
              </button>
              <button className="save-button" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button className="cancel-button" onClick={onClose}>
                Close
              </button>
              <button className="save-button" onClick={() => setIsEditing(true)}>
                Edit Task
              </button>
              <button className="delete-button" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete Task'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail; 