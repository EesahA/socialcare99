import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!loginForm.email || !loginForm.password) {
      setError('Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Here you would typically make an API call to authenticate
    // For now, we'll just simulate a successful login
    setIsLoggedIn(true);
    
    // Redirect to home page after successful login
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleInputChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  if (isLoggedIn) {
    return (
      <div className="login-page">
        <div className="login-container success">
          <div className="success-icon">✓</div>
          <h2>Login Successful!</h2>
          <p>Welcome to Social Care 365!</p>
          <p className="redirect-message">Redirecting to home page...</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Sign in to access your Social Care 365 account</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={loginForm.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={loginForm.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
        
        <div className="login-footer">
          <p>Don't have an account? <a href="#" className="link">Contact your administrator</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 