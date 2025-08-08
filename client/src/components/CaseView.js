import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import './CaseView.css';

const CaseView = ({ caseData, isOpen, onClose, onCaseUpdated, onCaseDeleted }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentCaseData, setCurrentCaseData] = useState(caseData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    setCurrentCaseData(caseData);
  }, [caseData]);

  useEffect(() => {
    if (isOpen && caseData?._id) {
      fetchComments();
      fetchCurrentUser();
      fetchUsers();
    }
  }, [isOpen, caseData?._id]);

  const fetchCurrentUser = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await axios.get('http://localhost:3000/api/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/cases/${caseData._id}/comments`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const sortedComments = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setComments(sortedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/cases/${caseData._id}/comments`,
        { text: newComment.trim() },
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      await fetchComments();
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setCommentLoading(true);
      const response = await axios.post(
        `http://localhost:3000/api/cases/${caseData._id}/upload`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.attachment) {
        await fetchComments();
        await refreshCaseData();
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setCommentLoading(false);
    }
  };

  const refreshCaseData = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/api/cases/${caseData._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCurrentCaseData(response.data);
      if (onCaseUpdated) {
        onCaseUpdated(response.data);
      }
    } catch (error) {
      console.error('Error refreshing case data:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.put(`http://localhost:3000/api/cases/${caseData._id}`, currentCaseData, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      setIsEditing(false);
      setCurrentCaseData(response.data);
      if (onCaseUpdated) {
        onCaseUpdated(response.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update case');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this case? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`http://localhost:3000/api/cases/${caseData._id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      onClose();
      if (onCaseDeleted) {
        onCaseDeleted(caseData._id);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete case');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setCurrentCaseData(caseData);
    setError('');
  };

  const canEdit = () => {
    if (!currentUser || !currentCaseData) return false;
    const currentUserFullName = `${currentUser.firstName} ${currentUser.lastName}`;
    return currentCaseData.createdBy === currentUser.id || 
           currentCaseData.assignedSocialWorkers?.includes(currentUserFullName);
  };

  const canDelete = () => {
    if (!currentUser || !currentCaseData) return false;
    return currentCaseData.createdBy === currentUser.id;
  };

  const canDeleteAttachments = () => {
    if (!currentUser || !currentCaseData) return false;
    return currentCaseData.createdBy === currentUser.id;
  };

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
    
    let displayValue = value;
    if (type === 'date') {
      displayValue = formatDate(value);
    } else if (type === 'datetime') {
      displayValue = formatDateTime(value);
    } else if (Array.isArray(value)) {
      displayValue = value.join(', ');
    }

    return (
      <div className="case-field">
        <span className="case-field-label">{label}</span>
        <div className="case-field-value">{displayValue}</div>
      </div>
    );
  };

  const renderEditableField = (label, fieldName, value, type = 'text', options = null) => {
    if (isEditing) {
      return (
        <div className="case-field">
          <span className="case-field-label">{label}</span>
          {type === 'textarea' ? (
            <textarea
              value={value || ''}
              onChange={(e) => setCurrentCaseData(prev => ({ ...prev, [fieldName]: e.target.value }))}
              className="case-field-input"
              rows="3"
            />
          ) : type === 'select' && options ? (
            <select
              value={value || ''}
              onChange={(e) => setCurrentCaseData(prev => ({ ...prev, [fieldName]: e.target.value }))}
              className="case-field-input"
            >
              <option value="">Select {label}</option>
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : type === 'multiselect' && options ? (
            <div className="multiselect-container">
              {options.map((option, index) => (
                <label key={index} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) ? value.includes(option.value) : false}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? [...value] : [];
                      if (e.target.checked) {
                        currentValues.push(option.value);
                      } else {
                        const index = currentValues.indexOf(option.value);
                        if (index > -1) {
                          currentValues.splice(index, 1);
                        }
                      }
                      setCurrentCaseData(prev => ({ ...prev, [fieldName]: currentValues }));
                    }}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          ) : (
            <input
              type={type}
              value={value || ''}
              onChange={(e) => setCurrentCaseData(prev => ({ ...prev, [fieldName]: e.target.value }))}
              className="case-field-input"
            />
          )}
        </div>
      );
    }
    return renderField(label, value, type);
  };

  const renderStatusBadge = (status) => {
    if (!status) return null;
    return (
      <div className="case-field">
        <span className="case-field-label">Status</span>
        <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
          {status}
        </span>
      </div>
    );
  };

  const renderPriorityBadge = (priority) => {
    if (!priority) return null;
    return (
      <div className="case-field">
        <span className="case-field-label">Priority</span>
        <span className={`priority-badge ${priority.toLowerCase()}`}>
          {priority}
        </span>
      </div>
    );
  };

  const handleDeleteAttachment = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:3000/api/cases/${caseData._id}/attachments/${filename}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );

      // Refresh case data to show updated attachments
      await refreshCaseData();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Failed to delete attachment. Please try again.');
    }
  };

  const renderAttachments = () => {
    if (!currentCaseData?.attachments || currentCaseData.attachments.length === 0) {
      return null;
    }

    return (
      <div className="case-section">
        <h3>Attachments</h3>
        <div className="attachments-list">
          {currentCaseData.attachments.map((attachment, index) => (
            <div key={index} className="attachment-item">
              <a 
                href={`http://localhost:3000/uploads/${attachment.filename}`}
                target="_blank"
                rel="noopener noreferrer"
                className="attachment-link"
              >
                📎 {attachment.originalName}
              </a>
              <span className="attachment-size">
                ({(attachment.size / 1024).toFixed(1)} KB)
              </span>
              {canDeleteAttachments() && (
                <button 
                  className="delete-attachment-btn"
                  onClick={() => handleDeleteAttachment(attachment.filename)}
                  title="Delete attachment"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isOpen || !currentCaseData) return null;

  const caseTypeOptions = [
    { value: 'Child Protection', label: 'Child Protection' },
    { value: 'Mental Health', label: 'Mental Health' },
    { value: 'Elder Care', label: 'Elder Care' },
    { value: 'Disability Support', label: 'Disability Support' },
    { value: 'Domestic Abuse', label: 'Domestic Abuse' },
    { value: 'Housing & Homelessness', label: 'Housing & Homelessness' },
    { value: 'Other', label: 'Other' }
  ];

  const caseStatusOptions = [
    { value: 'Open', label: 'Open' },
    { value: 'Ongoing', label: 'Ongoing' },
    { value: 'Closed', label: 'Closed' },
    { value: 'On Hold', label: 'On Hold' }
  ];

  const priorityOptions = [
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  const livingSituationOptions = [
    { value: 'Alone', label: 'Alone' },
    { value: 'With Family', label: 'With Family' },
    { value: 'Foster Care', label: 'Foster Care' },
    { value: 'Residential Home', label: 'Residential Home' },
    { value: 'Homeless', label: 'Homeless' }
  ];

  const interactionTypeOptions = [
    { value: 'Home Visit', label: 'Home Visit' },
    { value: 'Office Meeting', label: 'Office Meeting' },
    { value: 'Phone Call', label: 'Phone Call' },
    { value: 'Virtual Meeting', label: 'Virtual Meeting' }
  ];

  const userOptions = users.map(user => ({
    value: `${user.firstName} ${user.lastName}`,
    label: `${user.firstName} ${user.lastName}`
  }));

  return (
    <div className="case-view-overlay">
      <div className="case-view-modal">
        <div className="case-view-header">
          <h2>Case Details - {currentCaseData.caseId}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="case-view-content">
          {error && <div className="error-message">{error}</div>}
          
          <div className="case-sections">
            <div className="case-section">
              <h3>Case Overview</h3>
              {renderEditableField('Client Full Name', 'clientFullName', currentCaseData.clientFullName)}
              {renderEditableField('Date of Birth', 'dateOfBirth', currentCaseData.dateOfBirth, 'date')}
              {renderEditableField('Client Reference Number', 'clientReferenceNumber', currentCaseData.clientReferenceNumber)}
              {renderEditableField('Case Type', 'caseType', currentCaseData.caseType, 'select', caseTypeOptions)}
              {renderEditableField('Other Case Type', 'otherCaseType', currentCaseData.otherCaseType)}
              {renderEditableField('Case Status', 'caseStatus', currentCaseData.caseStatus, 'select', caseStatusOptions)}
              {renderEditableField('Priority Level', 'priorityLevel', currentCaseData.priorityLevel, 'select', priorityOptions)}
              {renderEditableField('Assigned Social Workers', 'assignedSocialWorkers', currentCaseData.assignedSocialWorkers, 'multiselect', userOptions)}
            </div>

            <div className="case-section">
              <h3>Contact & Safeguarding Details</h3>
              {renderEditableField('Client Address', 'clientAddress', currentCaseData.clientAddress)}
              {renderEditableField('Phone Number', 'phoneNumber', currentCaseData.phoneNumber)}
              {renderEditableField('Email Address', 'emailAddress', currentCaseData.emailAddress)}
              {renderEditableField('Living Situation', 'livingSituation', currentCaseData.livingSituation, 'select', livingSituationOptions)}
              {renderEditableField('Safeguarding Concerns', 'safeguardingConcerns', currentCaseData.safeguardingConcerns)}
              {renderEditableField('Safeguarding Details', 'safeguardingDetails', currentCaseData.safeguardingDetails, 'textarea')}
            </div>

            <div className="case-section">
              <h3>Meeting Notes / Visit Log</h3>
              {renderEditableField('Meeting Date', 'meetingDate', currentCaseData.meetingDate, 'date')}
              {renderEditableField('Attendees', 'attendees', currentCaseData.attendees)}
              {renderEditableField('Type of Interaction', 'typeOfInteraction', currentCaseData.typeOfInteraction, 'select', interactionTypeOptions)}
              {renderEditableField('Meeting Summary', 'meetingSummary', currentCaseData.meetingSummary, 'textarea')}
              {renderEditableField('Concerns Raised', 'concernsRaised', currentCaseData.concernsRaised, 'textarea')}
              {renderEditableField('Immediate Actions Taken', 'immediateActionsTaken', currentCaseData.immediateActionsTaken, 'textarea')}
              {renderEditableField('Client Wishes & Feelings', 'clientWishesFeelings', currentCaseData.clientWishesFeelings, 'textarea')}
            </div>

            <div className="case-section">
              <h3>Follow-Up Actions</h3>
              {renderEditableField('New Tasks', 'newTasks', currentCaseData.newTasks, 'textarea')}
              {renderEditableField('Next Planned Review Date', 'nextPlannedReviewDate', currentCaseData.nextPlannedReviewDate, 'date')}
            </div>

            {renderAttachments()}
          </div>

          <div className="file-upload-section">
            <h3>Upload Files</h3>
            <label className="file-upload-label">
              <input 
                type="file" 
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
              />
              📎 Choose File to Upload
            </label>
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

        <div className="case-actions">
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
              {canEdit() && (
                <button className="edit-button" onClick={handleEdit}>
                  Edit Case
                </button>
              )}
              {canDelete() && (
                <button className="delete-button" onClick={handleDelete} disabled={loading}>
                  {loading ? 'Deleting...' : 'Delete Case'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaseView; 