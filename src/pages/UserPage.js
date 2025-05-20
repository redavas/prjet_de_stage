import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/UserPage.css';
import '../styles/Loading.css';


const UserPage = () => {
  const [user, setUser] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const categories = [
    {
      id: 'clothing',
      name: 'Clothing',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'personal-care',
      name: 'Personal Care',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'home',
      name: 'Home & Living',
      image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/signin');
          return;
        }

        // Fetch user data
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        
        if (storedUser._id === id) {
          setUser(storedUser);
        } else {
          const userResponse = await fetch(`http://localhost:5000/api/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (!userResponse.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await userResponse.json();
          setUser(userData);
        }

        // Fetch featured products
        const productsResponse = await fetch('http://localhost:5000/api/products/featured');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch featured products');
        }
        const productsData = await productsResponse.json();
        setFeaturedProducts(productsData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="error-message">User not found</div>;
  }

  return (
    <div className="user-page">
      
      
      {/* Welcome Section */}
      <section className="welcome-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="welcome-content"
        >
          <h1>Welcome back, {user.name}!</h1>
          <p>Here's what's new for you today</p>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Recommended For You</h2>
          <p>Handpicked products based on your preferences</p>
        </div>
        <div className="featured-grid">
          {loading ? (
            <div className="loading">Loading products...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : featuredProducts.length === 0 ? (
            <div>No featured products available</div>
          ) : (
            featuredProducts.map((product, index) => (
              <motion.div
                key={product._id || index}
                className="featured-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="featured-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="featured-info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price.toFixed(2)}</p>
                  <button className="add-to-cart-button">Add to Cart</button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Browse our curated collections</p>
        </div>
        <div className="categories-grid">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              className="category-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/products?category=${category.id}`} className="category-link">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <span className="shop-now">Shop Now →</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* User Profile Section */}
      <section className="profile-section">
        <div className="section-header">
          <h2>Your Profile</h2>
          <p>Manage your account details</p>
        </div>
        <div className="profile-card">
          <div className="profile-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{user.name}</span>
            </div>
            <div className="info-item">
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className="info-item">
              <label>Account Type:</label>
              <span>{user.isAdmin ? 'Admin' : 'Standard User'}</span>
            </div>
          </div>
          <div className="profile-actions">
            <Link to={`/user/${id}/orders`} className="action-button">
              View Orders
            </Link>
            <Link to={`/user/${id}/settings`} className="action-button secondary">
              Account Settings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserPage;