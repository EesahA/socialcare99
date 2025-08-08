import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CaseForm from '../components/CaseForm';
import CaseView from '../components/CaseView';
import './Cases.css';

const Cases = () => {
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [showCaseView, setShowCaseView] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCases();
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCases(response.data);
    } catch (error) {
      console.error('Failed to fetch cases:', error);
      setError('Failed to load cases');
    } finally {
      setLoading(false);
    }
  };

  const handleCaseCreated = (newCase) => {
    setCases(prevCases => [newCase, ...prevCases]);
    setShowCaseForm(false);
  };

  const handleDeleteCase = async (caseId) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/cases/${caseId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCases(prevCases => prevCases.filter(c => c._id !== caseId));
      } catch (error) {
        console.error('Failed to delete case:', error);
        if (error.response?.status === 404) {
          alert('You do not have permission to delete this case');
        } else {
          alert('Failed to delete case');
        }
      }
    }
  };

  const handleExpandCase = (caseData) => {
    setSelectedCase(caseData);
    setShowCaseView(true);
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

  const isCaseCreator = (caseData) => {
    return currentUser && caseData.createdBy === currentUser.id;
  };

  const isAssignedToCase = (caseData) => {
    if (!currentUser) return false;
    const currentUserFullName = `${currentUser.firstName} ${currentUser.lastName}`;
    return caseData.assignedSocialWorkers.includes(currentUserFullName);
  };

  const getCaseAccessType = (caseData) => {
    if (isCaseCreator(caseData)) {
      return { type: 'creator', label: 'Created by you', color: '#3498db' };
    } else if (isAssignedToCase(caseData)) {
      return { type: 'assigned', label: 'Assigned to you', color: '#27ae60' };
    }
    return { type: 'viewer', label: 'View only', color: '#95a5a6' };
  };

  if (loading) {
    return (
      <div className="cases-page">
        <div className="cases-loading">Loading cases...</div>
      </div>
    );
  }

  return (
    <div className="cases-page">
      <div className="cases-header">
        <h1>Case Management</h1>
        <button 
          className="create-case-button"
          onClick={() => setShowCaseForm(true)}
        >
          + Create Case
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="cases-content">
        {cases.length === 0 ? (
          <div className="cases-empty">
            <div className="empty-icon">📁</div>
            <h3>No cases yet</h3>
            <p>Create your first case to get started</p>
            <button 
              className="create-first-case-button"
              onClick={() => setShowCaseForm(true)}
            >
              Create Your First Case
            </button>
          </div>
        ) : (
          <div className="cases-grid">
            {cases.map((caseData) => {
              const accessType = getCaseAccessType(caseData);
              return (
                <div key={caseData._id} className="case-card">
                  <div className="case-header">
                    <div className="case-id">{caseData.caseId}</div>
                    <div className="case-actions">
                      <span 
                        className="access-badge"
                        style={{ backgroundColor: accessType.color }}
                      >
                        {accessType.label}
                      </span>
                      <button 
                        className="expand-case-button"
                        onClick={() => handleExpandCase(caseData)}
                        title="View case details"
                      >
                        ⤢
                      </button>
                      {isCaseCreator(caseData) && (
                        <button 
                          className="delete-case-button"
                          onClick={() => handleDeleteCase(caseData._id)}
                          title="Delete case"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="case-content">
                    <h3 className="client-name">{caseData.clientFullName}</h3>
                    
                    <div className="case-meta">
                      <div className="meta-item">
                        <span className="meta-label">Date of Birth:</span>
                        <span className="meta-value">
                          {new Date(caseData.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-label">Reference:</span>
                        <span className="meta-value">{caseData.clientReferenceNumber}</span>
                      </div>
                      
                      <div className="meta-item">
                        <span className="meta-label">Type:</span>
                        <span className="meta-value">{caseData.caseType}</span>
                      </div>
                    </div>
                    
                    <div className="case-status-priority">
                      <div 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(caseData.priorityLevel) }}
                      >
                        {caseData.priorityLevel}
                      </div>
                      <div 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(caseData.caseStatus) }}
                      >
                        {caseData.caseStatus}
                      </div>
                    </div>
                    
                    {caseData.assignedSocialWorkers.length > 0 && (
                      <div className="assigned-workers">
                        <span className="workers-label">Assigned:</span>
                        <div className="workers-list">
                          {caseData.assignedSocialWorkers.map((worker, index) => (
                            <span 
                              key={index} 
                              className={`worker-tag ${worker === `${currentUser?.firstName} ${currentUser?.lastName}` ? 'current-user' : ''}`}
                            >
                              {worker}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="case-date">
                      Created: {new Date(caseData.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CaseForm
        isOpen={showCaseForm}
        onClose={() => setShowCaseForm(false)}
        onCaseCreated={handleCaseCreated}
      />

      <CaseView
        caseData={selectedCase}
        isOpen={showCaseView}
        onClose={() => {
          setShowCaseView(false);
          setSelectedCase(null);
        }}
      />
    </div>
  );
};

export default Cases; 