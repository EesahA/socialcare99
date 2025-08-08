import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import './CaseView.css';

const CaseView = ({ caseData, isOpen, onClose }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (isOpen && caseData) {
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
      fetchComments();
    }
  }, [isOpen, caseData]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/cases/${caseData._id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch case comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/cases/${caseData._id}/comments`, {
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
      await axios.delete(`http://localhost:3000/api/case-comments/${commentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    return comment.userId === currentUser.id;
  };

  if (!isOpen || !caseData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  };

  const renderField = (label, value, type = 'text') => {
    if (!value || value === '') return null;
    
    return (
      <div className="view-field">
        <label className="view-label">{label}:</label>
        <div className="view-value">
          {type === 'date' ? formatDate(value) : 
           type === 'datetime' ? formatDateTime(value) : 
           type === 'textarea' ? (
             <div className="textarea-value">{value}</div>
           ) : value}
        </div>
      </div>
    );
  };

  const renderList = (label, items) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="view-field">
        <label className="view-label">{label}:</label>
        <div className="view-value">
          <div className="list-items">
            {items.map((item, index) => (
              <span key={index} className="list-item">{item}</span>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return '#27ae60';
      case 'Medium': return '#f39c12';
      case 'High': return '#e67e22';
      case 'Urgent': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#3498db';
      case 'Ongoing': return '#f39c12';
      case 'Closed': return '#27ae60';
      case 'On Hold': return '#95a5a6';
      default: return '#95a5a6';
    }
  };

  return (
    <div className="case-view-overlay">
      <div className="case-view-modal">
        <div className="case-view-header">
          <h2>Case Details - {caseData.caseId}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="case-view-content">
          <div className="view-section">
            <h3>Case Overview</h3>
            <div className="view-grid">
              {renderField('Client Full Name', caseData.clientFullName)}
              {renderField('Date of Birth', caseData.dateOfBirth, 'date')}
              {renderField('Client Reference Number', caseData.clientReferenceNumber)}
              {renderField('Case Type', caseData.caseType)}
              {renderField('Other Case Type', caseData.otherCaseType)}
              
              <div className="view-field">
                <label className="view-label">Case Status:</label>
                <div className="view-value">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(caseData.caseStatus) }}
                  >
                    {caseData.caseStatus}
                  </span>
                </div>
              </div>
              
              <div className="view-field">
                <label className="view-label">Priority Level:</label>
                <div className="view-value">
                  <span 
                    className="priority-badge"
                    style={{ backgroundColor: getPriorityColor(caseData.priorityLevel) }}
                  >
                    {caseData.priorityLevel}
                  </span>
                </div>
              </div>
              
              {renderList('Assigned Social Workers', caseData.assignedSocialWorkers)}
            </div>
          </div>

          {(caseData.clientAddress || caseData.phoneNumber || caseData.emailAddress || caseData.livingSituation || caseData.safeguardingConcerns === 'Yes') && (
            <div className="view-section">
              <h3>Contact & Safeguarding Details</h3>
              <div className="view-grid">
                {renderField('Client Address', caseData.clientAddress, 'textarea')}
                {renderField('Phone Number', caseData.phoneNumber)}
                {renderField('Email Address', caseData.emailAddress)}
                {renderField('Living Situation', caseData.livingSituation)}
                
                {caseData.safeguardingConcerns === 'Yes' && (
                  <>
                    <div className="view-field">
                      <label className="view-label">Safeguarding Concerns:</label>
                      <div className="view-value">
                        <span className="safeguarding-yes">Yes</span>
                      </div>
                    </div>
                    {renderField('Safeguarding Details', caseData.safeguardingDetails, 'textarea')}
                  </>
                )}
                
                {caseData.safeguardingConcerns === 'No' && (
                  <div className="view-field">
                    <label className="view-label">Safeguarding Concerns:</label>
                    <div className="view-value">
                      <span className="safeguarding-no">No</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(caseData.meetingDate || caseData.attendees || caseData.typeOfInteraction || caseData.meetingSummary || caseData.concernsRaised || caseData.immediateActionsTaken || caseData.clientWishesFeelings) && (
            <div className="view-section">
              <h3>Meeting Notes / Visit Log</h3>
              <div className="view-grid">
                {renderField('Meeting Date', caseData.meetingDate, 'date')}
                {renderField('Type of Interaction', caseData.typeOfInteraction)}
                {renderField('Attendees', caseData.attendees)}
                {renderField('Meeting Summary / Observations', caseData.meetingSummary, 'textarea')}
                {renderField('Concerns Raised', caseData.concernsRaised, 'textarea')}
                {renderField('Immediate Actions Taken', caseData.immediateActionsTaken, 'textarea')}
                {renderField('Client Wishes & Feelings', caseData.clientWishesFeelings, 'textarea')}
              </div>
            </div>
          )}

          {(caseData.newTasks && caseData.newTasks.length > 0 || caseData.nextPlannedReviewDate) && (
            <div className="view-section">
              <h3>Follow-Up Actions / Tasks</h3>
              <div className="view-grid">
                {renderList('New Tasks from Meeting', caseData.newTasks)}
                {renderField('Next Planned Review Date', caseData.nextPlannedReviewDate, 'date')}
              </div>
            </div>
          )}

          <div className="view-section">
            <h3>Case Information</h3>
            <div className="view-grid">
              {renderField('Created', caseData.createdAt, 'datetime')}
              {renderField('Last Updated', caseData.updatedAt, 'datetime')}
            </div>
          </div>

          <div className="view-section">
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

export default CaseView; 