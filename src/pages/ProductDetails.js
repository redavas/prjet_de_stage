import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    
    setIsAdding(true);
    try {
      // Add to cart using CartContext
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
        description: product.description,
        category: product.category
      });

      // Show success message
      toast.success(`${product.name} a été ajouté au panier !`, {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset quantity
      setQuantity(1);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      toast.error(error.message || 'Une erreur est survenue lors de l\'ajout au panier', {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="product-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-details-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-error">
        <h2>Product Not Found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/products')}>Back to Products</button>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="product-details-container"
      >
        <div className="product-details-content">
          <div className="product-image-section">
            <img src={product.image} alt={product.name} className="product-image" />
          </div>

          <div className="product-info-section">
            <h1 className="product-name">{product.name}</h1>
            <p className="product-price">${product.price.toFixed(2)}</p>
            
            <div className="product-description">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span className="meta-label">Category:</span>
                <span className="meta-value">{product.category?.name || 'Uncategorized'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Stock:</span>
                <span className="meta-value">{product.stock} units</span>
              </div>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>

              <button
                className={`add-to-cart-button ${isAdding ? 'adding' : ''}`}
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdding}
              >
                {isAdding ? 'Ajout en cours...' : 
                 product.stock === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
              </button>
            </div>

            <div className="product-features">
              <h2>Features</h2>
              <ul>
                <li>High-quality materials</li>
                <li>Durable construction</li>
                <li>Easy to use</li>
                <li>Warranty included</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetails; 