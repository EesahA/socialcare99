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
      <Link to="/login" className="landing-btn">Login</Link>
      <Link to="/register" className="landing-btn secondary">Register</Link>
    </div>
    <div className="features">
      <h2>Key Features</h2>
      <ul>
        <li>Task Management</li>
        <li>Client Records</li>
        <li>Staff Scheduling</li>
        <li>Reporting</li>
      </ul>
    </div>
  </div>
);

export default Landing; 