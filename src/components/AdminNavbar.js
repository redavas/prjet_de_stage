import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminPage.css';

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <nav className="admin-navbar" role="navigation" aria-label="Admin navigation">
      <div className="admin-navbar-content">
        <h1 className="admin-navbar-title">Admin Dashboard</h1>
        <button 
          className="admin-logout-button"
          onClick={handleLogout}
          aria-label="Logout from admin dashboard"
        >
          <span className="logout-icon" role="img" aria-hidden="true">🚪</span>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default AdminNavbar; 