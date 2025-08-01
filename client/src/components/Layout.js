import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <h1 className="logo">
            <Link to="/">Social Care 365</Link>
          </h1>
          <nav className="nav">
            <Link to="/" className={`nav-link ${isActive('/')}`}>
              Home
            </Link>
            {!user ? (
              <>
                <Link to="/login" className={`nav-link ${isActive('/login')}`}>
                  Login
                </Link>
                <Link to="/register" className={`nav-link ${isActive('/register')}`}>
                  Register
                </Link>
              </>
            ) : (
              <button onClick={handleLogout} className="logout-btn-nav">
                Logout
              </button>
            )}
          </nav>
        </div>
      </header>
      
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Social Care 365. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 