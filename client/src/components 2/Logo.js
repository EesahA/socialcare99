import React from 'react';
import './Logo.css';

const Logo = ({ size = 'medium' }) => {
  return (
    <div className={`logo-container ${size}`}>
      <img 
        src="/images/logo.png" 
        alt="Social Care 365 Logo" 
        className="logo-image"
      />
    </div>
  );
};

export default Logo; 