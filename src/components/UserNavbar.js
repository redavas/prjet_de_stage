import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <nav style={{ padding: '1rem', background: '#eee', marginBottom: '2rem' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
    </nav>
  );
};

export default UserNavbar; 