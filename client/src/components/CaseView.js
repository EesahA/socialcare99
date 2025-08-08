import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './Comment';
import './CaseView.css';

const CaseView = ({ caseData, isOpen, onClose, onCaseUpdated }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});
  const [currentCaseData, setCurrentCaseData] = useState(null);

  useEffect(() => {
    if (isOpen && caseData) {
      setCurrentCaseData(caseData);
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
      setFormData({
        clientFullName: caseData.clientFullName || '',
        dateOfBirth: caseData.dateOfBirth ? caseData.dateOfBirth.split('T')[0] : '',
        clientReferenceNumber: caseData.clientReferenceNumber || '',
        caseType: caseData.caseType || '',
        otherCaseType: caseData.otherCaseType || '',
        caseStatus: caseData.caseStatus || 'Open',
        priorityLevel: caseData.priorityLevel || 'Medium',
        assignedSocialWorkers: caseData.assignedSocialWorkers || [],
        clientAddress: caseData.clientAddress || '',
        phoneNumber: caseData.phoneNumber || '',
        emailAddress: caseData.emailAddress || '',
        livingSituation: caseData.livingSituation || '',
        safeguardingConcerns: caseData.safeguardingConcerns || 'No',
        safeguardingDetails: caseData.safeguardingDetails || '',
        meetingDate: caseData.meetingDate ? caseData.meetingDate.split('T')[0] : '',
        attendees: caseData.attendees || '',
        typeOfInteraction: caseData.typeOfInteraction || '',
        meetingSummary: caseData.meetingSummary || '',
        concernsRaised: caseData.concernsRaised || '',
        immediateActionsTaken: caseData.immediateActionsTaken || '',
        clientWishesFeelings: caseData.clientWishesFeelings || '',
        newTasks: caseData.newTasks || [],
        nextPlannedReviewDate: caseData.nextPlannedReviewDate ? caseData.nextPlannedReviewDate.split('T')[0] : ''
      });
      fetchComments();
    }
  }, [isOpen, caseData]);

  const fetchComments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/cases/${currentCaseData._id}/comments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setComments(response.data);
    } catch (error) {
      console.error('Failed to fetch case comments:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (name === 'assignedSocialWorkers') {
        const updatedWorkers = checked 
          ? [...formData.assignedSocialWorkers, value]
          : formData.assignedSocialWorkers.filter(worker => worker !== value);
        setFormData(prev => ({ ...prev, assignedSocialWorkers: updatedWorkers }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked ? value : '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');

      const updateData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        meetingDate: formData.meetingDate ? new Date(formData.meetingDate) : undefined,
        nextPlannedReviewDate: formData.nextPlannedReviewDate ? new Date(formData.nextPlannedReviewDate) : undefined
      };

      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === '') {
          delete updateData[key];
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.put(`http://localhost:3000/api/cases/${currentCaseData._id}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update the local case data immediately
      setCurrentCaseData(response.data);
      
      // Call the parent callback to update the cases list
      onCaseUpdated(response.data);
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update case:', error);
      if (error.response?.data?.errors) {
        setError(`Validation errors: ${error.response.data.errors.join(', ')}`);
      } else {
        setError(error.response?.data?.message || 'Failed to update case');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      clientFullName: currentCaseData.clientFullName || '',
      dateOfBirth: currentCaseData.dateOfBirth ? currentCaseData.dateOfBirth.split('T')[0] : '',
      clientReferenceNumber: currentCaseData.clientReferenceNumber || '',
      caseType: currentCaseData.caseType || '',
      otherCaseType: currentCaseData.otherCaseType || '',
      caseStatus: currentCaseData.caseStatus || 'Open',
      priorityLevel: currentCaseData.priorityLevel || 'Medium',
      assignedSocialWorkers: currentCaseData.assignedSocialWorkers || [],
      clientAddress: currentCaseData.clientAddress || '',
      phoneNumber: currentCaseData.phoneNumber || '',
      emailAddress: currentCaseData.emailAddress || '',
      livingSituation: currentCaseData.livingSituation || '',
      safeguardingConcerns: currentCaseData.safeguardingConcerns || 'No',
      safeguardingDetails: currentCaseData.safeguardingDetails || '',
      meetingDate: currentCaseData.meetingDate ? currentCaseData.meetingDate.split('T')[0] : '',
      attendees: currentCaseData.attendees || '',
      typeOfInteraction: currentCaseData.typeOfInteraction || '',
      meetingSummary: currentCaseData.meetingSummary || '',
      concernsRaised: currentCaseData.concernsRaised || '',
      immediateActionsTaken: currentCaseData.immediateActionsTaken || '',
      clientWishesFeelings: currentCaseData.clientWishesFeelings || '',
      newTasks: currentCaseData.newTasks || [],
      nextPlannedReviewDate: currentCaseData.nextPlannedReviewDate ? currentCaseData.nextPlannedReviewDate.split('T')[0] : ''
    });
    setIsEditing(false);
    setError('');
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/cases/${currentCaseData._id}/comments`, {
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

  const canEditCase = () => {
    if (!currentUser || !currentCaseData) return false;
    const currentUserFullName = `${currentUser.firstName} ${currentUser.lastName}`;
    return currentCaseData.createdBy === currentUser.id || currentCaseData.assignedSocialWorkers.includes(currentUserFullName);
  };

  const canDeleteComment = (comment) => {
    if (!currentUser) return false;
    return comment.userId === currentUser.id;
  };

  if (!isOpen || !currentCaseData) return null;

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
          <h2>{isEditing ? 'Edit Case' : 'Case Details'} - {currentCaseData.caseId}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="case-view-content">
          {error && <div className="error-message">{error}</div>}

          {isEditing ? (
            <div className="edit-form">
              <div className="view-section">
                <h3>Case Overview</h3>
                <div className="view-grid">
                  <div className="view-field">
                    <label className="view-label">Client Full Name: *</label>
                    <input
                      type="text"
                      name="clientFullName"
                      value={formData.clientFullName}
                      onChange={handleInputChange}
                      placeholder="Enter client's full name"
                      required
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Date of Birth: *</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Client Reference Number: *</label>
                    <input
                      type="text"
                      name="clientReferenceNumber"
                      value={formData.clientReferenceNumber}
                      onChange={handleInputChange}
                      placeholder="Enter reference number"
                      required
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Case Type: *</label>
                    <select
                      name="caseType"
                      value={formData.caseType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select case type</option>
                      <option value="Child Protection">Child Protection</option>
                      <option value="Mental Health">Mental Health</option>
                      <option value="Elder Care">Elder Care</option>
                      <option value="Disability Support">Disability Support</option>
                      <option value="Domestic Abuse">Domestic Abuse</option>
                      <option value="Housing & Homelessness">Housing & Homelessness</option>
                      <option value="Other">Other</option>
                    </select>
                    {formData.caseType === 'Other' && (
                      <input
                        type="text"
                        name="otherCaseType"
                        value={formData.otherCaseType}
                        onChange={handleInputChange}
                        placeholder="Specify other case type"
                        className="other-case-type-input"
                      />
                    )}
                  </div>

                  <div className="view-field">
                    <label className="view-label">Case Status:</label>
                    <select
                      name="caseStatus"
                      value={formData.caseStatus}
                      onChange={handleInputChange}
                    >
                      <option value="Open">Open</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Closed">Closed</option>
                      <option value="On Hold">On Hold</option>
                    </select>
                  </div>

                  <div className="view-field">
                    <label className="view-label">Priority Level:</label>
                    <select
                      name="priorityLevel"
                      value={formData.priorityLevel}
                      onChange={handleInputChange}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="view-section">
                <h3>Contact & Safeguarding Details</h3>
                <div className="view-grid">
                  <div className="view-field">
                    <label className="view-label">Client Address:</label>
                    <textarea
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleInputChange}
                      placeholder="Enter full address"
                      rows="3"
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Phone Number:</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Email Address:</label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Living Situation:</label>
                    <select
                      name="livingSituation"
                      value={formData.livingSituation}
                      onChange={handleInputChange}
                    >
                      <option value="">Select living situation</option>
                      <option value="Alone">Alone</option>
                      <option value="With Family">With Family</option>
                      <option value="Foster Care">Foster Care</option>
                      <option value="Residential Home">Residential Home</option>
                      <option value="Homeless">Homeless</option>
                    </select>
                  </div>

                  <div className="view-field">
                    <label className="view-label">Safeguarding Concerns:</label>
                    <select
                      name="safeguardingConcerns"
                      value={formData.safeguardingConcerns}
                      onChange={handleInputChange}
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {formData.safeguardingConcerns === 'Yes' && (
                    <div className="view-field">
                      <label className="view-label">Safeguarding Details:</label>
                      <textarea
                        name="safeguardingDetails"
                        value={formData.safeguardingDetails}
                        onChange={handleInputChange}
                        placeholder="Please provide details of safeguarding concerns"
                        rows="4"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="view-section">
                <h3>Meeting Notes / Visit Log</h3>
                <div className="view-grid">
                  <div className="view-field">
                    <label className="view-label">Meeting Date:</label>
                    <input
                      type="date"
                      name="meetingDate"
                      value={formData.meetingDate}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Type of Interaction:</label>
                    <select
                      name="typeOfInteraction"
                      value={formData.typeOfInteraction}
                      onChange={handleInputChange}
                    >
                      <option value="">Select interaction type</option>
                      <option value="Home Visit">Home Visit</option>
                      <option value="Office Meeting">Office Meeting</option>
                      <option value="Phone Call">Phone Call</option>
                      <option value="Virtual Meeting">Virtual Meeting</option>
                    </select>
                  </div>

                  <div className="view-field">
                    <label className="view-label">Attendees:</label>
                    <input
                      type="text"
                      name="attendees"
                      value={formData.attendees}
                      onChange={handleInputChange}
                      placeholder="Social worker, family, school staff, police, etc."
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Meeting Summary / Observations:</label>
                    <textarea
                      name="meetingSummary"
                      value={formData.meetingSummary}
                      onChange={handleInputChange}
                      placeholder="Enter meeting summary and observations"
                      rows="6"
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Concerns Raised:</label>
                    <textarea
                      name="concernsRaised"
                      value={formData.concernsRaised}
                      onChange={handleInputChange}
                      placeholder="Enter any concerns raised during the meeting"
                      rows="3"
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Immediate Actions Taken:</label>
                    <textarea
                      name="immediateActionsTaken"
                      value={formData.immediateActionsTaken}
                      onChange={handleInputChange}
                      placeholder="Enter immediate actions taken"
                      rows="3"
                    />
                  </div>

                  <div className="view-field">
                    <label className="view-label">Client Wishes & Feelings:</label>
                    <textarea
                      name="clientWishesFeelings"
                      value={formData.clientWishesFeelings}
                      onChange={handleInputChange}
                      placeholder="Enter client's wishes and feelings"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="view-section">
                <h3>Follow-Up Actions / Tasks</h3>
                <div className="view-grid">
                  <div className="view-field">
                    <label className="view-label">Next Planned Review Date:</label>
                    <input
                      type="date"
                      name="nextPlannedReviewDate"
                      value={formData.nextPlannedReviewDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="view-section">
                <h3>Case Overview</h3>
                <div className="view-grid">
                  {renderField('Client Full Name', currentCaseData.clientFullName)}
                  {renderField('Date of Birth', currentCaseData.dateOfBirth, 'date')}
                  {renderField('Client Reference Number', currentCaseData.clientReferenceNumber)}
                  {renderField('Case Type', currentCaseData.caseType)}
                  {renderField('Other Case Type', currentCaseData.otherCaseType)}
                  
                  <div className="view-field">
                    <label className="view-label">Case Status:</label>
                    <div className="view-value">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(currentCaseData.caseStatus) }}
                      >
                        {currentCaseData.caseStatus}
                      </span>
                    </div>
                  </div>
                  
                  <div className="view-field">
                    <label className="view-label">Priority Level:</label>
                    <div className="view-value">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(currentCaseData.priorityLevel) }}
                      >
                        {currentCaseData.priorityLevel}
                      </span>
                    </div>
                  </div>
                  
                  {renderList('Assigned Social Workers', currentCaseData.assignedSocialWorkers)}
                </div>
              </div>

              {(currentCaseData.clientAddress || currentCaseData.phoneNumber || currentCaseData.emailAddress || currentCaseData.livingSituation || currentCaseData.safeguardingConcerns === 'Yes') && (
                <div className="view-section">
                  <h3>Contact & Safeguarding Details</h3>
                  <div className="view-grid">
                    {renderField('Client Address', currentCaseData.clientAddress, 'textarea')}
                    {renderField('Phone Number', currentCaseData.phoneNumber)}
                    {renderField('Email Address', currentCaseData.emailAddress)}
                    {renderField('Living Situation', currentCaseData.livingSituation)}
                    
                    {currentCaseData.safeguardingConcerns === 'Yes' && (
                      <>
                        <div className="view-field">
                          <label className="view-label">Safeguarding Concerns:</label>
                          <div className="view-value">
                            <span className="safeguarding-yes">Yes</span>
                          </div>
                        </div>
                        {renderField('Safeguarding Details', currentCaseData.safeguardingDetails, 'textarea')}
                      </>
                    )}
                    
                    {currentCaseData.safeguardingConcerns === 'No' && (
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

              {(currentCaseData.meetingDate || currentCaseData.attendees || currentCaseData.typeOfInteraction || currentCaseData.meetingSummary || currentCaseData.concernsRaised || currentCaseData.immediateActionsTaken || currentCaseData.clientWishesFeelings) && (
                <div className="view-section">
                  <h3>Meeting Notes / Visit Log</h3>
                  <div className="view-grid">
                    {renderField('Meeting Date', currentCaseData.meetingDate, 'date')}
                    {renderField('Type of Interaction', currentCaseData.typeOfInteraction)}
                    {renderField('Attendees', currentCaseData.attendees)}
                    {renderField('Meeting Summary / Observations', currentCaseData.meetingSummary, 'textarea')}
                    {renderField('Concerns Raised', currentCaseData.concernsRaised, 'textarea')}
                    {renderField('Immediate Actions Taken', currentCaseData.immediateActionsTaken, 'textarea')}
                    {renderField('Client Wishes & Feelings', currentCaseData.clientWishesFeelings, 'textarea')}
                  </div>
                </div>
              )}

              {(currentCaseData.newTasks && currentCaseData.newTasks.length > 0 || currentCaseData.nextPlannedReviewDate) && (
                <div className="view-section">
                  <h3>Follow-Up Actions / Tasks</h3>
                  <div className="view-grid">
                    {renderList('New Tasks from Meeting', currentCaseData.newTasks)}
                    {renderField('Next Planned Review Date', currentCaseData.nextPlannedReviewDate, 'date')}
                  </div>
                </div>
              )}

              <div className="view-section">
                <h3>Case Information</h3>
                <div className="view-grid">
                  {renderField('Created', currentCaseData.createdAt, 'datetime')}
                  {renderField('Last Updated', currentCaseData.updatedAt, 'datetime')}
                </div>
              </div>
            </>
          )}

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

        <div className="case-view-actions">
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
              {canEditCase() && (
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Case
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

export default CaseView; 