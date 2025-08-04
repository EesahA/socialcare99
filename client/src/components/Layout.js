import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };

    checkUser();

    // Listen for storage changes (when user logs in/out)
    const handleStorageChange = (e) => {
      if (e.key === 'user') {
        checkUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events
    window.addEventListener('userLogin', checkUser);
    window.addEventListener('userLogout', checkUser);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLogin', checkUser);
      window.removeEventListener('userLogout', checkUser);
    };
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Dispatch custom event
    window.dispatchEvent(new Event('userLogout'));
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

  const toggleUploadMenu = () => {
    setShowUploadMenu(!showUploadMenu);
    setShowProfileMenu(false); // Close other menu
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setShowUploadMenu(false); // Close other menu
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.fab-container')) {
        setShowUploadMenu(false);
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Only show header for authenticated pages
  const showHeader = user && (location.pathname === '/home' || location.pathname === '/tasks');

  if (!showHeader) {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-left">
            <div className="logo-text">
              <Link to="/home">Social Care 365</Link>
            </div>
            <nav className="nav">
              <button 
                className={`nav-btn ${isActive('/home')}`}
                onClick={() => navigate('/home')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-btn ${isActive('/tasks')}`}
                onClick={() => navigate('/tasks')}
              >
                Tasks
              </button>
            </nav>
          </div>
          
          <div className="header-right">
            {/* Upload Floating Action Button */}
            <div className="fab-container">
              <button 
                className="fab fab-upload"
                onClick={toggleUploadMenu}
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
                onClick={toggleProfileMenu}
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
      </header>
      
      <main className="main">
        {children}
      </main>
    </div>
  );
};

export default Layout; 