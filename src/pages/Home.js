import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct } from '../redux/cartRedux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Home.css';
import '../styles/Loading.css';
import Navbar from '../components/Navbar';

const Home = () => {
  const dispatch = useDispatch();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleAddToCart = (product) => {
    // Vérifier si l'utilisateur est connecté
    if (!currentUser) {
      // Rediriger vers la page de connexion avec un message
      navigate('/login', { state: { from: 'cart' } });
      return;
    }

    if (!product || !product._id) {
      console.error('Produit invalide:', product);
      toast.error('Erreur lors de l\'ajout au panier');
      return;
    }

    const productToAdd = {
      _id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    };

    dispatch(addProduct(productToAdd));
    toast.success(`${product.name} ajouté au panier`);
  };

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products/featured');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setFeaturedProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

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

  return (
    <div className="home-page">
      <Navbar />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Sustainable Living Made Easy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Discover eco-friendly products that make a difference
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hero-buttons"
          >
            <Link to="/products" className="primary-button">
              Shop Now
            </Link>
            <Link to="/about" className="secondary-button">
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <p>Our most popular sustainable products</p>
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
                key={product._id}
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
                  <button 
  className="add-to-cart-button"
  onClick={() => handleAddToCart(product)}
>
  Add to Cart
</button>
                </div>
              </motion.div>
            ))
          )}
        </div>
        <div className="section-footer">
          <Link to="/products" className="view-all-button">
            View All Products
          </Link>
        </div>
      </section>

      {/* Categories Preview Section */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Find what you need in our curated collections</p>
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

      {/* Call to Action Section */}
      <section className="cta-section">
        <div className="cta-content">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Join Our Sustainable Community
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Sign up for our newsletter and get 10% off your first order
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="cta-form"
          >
            <input type="email" placeholder="Enter your email" />
            <button className="subscribe-button">Subscribe</button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home; 