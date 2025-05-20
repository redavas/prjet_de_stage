import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      <ul className="sidebar-menu">
        <li className={activeTab === 'dashboard' ? 'active' : ''}>
          <NavLink 
            to="/admin" 
            className="sidebar-link"
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className={activeTab === 'products' ? 'active' : ''}>
          <NavLink 
            to="/admin/products" 
            className="sidebar-link"
            onClick={() => setActiveTab('products')}
          >
            <i className="fas fa-box"></i>
            <span>Products</span>
          </NavLink>
        </li>
        <li className={activeTab === 'categories' ? 'active' : ''}>
          <NavLink 
            to="/admin/categories" 
            className="sidebar-link"
            onClick={() => setActiveTab('categories')}
          >
            <i className="fas fa-tags"></i>
            <span>Categories</span>
          </NavLink>
        </li>
        <li className={activeTab === 'orders' ? 'active' : ''}>
          <NavLink 
            to="/admin/orders" 
            className="sidebar-link"
            onClick={() => setActiveTab('orders')}
          >
            <i className="fas fa-shopping-cart"></i>
            <span>Orders</span>
          </NavLink>
        </li>
        <li className={activeTab === 'users' ? 'active' : ''}>
          <NavLink 
            to="/admin/users" 
            className="sidebar-link"
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users"></i>
            <span>Users</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
