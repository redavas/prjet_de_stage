import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaSearch, 
  FaSignInAlt, 
  FaUserPlus, 
  FaHome,
  FaShoppingBag,
  FaTags,
  FaInfoCircle,
  FaPhoneAlt,
  FaShoppingCart
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import '../styles/Navbar.css';

const NavbarGuest = ({ cartQuantity, currentPath }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchFormRef = useRef(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchFormRef.current && !searchFormRef.current.contains(event.target) && searchOpen) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    if (searchOpen) setSearchOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  // Navigation links
  const navLinks = [
    { to: "/", text: "Home", icon: <FaHome /> },
    { to: "/products", text: "Products", icon: <FaShoppingBag /> },
    { to: "/categories", text: "Categories", icon: <FaTags /> },
    { to: "/about", text: "About", icon: <FaInfoCircle /> },
    { to: "/contact", text: "Contact", icon: <FaPhoneAlt /> },
  ];
  
  // Redirect to signin with current path for redirect after login
  const getSignInPath = () => {
    return {
      pathname: "/signin",
      state: { from: location.pathname }
    };
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-logo">
            <Link to="/" onClick={closeAllMenus}>
              <span>E-Shop</span>
            </Link>
          </div>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link 
                key={link.to} 
                to={link.to} 
                className="nav-link" 
                onClick={closeAllMenus}
              >
                {link.icon && <span className="nav-icon">{link.icon}</span>}
                {link.text}
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
            <button 
              className={`search-toggle ${searchOpen ? 'active' : ''}`} 
              onClick={toggleSearch}
              aria-label="Search"
            >
              <FaSearch />
            </button>
            
            <Link 
              to={getSignInPath()} 
              className="cart-icon" 
              onClick={closeAllMenus}
              aria-label="Shopping Cart"
              title="Sign in to access cart"
            >
              <FaShoppingCart />
              {cartQuantity > 0 && <span className="cart-badge">{cartQuantity}</span>}
            </Link>

            <div className="auth-buttons">
              <Link 
                to={getSignInPath()} 
                className="btn btn-outline" 
                onClick={closeAllMenus}
                state={{ from: currentPath }}
              >
                <FaSignInAlt /> Sign In
              </Link>
              <Link 
                to="/signup" 
                className="btn btn-primary" 
                onClick={closeAllMenus}
                state={{ from: currentPath }}
              >
                <FaUserPlus /> Sign Up
              </Link>
            </div>
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
        onClick={closeAllMenus}
      ></div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay">
          <form 
            ref={searchFormRef}
            onSubmit={handleSearch} 
            className="search-form"
          >
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="search-submit">
              <FaSearch />
            </button>
            <button 
              type="button" 
              className="search-close"
              onClick={toggleSearch}
            >
              &times;
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default NavbarGuest;
