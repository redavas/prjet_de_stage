import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getCategoryWithProducts } from '../services/categoryService';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import '../styles/CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Récupérer les catégories prédéfinies
        const predefinedCategories = [
          { _id: 'default', name: 'Default' },
          { _id: 'clothing', name: 'Clothing' },
          { _id: 'electronics', name: 'Electronics' }
        ];
        setCategories(predefinedCategories);
        setError(null);
      } catch (err) {
        setError('Failed to load categories. Please try again later.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = async (categoryName) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
      return;
    }

    setExpandedCategory(categoryName);

    // Si nous n'avons pas encore chargé les produits pour cette catégorie, les récupérer
    if (!categoryProducts[categoryName]) {
      try {
        const products = await getCategoryWithProducts(categoryName);
        setCategoryProducts(prev => ({
          ...prev,
          [categoryName]: products
        }));
      } catch (err) {
        console.error('Error fetching category products:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading categories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="container">
        <h1>Our Categories</h1>
        <div className="categories-list">
          {categories.map((category) => (
            <motion.div 
              key={category._id}
              className={`category-card ${expandedCategory === category.name ? 'expanded' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="category-header"
                onClick={() => handleCategoryClick(category.name)}
              >
                <h2>{category.name}</h2>
                <motion.div
                  className="chevron"
                  animate={{
                    rotate: expandedCategory === category.name ? 90 : 0
                  }}
                >
                  <FiChevronRight size={24} />
                </motion.div>
              </div>
              
              {expandedCategory === category.name && (
                <motion.div 
                  className="category-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: expandedCategory === category.name ? 'auto' : 0,
                    opacity: expandedCategory === category.name ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {categoryProducts[category.name] ? (
                    categoryProducts[category.name].length > 0 ? (
                      <div className="products-grid">
                        {categoryProducts[category.name].map((product) => (
                          <Link 
                            to={`/products/${product._id}`} 
                            key={product._id}
                            className="product-card"
                          >
                            <div className="product-image">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                loading="lazy"
                              />
                            </div>
                            <div className="product-info">
                              <h3>{product.name}</h3>
                              <p className="product-price">${product.price.toFixed(2)}</p>
                              {product.stock === 0 && (
                                <span className="out-of-stock">Out of Stock</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="no-products">No products available in this category.</p>
                    )
                  ) : (
                    <div className="loading-products">
                      <div className="loading-spinner small"></div>
                      <p>Loading products...</p>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
