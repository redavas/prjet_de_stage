import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaShoppingCart, 
  FaSearch, 
  FaBars, 
  FaTimes,
  FaBell,
  FaEnvelope,
  FaUserCog,
  FaSignOutAlt,
  FaUserCircle,
  FaHome,
  FaShoppingBag,
  FaTags,
  FaInfoCircle,
  FaPhoneAlt,
  FaBox
} from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/userRedux';
import { resetCart } from '../redux/cartRedux';
import { useCart } from '../context/CartContext';
import '../styles/Navbar.css';

const NavbarUser = ({ user, currentPath }) => {
  const { cartItems, getTotal } = useCart();
  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const userMenuRef = useRef(null);
  const cartMenuRef = useRef(null);
  const searchFormRef = useRef(null);
  const userId = user?._id;

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (cartMenuRef.current && !cartMenuRef.current.contains(event.target)) {
        setCartOpen(false);
      }
      if (searchFormRef.current && !searchFormRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetCart());
    localStorage.removeItem('persist:root');
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
    window.location.reload(); // Force refresh to clear all states
  };

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

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuOpen(!userMenuOpen);
    setCartOpen(false);
  };

  const toggleCart = (e) => {
    e.preventDefault();
    setCartOpen(!cartOpen);
    setUserMenuOpen(false);
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const closeAllMenus = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
  };

  // Navigation links
  const navLinks = [
    { to: `/user/${userId}`, text: "Home", icon: <FaHome /> },
    { to: "/products", text: "Products", icon: <FaShoppingBag /> },
    { to: "/categories", text: "Categories", icon: <FaTags /> },
    { to: "/about", text: "About", icon: <FaInfoCircle /> },
    { to: "/contact", text: "Contact", icon: <FaPhoneAlt /> },
  ];

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
            
            <div className="cart-container" ref={cartMenuRef}>
              <Link 
                to="#" 
                className="cart-icon" 
                onClick={toggleCart}
                aria-label="Shopping Cart"
              >
                <FaShoppingCart />
                {cartQuantity > 0 && <span className="cart-badge">{cartQuantity}</span>}
              </Link>
              
              {cartOpen && (
                <div className="cart-dropdown">
                  <div className="cart-dropdown-header">
                    <h3>Votre Panier</h3>
                    <Link to="/cart" onClick={closeAllMenus}>
                      Voir le panier
                    </Link>
                  </div>
                  
                  {cartItems.length === 0 ? (
                    <div className="cart-empty">Votre panier est vide</div>
                  ) : (
                    <>
                      <div className="cart-items">
                        {cartItems.map((item) => (
                          <div key={item.id} className="cart-item">
                            <img 
                              src={item.product.image} 
                              alt={item.product.name} 
                              className="cart-item-image"
                            />
                            <div className="cart-item-details">
                              <span className="cart-item-name">
                                {item.product.name}
                              </span>
                              <span className="cart-item-price">
                                {item.quantity} x ${item.product.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="cart-dropdown-footer">
                        <div className="cart-total">
                          <span>Total:</span>
                          <span>${getTotal().toFixed(2)}</span>
                        </div>
                        <Link 
                          to="/checkout" 
                          className="checkout-button"
                          onClick={closeAllMenus}
                        >
                          Commander
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="user-menu-container" ref={userMenuRef}>
              <div 
                className="user-avatar" 
                onClick={toggleUserMenu}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                {user?.img ? (
                  <img src={user.img} alt={user.username} />
                ) : (
                  <FaUserCircle />
                )}
              </div>
              
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <h4>{user?.username}</h4>
                    <p>{user?.email}</p>
                  </div>
                  
                  <Link 
                    to={`/user/${userId}/profile`} 
                    className="dropdown-item" 
                    onClick={closeAllMenus}
                  >
                    <FaUserCircle /> My Profile
                  </Link>
                  
                  <Link 
                    to={`/user/${userId}/orders`} 
                    className="dropdown-item" 
                    onClick={closeAllMenus}
                  >
                    <FaBox /> My Orders
                  </Link>
                  
                  {user?.isAdmin && (
                    <Link 
                      to="/admin/dashboard" 
                      className="dropdown-item" 
                      onClick={closeAllMenus}
                    >
                      <FaUserCog /> Admin Dashboard
                    </Link>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  
                  <button 
                    className="dropdown-item logout-button" 
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
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

export default NavbarUser;
