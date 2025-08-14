import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CaseForm.css';

const CaseForm = ({ isOpen, onClose, onCaseCreated }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    caseId: generateCaseId(),
    clientFullName: '',
    dateOfBirth: '',
    clientReferenceNumber: '',
    caseType: '',
    otherCaseType: '',
    caseStatus: 'Open',
    priorityLevel: 'Medium',
    assignedSocialWorkers: [],
    clientAddress: '',
    phoneNumber: '',
    emailAddress: '',
    livingSituation: '',
    safeguardingConcerns: 'No',
    safeguardingDetails: '',
    meetingDate: '',
    attendees: '',
    typeOfInteraction: '',
    meetingSummary: '',
    concernsRaised: '',
    immediateActionsTaken: '',
    clientWishesFeelings: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function generateCaseId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `CASE-${year}${month}-${random}`;
  }

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchCurrentUser();
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

  const fetchCurrentUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(user);
      
      // Pre-select the current user as an assigned social worker
      if (user && user.firstName && user.lastName) {
        const currentUserFullName = `${user.firstName} ${user.lastName}`;
        setFormData(prev => ({
          ...prev,
          assignedSocialWorkers: [currentUserFullName]
        }));
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      setCurrentUser(null);
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

  const nextPage = (e) => {
    e.preventDefault();
    
    if (currentPage === 1) {
      if (!formData.clientFullName || !formData.dateOfBirth || !formData.clientReferenceNumber) {
        setError('Please fill in all required fields: Client Full Name, Date of Birth, and Client Reference Number');
        return;
      }
      
      if (!formData.caseType) {
        setError('Please select a case type');
        return;
      }
      
      if (formData.caseType === 'Other' && !formData.otherCaseType) {
        setError('Please specify the other case type');
        return;
      }
      
      if (!formData.assignedSocialWorkers || formData.assignedSocialWorkers.length === 0) {
        setError('Please assign at least one social worker to this case');
        return;
      }
      
      setError('');
      setCurrentPage(2);
    } else if (currentPage === 2) {
      setError('');
      setCurrentPage(3);
    }
    // Removed page 4 navigation - case will be submitted after page 3
  };

  const prevPage = (e) => {
    e.preventDefault();
    setCurrentPage(currentPage - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.clientFullName || !formData.dateOfBirth || !formData.clientReferenceNumber) {
      setError('Please fill in all required fields: Client Full Name, Date of Birth, and Client Reference Number');
      return;
    }

    if (!formData.caseType) {
      setError('Please select a case type');
      return;
    }

    if (formData.caseType === 'Other' && !formData.otherCaseType) {
      setError('Please specify the other case type');
      return;
    }

    if (!formData.assignedSocialWorkers || formData.assignedSocialWorkers.length === 0) {
      setError('Please assign at least one social worker to this case');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const caseData = {
        caseId: formData.caseId,
        clientFullName: formData.clientFullName,
        dateOfBirth: new Date(formData.dateOfBirth),
        clientReferenceNumber: formData.clientReferenceNumber,
        caseType: formData.caseType === 'Other' ? formData.otherCaseType : formData.caseType,
        caseStatus: formData.caseStatus,
        priorityLevel: formData.priorityLevel,
        assignedSocialWorkers: formData.assignedSocialWorkers,
        clientAddress: formData.clientAddress || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        emailAddress: formData.emailAddress || undefined,
        livingSituation: formData.livingSituation || undefined,
        safeguardingConcerns: formData.safeguardingConcerns,
        safeguardingDetails: formData.safeguardingDetails || undefined,
        meetingDate: formData.meetingDate ? new Date(formData.meetingDate) : undefined,
        attendees: formData.attendees || undefined,
        typeOfInteraction: formData.typeOfInteraction || undefined,
        meetingSummary: formData.meetingSummary || undefined,
        concernsRaised: formData.concernsRaised || undefined,
        immediateActionsTaken: formData.immediateActionsTaken || undefined,
        clientWishesFeelings: formData.clientWishesFeelings || undefined
      };

      Object.keys(caseData).forEach(key => {
        if (caseData[key] === undefined || caseData[key] === '') {
          delete caseData[key];
        }
      });

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/cases', caseData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      onCaseCreated(response.data);
      
      // Reset form and re-initialize with current user
      const currentUserFullName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '';
      setFormData({
        caseId: generateCaseId(),
        clientFullName: '',
        dateOfBirth: '',
        clientReferenceNumber: '',
        caseType: '',
        otherCaseType: '',
        caseStatus: 'Open',
        priorityLevel: 'Medium',
        assignedSocialWorkers: currentUserFullName ? [currentUserFullName] : [],
        clientAddress: '',
        phoneNumber: '',
        emailAddress: '',
        livingSituation: '',
        safeguardingConcerns: 'No',
        safeguardingDetails: '',
        meetingDate: '',
        attendees: '',
        typeOfInteraction: '',
        meetingSummary: '',
        concernsRaised: '',
        immediateActionsTaken: '',
        clientWishesFeelings: ''
      });
      setCurrentPage(1);

    } catch (err) {
      console.error('Case creation error:', err);
      console.error('Error response:', err.response?.data);
      
      if (err.response?.data?.errors) {
        setError(`Validation errors: ${err.response.data.errors.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Failed to create case');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="case-form-overlay">
      <div className="case-form-modal">
        <div className="case-form-header">
          <h2>Create New Case - Page {currentPage} of 3</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="case-form-progress">
          <div className={`progress-step ${currentPage >= 1 ? 'active' : ''}`}>1. Case Overview</div>
          <div className={`progress-step ${currentPage >= 2 ? 'active' : ''}`}>2. Contact & Safeguarding</div>
          <div className={`progress-step ${currentPage >= 3 ? 'active' : ''}`}>3. Meeting Notes</div>
        </div>

        <form onSubmit={handleSubmit} className="case-form">
          {error && <div className="error-message">{error}</div>}

          {currentPage === 1 && (
            <div className="form-page">
              <h3>Case Overview</h3>
              
              <div className="form-group">
                <label htmlFor="caseId">Case ID:</label>
                <input
                  type="text"
                  id="caseId"
                  name="caseId"
                  value={formData.caseId}
                  readOnly
                  className="readonly"
                />
              </div>

              <div className="form-group">
                <label htmlFor="clientFullName">Client Full Name: *</label>
                <input
                  type="text"
                  id="clientFullName"
                  name="clientFullName"
                  value={formData.clientFullName}
                  onChange={handleInputChange}
                  placeholder="Enter client's full name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="dateOfBirth">Date of Birth: *</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="clientReferenceNumber">Client Reference Number / NHS Number: *</label>
                  <input
                    type="text"
                    id="clientReferenceNumber"
                    name="clientReferenceNumber"
                    value={formData.clientReferenceNumber}
                    onChange={handleInputChange}
                    placeholder="Enter reference number"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Case Type: *</label>
                <div className="checkbox-group">
                  {['Child Protection', 'Mental Health', 'Elder Care', 'Disability Support', 'Domestic Abuse', 'Housing & Homelessness'].map(type => (
                    <label key={type} className="checkbox-label">
                      <input
                        type="radio"
                        name="caseType"
                        value={type}
                        checked={formData.caseType === type}
                        onChange={handleInputChange}
                        required
                      />
                      {type}
                    </label>
                  ))}
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="caseType"
                      value="Other"
                      checked={formData.caseType === 'Other'}
                      onChange={handleInputChange}
                      required
                    />
                    Other:
                    {formData.caseType === 'Other' && (
                      <input
                        type="text"
                        name="otherCaseType"
                        value={formData.otherCaseType}
                        onChange={handleInputChange}
                        placeholder="Specify"
                        className="inline-input"
                        required
                      />
                    )}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Case Status:</label>
                <div className="checkbox-group">
                  {['Open', 'Ongoing', 'Closed', 'On Hold'].map(status => (
                    <label key={status} className="checkbox-label">
                      <input
                        type="radio"
                        name="caseStatus"
                        value={status}
                        checked={formData.caseStatus === status}
                        onChange={handleInputChange}
                      />
                      {status}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Priority Level:</label>
                <div className="checkbox-group">
                  {['Low', 'Medium', 'High', 'Urgent'].map(priority => (
                    <label key={priority} className="checkbox-label">
                      <input
                        type="radio"
                        name="priorityLevel"
                        value={priority}
                        checked={formData.priorityLevel === priority}
                        onChange={handleInputChange}
                      />
                      {priority}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Assigned Social Worker(s): <span className="required">*</span></label>
                {loadingUsers ? (
                  <div className="loading-users">Loading users...</div>
                ) : (
                  <div className="checkbox-group">
                    {users.map(user => (
                      <label key={user._id} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="assignedSocialWorkers"
                          value={`${user.firstName} ${user.lastName}`}
                          checked={formData.assignedSocialWorkers.includes(`${user.firstName} ${user.lastName}`)}
                          onChange={handleInputChange}
                        />
                        {user.firstName} {user.lastName} ({user.role})
                      </label>
                    ))}
                    {users.length === 0 && (
                      <div className="no-users">No users found. Please register users first.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentPage === 2 && (
            <div className="form-page">
              <h3>Contact & Safeguarding Details</h3>
              
              <div className="form-group">
                <label htmlFor="clientAddress">Client Address:</label>
                <textarea
                  id="clientAddress"
                  name="clientAddress"
                  value={formData.clientAddress}
                  onChange={handleInputChange}
                  placeholder="Enter full address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number:</label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="emailAddress">Email Address:</label>
                  <input
                    type="email"
                    id="emailAddress"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Living Situation:</label>
                <div className="checkbox-group">
                  {['Alone', 'With Family', 'Foster Care', 'Residential Home', 'Homeless'].map(situation => (
                    <label key={situation} className="checkbox-label">
                      <input
                        type="radio"
                        name="livingSituation"
                        value={situation}
                        checked={formData.livingSituation === situation}
                        onChange={handleInputChange}
                      />
                      {situation}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Safeguarding Concerns:</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="safeguardingConcerns"
                      value="Yes"
                      checked={formData.safeguardingConcerns === 'Yes'}
                      onChange={handleInputChange}
                    />
                    Yes
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="radio"
                      name="safeguardingConcerns"
                      value="No"
                      checked={formData.safeguardingConcerns === 'No'}
                      onChange={handleInputChange}
                    />
                    No
                  </label>
                </div>
              </div>

              {formData.safeguardingConcerns === 'Yes' && (
                <div className="form-group">
                  <label htmlFor="safeguardingDetails">If Yes, please detail:</label>
                  <textarea
                    id="safeguardingDetails"
                    name="safeguardingDetails"
                    value={formData.safeguardingDetails}
                    onChange={handleInputChange}
                    placeholder="Please provide details of safeguarding concerns"
                    rows="4"
                  />
                </div>
              )}
            </div>
          )}

          {currentPage === 3 && (
            <div className="form-page">
              <h3>Meeting Notes / Visit Log</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="meetingDate">Meeting Date:</label>
                  <input
                    type="date"
                    id="meetingDate"
                    name="meetingDate"
                    value={formData.meetingDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Type of Interaction:</label>
                  <div className="checkbox-group">
                    {['Home Visit', 'Office Meeting', 'Phone Call', 'Virtual Meeting'].map(type => (
                      <label key={type} className="checkbox-label">
                        <input
                          type="radio"
                          name="typeOfInteraction"
                          value={type}
                          checked={formData.typeOfInteraction === type}
                          onChange={handleInputChange}
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="attendees">Attendees:</label>
                <input
                  type="text"
                  id="attendees"
                  name="attendees"
                  value={formData.attendees}
                  onChange={handleInputChange}
                  placeholder="Social worker, family, school staff, police, etc."
                />
              </div>

              <div className="form-group">
                <label htmlFor="meetingSummary">Meeting Summary / Observations:</label>
                <textarea
                  id="meetingSummary"
                  name="meetingSummary"
                  value={formData.meetingSummary}
                  onChange={handleInputChange}
                  placeholder="Enter meeting summary and observations"
                  rows="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="concernsRaised">Concerns Raised:</label>
                <textarea
                  id="concernsRaised"
                  name="concernsRaised"
                  value={formData.concernsRaised}
                  onChange={handleInputChange}
                  placeholder="Enter any concerns raised during the meeting"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="immediateActionsTaken">Immediate Actions Taken:</label>
                <textarea
                  id="immediateActionsTaken"
                  name="immediateActionsTaken"
                  value={formData.immediateActionsTaken}
                  onChange={handleInputChange}
                  placeholder="Enter immediate actions taken"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="clientWishesFeelings">Client Wishes & Feelings:</label>
                <textarea
                  id="clientWishesFeelings"
                  name="clientWishesFeelings"
                  value={formData.clientWishesFeelings}
                  onChange={handleInputChange}
                  placeholder="Enter client's wishes and feelings"
                  rows="3"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            {currentPage > 1 && (
              <button type="button" className="prev-button" onClick={prevPage}>
                Previous
              </button>
            )}
            
            {currentPage < 3 ? (
              <button type="button" className="next-button" onClick={nextPage}>
                Next
              </button>
            ) : (
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            )}
            
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseForm; 