import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import './AuthHome.css';

const AuthHome = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleUploadAction = (action) => {
    setShowUploadMenu(false);
    if (action === 'create-task') {
      console.log('Create new task clicked');
      // Add your create task logic here
    } else if (action === 'upload-form') {
      console.log('Upload meeting form clicked');
      // Add your upload form logic here
    }
  };

  const handleProfileAction = (action) => {
    setShowProfileMenu(false);
    if (action === 'settings') {
      console.log('Settings clicked');
      // Add your settings logic here
    } else if (action === 'logout') {
      handleLogout();
    }
  };

  return (
    <div className="auth-home">
      <div className="auth-home-header">
        <div className="header-left">
          <div className="auth-home-logo">
            <Logo size="small" />
          </div>
          <nav className="header-nav">
            <button className="nav-btn">Cases</button>
            <button className="nav-btn">Tasks</button>
          </nav>
        </div>
        
        <div className="header-right">
          {/* Upload Floating Action Button */}
          <div className="fab-container">
            <button 
              className="fab fab-upload"
              onMouseEnter={() => setShowUploadMenu(true)}
              onMouseLeave={() => setShowUploadMenu(false)}
            >
              <span className="fab-icon">📤</span>
              <span className="fab-label">Upload Form</span>
            </button>
            
            {showUploadMenu && (
              <div className="fab-menu">
                <button 
                  className="fab-menu-item"
                  onClick={() => handleUploadAction('create-task')}
                >
                  <span className="menu-icon">➕</span>
                  Create New Task
                </button>
                <button 
                  className="fab-menu-item"
                  onClick={() => handleUploadAction('upload-form')}
                >
                  <span className="menu-icon">📋</span>
                  Upload Meeting Form
                </button>
              </div>
            )}
          </div>

          {/* Profile Floating Action Button */}
          <div className="fab-container">
            <button 
              className="fab fab-profile"
              onMouseEnter={() => setShowProfileMenu(true)}
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              <span className="fab-icon">👤</span>
              <span className="fab-label">Profile</span>
            </button>
            
            {showProfileMenu && (
              <div className="fab-menu">
                <button 
                  className="fab-menu-item"
                  onClick={() => handleProfileAction('settings')}
                >
                  <span className="menu-icon">⚙️</span>
                  Settings
                </button>
                <button 
                  className="fab-menu-item"
                  onClick={() => handleProfileAction('logout')}
                >
                  <span className="menu-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="auth-home-content">
        <h1>Welcome, {user?.firstName || 'User'}!</h1>
        <p>This is your dashboard. More features coming soon.</p>
      </div>
    </div>
  );
};

export default AuthHome; 