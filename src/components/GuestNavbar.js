import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSearch, 
  FaShoppingCart, 
  FaHome, 
  FaShoppingBag, 
  FaTags, 
  FaInfoCircle, 
  FaPhoneAlt 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/Navbar.css';

const GuestNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Navigation links
  const navLinks = [
    { to: "/", text: "Home", icon: <FaHome /> },
    { to: "/products", text: "Products", icon: <FaShoppingBag /> },
    { to: "/categories", text: "Categories", icon: <FaTags /> },
    { to: "/about", text: "About", icon: <FaInfoCircle /> },
    { to: "/contact", text: "Contact", icon: <FaPhoneAlt /> },
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <motion.div 
            className="navbar-logo"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link to="/" onClick={closeMobileMenu}>
              <span>E-Shop</span>
            </Link>
          </motion.div>

          <div className={`navbar-links ${mobileMenuOpen ? 'active' : ''}`}>
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="nav-link" 
                onClick={closeMobileMenu}
              >
                {link.icon && <span className="nav-icon">{link.icon}</span>}
                {link.text}
              </Link>
            ))}

            <div className="auth-buttons">
              <Link 
                to="/login" 
                className="btn btn-outline" 
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="btn btn-primary" 
                onClick={closeMobileMenu}
              >
                Sign Up
              </Link>
            </div>
          </div>

          <div className="navbar-actions">
            <Link 
              to="/cart" 
              className="cart-icon" 
              onClick={closeMobileMenu}
              aria-label="Shopping Cart"
            >
              <FaShoppingCart />
              <span className="cart-badge">0</span>
            </Link>
          </div>

          <button 
            className="mobile-menu-btn" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <div className={`hamburger ${mobileMenuOpen ? 'open' : ''}`}></div>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'visible' : ''}`} 
        onClick={closeMobileMenu}
      ></div>
    </>
  );
};

export default GuestNavbar;
