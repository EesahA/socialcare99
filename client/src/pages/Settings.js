import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    role: ''
  });

  // Password change form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/users/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUser(response.data);
      setProfileData({
        name: `${response.data.firstName} ${response.data.lastName}`.trim(),
        email: response.data.email || '',
        role: response.data.role || ''
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/users/profile', profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess('Profile updated successfully!');
      setUser(response.data);
      
      // Update localStorage with new user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // Dispatch event to update other components
      window.dispatchEvent(new Event('userLogin'));
    } catch (error) {
      console.error('Failed to update profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setSaving(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:3000/api/users/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Failed to change password:', error);
      setError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-container">
        <div className="settings-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-content">
        {/* Profile Section */}
        <div className="settings-section">
          <h2>Profile Information</h2>
          <form onSubmit={handleProfileSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleProfileChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <input
                type="text"
                id="role"
                name="role"
                value={profileData.role}
                onChange={handleProfileChange}
                placeholder="Your role"
                readOnly
                className="readonly-field"
              />
            </div>

            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Password Change Section */}
        <div className="settings-section">
          <h2>Change Password</h2>
          <form onSubmit={handlePasswordSubmit} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm your new password"
                required
              />
            </div>

            <button type="submit" className="save-button" disabled={saving}>
              {saving ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings; 