import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about">
      <h1>About</h1>
      <p>This is a React application built with:</p>
      <ul>
        <li>React 18</li>
        <li>React Router for navigation</li>
        <li>Axios for API calls</li>
        <li>Express backend</li>
      </ul>
      <p>Features include:</p>
      <ul>
        <li>Responsive layout</li>
        <li>Server status monitoring</li>
        <li>API integration</li>
        <li>Clean component structure</li>
      </ul>
    </div>
  );
};

export default About; 