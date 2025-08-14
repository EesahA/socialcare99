import React, { useState, useEffect } from 'react';
import './MeetingScheduler.css';
import axios from 'axios';

const MeetingScheduler = ({ isOpen, onClose, onMeetingScheduled, caseData, editingMeeting }) => {
  const [meetingData, setMeetingData] = useState({
    date: '',
    time: '',
    duration: '60',
    title: '',
    description: '',
    attendees: '',
    location: '',
    meetingType: 'Home Visit'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (editingMeeting) {
      const meetingDate = new Date(editingMeeting.scheduledAt);
      setMeetingData({
        date: meetingDate.toISOString().split('T')[0],
        time: meetingDate.toTimeString().slice(0, 5),
        duration: editingMeeting.duration.toString(),
        title: editingMeeting.title,
        description: editingMeeting.description || '',
        attendees: editingMeeting.attendees || '',
        location: editingMeeting.location || '',
        meetingType: editingMeeting.meetingType
      });
    } else {
      // Reset form for new meeting
      setMeetingData({
        date: '',
        time: '',
        duration: '60',
        title: '',
        description: '',
        attendees: '',
        location: '',
        meetingType: 'Home Visit'
      });
    }
  }, [editingMeeting, isOpen]);

  const meetingTypes = [
    'Home Visit',
    'Office Meeting',
    'Phone Call',
    'Virtual Meeting',
    'School Meeting',
    'Medical Appointment',
    'Court Hearing',
    'Other'
  ];

  const durationOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
    { value: '90', label: '1.5 hours' },
    { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' },
    { value: '240', label: '4 hours' },
    { value: '480', label: 'Full Day' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMeetingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!meetingData.date || !meetingData.time || !meetingData.title) {
      setError('Please fill in all required fields: Date, Time, and Meeting Title');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const meetingInfo = {
        title: meetingData.title,
        description: meetingData.description,
        scheduledAt: new Date(`${meetingData.date}T${meetingData.time}`).toISOString(),
        duration: parseInt(meetingData.duration),
        meetingType: meetingData.meetingType,
        location: meetingData.location,
        attendees: meetingData.attendees,
        caseId: caseData.caseId,
        caseName: caseData.clientFullName
      };

      const token = localStorage.getItem('token');
      let response;

      if (editingMeeting) {
        // Update existing meeting
        response = await axios.put(`http://localhost:3000/api/meetings/${editingMeeting._id}`, meetingInfo, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new meeting
        response = await axios.post('http://localhost:3000/api/meetings', meetingInfo, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      // Call the callback with the saved meeting data
      if (onMeetingScheduled) {
        onMeetingScheduled(response.data);
      }

      // Reset form
      setMeetingData({
        date: '',
        time: '',
        duration: '60',
        title: '',
        description: '',
        attendees: '',
        location: '',
        meetingType: 'Home Visit'
      });

      onClose();
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError(err.response?.data?.message || 'Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="meeting-scheduler-overlay">
      <div className="meeting-scheduler-modal">
        <div className="meeting-scheduler-header">
          <h2>{editingMeeting ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="meeting-scheduler-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="title">Meeting Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={meetingData.title}
              onChange={handleInputChange}
              placeholder="Enter meeting title"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={meetingData.date}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={meetingData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="duration">Duration</label>
              <select
                id="duration"
                name="duration"
                value={meetingData.duration}
                onChange={handleInputChange}
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="meetingType">Meeting Type</label>
              <select
                id="meetingType"
                name="meetingType"
                value={meetingData.meetingType}
                onChange={handleInputChange}
              >
                {meetingTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={meetingData.location}
              onChange={handleInputChange}
              placeholder="Enter meeting location"
            />
          </div>

          <div className="form-group">
            <label htmlFor="attendees">Attendees</label>
            <input
              type="text"
              id="attendees"
              name="attendees"
              value={meetingData.attendees}
              onChange={handleInputChange}
              placeholder="Social worker, family, school staff, etc."
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={meetingData.description}
              onChange={handleInputChange}
              placeholder="Meeting agenda, topics to discuss, etc."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (editingMeeting ? 'Updating...' : 'Scheduling...') : (editingMeeting ? 'Update Meeting' : 'Schedule Meeting')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeetingScheduler; 