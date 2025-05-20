import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Categories.css';

const Categories = () => {
  const categories = [
    {
      id: 'clothing',
      name: 'Clothing',
      description: 'Sustainable and eco-friendly clothing options',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'personal-care',
      name: 'Personal Care',
      description: 'Natural and organic personal care products',
      image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'home',
      name: 'Home & Living',
      description: 'Eco-friendly home and living products',
      image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      description: 'Sustainable accessories and fashion items',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    },
  ];

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Shop by Category</h1>
        <p>Explore our sustainable product categories</p>
      </div>

      <div className="categories-grid">
        {categories.map((category, index) => (
          <motion.div
            key={category.id}
            className="category-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <Link to={`/products?category=${category.id}`} className="category-link">
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>
              <div className="category-info">
                <h2>{category.name}</h2>
                <p>{category.description}</p>
                <span className="shop-now">Shop Now →</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Categories; 