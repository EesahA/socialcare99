import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import './Landing.css';

const Landing = () => (
  <div className="landing">
    <div className="landing-logo">
      <Logo size="large" />
    </div>
    <h1>Welcome to Social Care 365</h1>
    <p>Your All in One Social Care management application.</p>
    
    <div className="landing-actions">
      <Link to="/login" className="landing-btn primary">
        Login
      </Link>
      <Link to="/register" className="landing-btn secondary">
        Register
      </Link>
    </div>
    
    <div className="features">
      <h2>Key Features</h2>
      <div className="features-grid">
        <div className="feature-card">
          <h3>Task Management</h3>
          <p>Organise and track all your care tasks efficiently</p>
        </div>
        <div className="feature-card">
          <h3>Case Management</h3>
          <p>Maintain comprehensive client information and care plans</p>
        </div>
        <div className="feature-card">
          <h3>Meeting Scheduling</h3>
          <p>Schedule and manage meetings with clients and team members</p>
        </div>
        <div className="feature-card">
          <h3>Calendar Integration</h3>
          <p>View all tasks and meetings in one integrated calendar</p>
        </div>
      </div>
    </div>
  </div>
);

export default Landing; 