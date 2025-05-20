import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import '../styles/Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const toggleFavorite = (e, productId) => {
    e.stopPropagation(); // Prevent card click when clicking favorite button
    setFavorites(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      }
      return [...prev, productId];
    });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation(); // Prevent card click when clicking add to cart button
    addToCart(product);
  };

  const handleCardClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="products-container">
      <h1>Discover Our Products</h1>
      <div className="products-grid">
        {products.map((product) => (
          <motion.div
            key={product._id}
            className="product-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleCardClick(product._id)}
          >
            <div className="product-image">
              <img src={product.image} alt={product.name} />
              <button
                className={`favorite-btn ${favorites.includes(product._id) ? 'active' : ''}`}
                onClick={(e) => toggleFavorite(e, product._id)}
                aria-label={favorites.includes(product._id) ? 'Remove from favorites' : 'Add to favorites'}
              >
                ♥
              </button>
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">${product.price.toFixed(2)}</p>
              <p className="description">{product.description}</p>
              <div className="product-actions">
                <button
                  className="add-to-cart-btn"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  Add to Cart
                </button>
                <Link 
                  to={`/product/${product._id}`} 
                  className="view-details-btn"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Products; 