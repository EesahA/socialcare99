import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CaseForm from '../components/CaseForm';
import CaseView from '../components/CaseView';
import './Cases.css';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [archivedCases, setArchivedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showCaseView, setShowCaseView] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archive'

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      
      // Fetch active cases
      const activeResponse = await axios.get('http://localhost:3000/api/cases?archived=false', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCases(activeResponse.data);
      
      // Fetch archived cases
      const archivedResponse = await axios.get('http://localhost:3000/api/cases?archived=true', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setArchivedCases(archivedResponse.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCaseCreated = (caseData) => {
    setCases(prev => [caseData, ...prev]);
    setShowCaseForm(false);
  };

  const handleExpandCase = (caseData) => {
    setSelectedCase(caseData);
    setShowCaseView(true);
  };

  const handleCaseUpdated = (updatedCase) => {
    setCases(prev => prev.map(c => c._id === updatedCase._id ? updatedCase : c));
    setSelectedCase(updatedCase);
  };

  const handleCaseDeleted = (caseId) => {
    // Remove the case from the local state
    setCases(prev => prev.filter(c => c._id !== caseId));
    setArchivedCases(prev => prev.filter(c => c._id !== caseId));
    
    // Close the case view modal
    setShowCaseView(false);
    setSelectedCase(null);
    
    // Also refresh from server to ensure consistency
    fetchCases();
  };

  const handleArchiveCase = async (caseId) => {
    try {
      const response = await axios.patch(`http://localhost:3000/api/cases/${caseId}/archive`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Move case from active to archived
      setCases(prev => prev.filter(c => c._id !== caseId));
      setArchivedCases(prev => [response.data, ...prev]);
      
      // Close case view if it was the archived case
      if (selectedCase && selectedCase._id === caseId) {
        setShowCaseView(false);
        setSelectedCase(null);
      }
    } catch (error) {
      console.error('Error archiving case:', error);
      alert('Failed to archive case');
    }
  };

  const handleUnarchiveCase = async (caseId) => {
    try {
      const response = await axios.patch(`http://localhost:3000/api/cases/${caseId}/unarchive`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Move case from archived to active
      setArchivedCases(prev => prev.filter(c => c._id !== caseId));
      setCases(prev => [response.data, ...prev]);
      
      // Close case view if it was the unarchived case
      if (selectedCase && selectedCase._id === caseId) {
        setShowCaseView(false);
        setSelectedCase(null);
      }
    } catch (error) {
      console.error('Error unarchiving case:', error);
      alert('Failed to unarchive case');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusClass = (status) => {
    return status.toLowerCase().replace(' ', '-');
  };

  const getPriorityClass = (priority) => {
    return priority.toLowerCase();
  };

  if (loading) {
    return (
      <div className="cases-page">
        <div className="cases-header">
          <h1>Case Management</h1>
          <button className="create-case-button" disabled>
            + Create Case
          </button>
        </div>
        <div className="cases-content">
          <div className="cases-loading">Loading cases...</div>
        </div>
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

      <div className="cases-tabs">
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Cases ({cases.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          Archive ({archivedCases.length})
        </button>
      </div>

      <div className="cases-content">
        {activeTab === 'active' ? (
          cases.length === 0 ? (
            <div className="cases-empty">
              <p>No active cases found. Create your first case to get started.</p>
            </div>
          ) : (
            <div className="cases-grid">
              {cases.map((caseData) => (
                <div key={caseData._id} className="case-card">
                  <div className="case-header">
                    <h3 className="case-id">{caseData.caseId}</h3>
                    <div className="case-actions">
                      <button 
                        className="expand-case-button"
                        onClick={() => handleExpandCase(caseData)}
                        title="View case details"
                      >
                        ⤢
                      </button>
                    </div>
                  </div>
                  
                  <div className="case-info">
                    <div className="case-field">
                      <span className="case-field-label">Client Name</span>
                      <span className="case-field-value">{caseData.clientFullName}</span>
                    </div>
                    
                    <div className="case-field">
                      <span className="case-field-label">Case Type</span>
                      <span className="case-field-value">{caseData.caseType}</span>
                    </div>
                    
                    <div className="case-field">
                      <span className="case-field-label">Status</span>
                      <span className={`case-status ${getStatusClass(caseData.caseStatus)}`}>
                        {caseData.caseStatus}
                      </span>
                    </div>
                    
                    <div className="case-field">
                      <span className="case-field-label">Priority</span>
                      <span className={`case-priority ${getPriorityClass(caseData.priorityLevel)}`}>
                        {caseData.priorityLevel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="case-meta">
                    <span className="case-date">
                      Created: {formatDate(caseData.createdAt)}
                    </span>
                    <span className="case-assignees" title={caseData.assignedSocialWorkers?.join(', ')}>
                      {caseData.assignedSocialWorkers?.length > 0 
                        ? `${caseData.assignedSocialWorkers.length} assigned`
                        : 'Unassigned'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          archivedCases.length === 0 ? (
            <div className="cases-empty">
              <p>No archived cases found.</p>
            </div>
          ) : (
            <div className="cases-grid">
              {archivedCases.map((caseData) => (
                <div key={caseData._id} className="case-card archived">
                  <div className="case-header">
                    <h3 className="case-id">{caseData.caseId}</h3>
                    <div className="case-actions">
                      <button 
                        className="expand-case-button"
                        onClick={() => handleExpandCase(caseData)}
                        title="View case details"
                      >
                        ⤢
                      </button>
                    </div>
                  </div>
                  
                  <div className="case-info">
                    <div className="case-field">
                      <span className="case-field-label">Client Name</span>
                      <span className="case-field-value">{caseData.clientFullName}</span>
                    </div>
                    
                    <div className="case-field">
                      <span className="case-field-label">Case Type</span>
                      <span className="case-field-value">{caseData.caseType}</span>
                    </div>
                    
                    <div className="case-field">
                      <span className="case-field-label">Status</span>
                      <span className={`case-status ${getStatusClass(caseData.caseStatus)}`}>
                        {caseData.caseStatus}
                      </span>
                    </div>
                    
                    <div className="case-field">
                      <span className="case-field-label">Priority</span>
                      <span className={`case-priority ${getPriorityClass(caseData.priorityLevel)}`}>
                        {caseData.priorityLevel}
                      </span>
                    </div>
                  </div>
                  
                  <div className="case-meta">
                    <span className="case-date">
                      Created: {formatDate(caseData.createdAt)}
                    </span>
                    <span className="case-date">
                      Archived: {formatDate(caseData.archivedAt)}
                    </span>
                    <span className="case-assignees" title={caseData.assignedSocialWorkers?.join(', ')}>
                      {caseData.assignedSocialWorkers?.length > 0 
                        ? `${caseData.assignedSocialWorkers.length} assigned`
                        : 'Unassigned'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <CaseForm
        isOpen={showCaseForm}
        onClose={() => setShowCaseForm(false)}
        onCaseCreated={handleCaseCreated}
      />

      {selectedCase && (
        <CaseView
          caseData={selectedCase}
          isOpen={showCaseView}
          onClose={() => {
            setShowCaseView(false);
            setSelectedCase(null);
          }}
          onCaseUpdated={handleCaseUpdated}
          onCaseDeleted={handleCaseDeleted}
          onArchiveCase={handleArchiveCase}
          onUnarchiveCase={handleUnarchiveCase}
        />
      )}
    </div>
  );
};

export default Cases; 