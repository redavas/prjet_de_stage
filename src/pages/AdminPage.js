import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import '../styles/AdminPage.css';

const AdminPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    image: '',
    description: ''
  });
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !user.isAdmin) {
      navigate('/signin');
      return;
    }

    if (!token) {
      setError('No authentication token found. Please sign in again.');
      navigate('/signin');
      return;
    }

    fetchData(token);
  }, [navigate]);

  const fetchData = async (token) => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, usersRes, ordersRes] = await Promise.all([
        fetch('http://localhost:5000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!productsRes.ok || !categoriesRes.ok || !usersRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [productsData, categoriesData, usersData, ordersData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        usersRes.json(),
        ordersRes.json()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
      setUsers(usersData);
      setOrders(ordersData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const validateProductForm = () => {
    if (!productForm.name.trim()) {
      setFormError('Product name is required');
      return false;
    }
    if (!productForm.price || productForm.price <= 0) {
      setFormError('Price must be greater than 0');
      return false;
    }
    if (!productForm.category) {
      setFormError('Please select a category');
      return false;
    }
    if (!productForm.stock || productForm.stock < 0) {
      setFormError('Stock must be 0 or greater');
      return false;
    }
    if (productForm.image && !isValidUrl(productForm.image)) {
      setFormError('Please enter a valid image URL');
      return false;
    }
    return true;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
    setFormError(''); // Clear error when user types
  };

  const openProductForm = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        price: product.price,
        category: product.category?._id || product.category,
        stock: product.stock,
        image: product.image || '',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        price: '',
        category: '',
        stock: '',
        image: '',
        description: ''
      });
    }
    setShowProductForm(true);
  };

  const closeProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: '',
      category: '',
      stock: '',
      image: '',
      description: ''
    });
  };

  const submitProductForm = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!validateProductForm()) {
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const method = editingProduct ? 'PUT' : 'POST';
      const url = editingProduct 
        ? `http://localhost:5000/api/products/${editingProduct._id}`
        : 'http://localhost:5000/api/products';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...productForm,
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock)
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save product');
      }

      setFormSuccess(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => {
        closeProductForm();
        fetchData(token);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete product');

      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  };

  // Category CRUD
  const handleCategoryFormChange = (e) => {
    setCategoryForm({ ...categoryForm, [e.target.name]: e.target.value });
  };

  const openCategoryForm = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        name: '',
        description: ''
      });
    }
    setShowCategoryForm(true);
  };

  const closeCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: ''
    });
  };

  const submitCategoryForm = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    if (!categoryForm.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('token');
    
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `http://localhost:5000/api/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/categories';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to save category');
      }

      setFormSuccess(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      setTimeout(() => {
        closeCategoryForm();
        fetchData(token);
      }, 1500);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete category');

      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleAdmin = async (user) => {
    if (!window.confirm(`Are you sure you want to ${user.isAdmin ? 'remove' : 'grant'} admin privileges for this user?`)) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user._id}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to update user');

      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete user');

      fetchData(token);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-loading-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-empty">
        <div className="admin-empty-content">
          <h2 className="admin-empty-title">Error</h2>
          <p className="admin-empty-text">{error}</p>
          <button className="admin-button" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminNavbar />
      <div className="admin-content">
        <nav className="admin-nav">
          <button
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button
            className={`admin-tab ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            🏷️ Categories
          </button>
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 Users
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            🛒 Orders
          </button>
        </nav>

        <main className="admin-content">
          {activeTab === 'products' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <h2>Products</h2>
                <button className="admin-button" onClick={() => openProductForm()}>
                  <span role="img" aria-label="Add">➕</span>
                  Add Product
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>
                        <img 
                          src={product.image || 'https://via.placeholder.com/60x40?text=No+Image'} 
                          alt={product.name}
                          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '0.25rem' }}
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>${product.price}</td>
                      <td>{product.category?.name || 'N/A'}</td>
                      <td>{product.stock}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="admin-button secondary"
                            onClick={() => openProductForm(product)}
                          >
                            Edit
                          </button>
                          <button 
                            className="admin-button danger"
                            onClick={() => deleteProduct(product._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'categories' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                <h2>Categories</h2>
                <button className="admin-button" onClick={() => openCategoryForm()}>
                  <span role="img" aria-label="Add">➕</span>
                  Add Category
                </button>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category._id}>
                      <td>{category.name}</td>
                      <td>{category.description}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="admin-button secondary"
                            onClick={() => openCategoryForm(category)}
                          >
                            Edit
                          </button>
                          <button 
                            className="admin-button danger"
                            onClick={() => deleteCategory(category._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'users' && (
            <section>
              <div style={{ padding: '1rem' }}>
                <h2>Users</h2>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          background: user.isAdmin ? '#2563eb' : '#475569',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem'
                        }}>
                          {user.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="admin-button secondary"
                            onClick={() => toggleAdmin(user)}
                          >
                            {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          <button 
                            className="admin-button danger"
                            onClick={() => deleteUser(user._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'orders' && (
            <section>
              <div style={{ padding: '1rem' }}>
                <h2>Orders</h2>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.user?.name || 'N/A'}</td>
                      <td>${order.total}</td>
                      <td>
                        <span style={{
                          background: order.status === 'completed' ? '#16a34a' : '#475569',
                          color: '#fff',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem'
                        }}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </main>

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
              {formError && (
                <div className="admin-error">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="admin-success">
                  {formSuccess}
                </div>
              )}
              <form onSubmit={submitProductForm} className="admin-form">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    value={productForm.name}
                    onChange={handleProductFormChange}
                    required
                    className="admin-form-input"
                    placeholder="Enter product name"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="price">Price</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleProductFormChange}
                    required
                    className="admin-form-input"
                    placeholder="Enter price"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={productForm.category}
                    onChange={handleProductFormChange}
                    required
                    className="admin-form-input"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="stock">Stock</label>
                  <input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={productForm.stock}
                    onChange={handleProductFormChange}
                    required
                    className="admin-form-input"
                    placeholder="Enter stock quantity"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="image">Image URL</label>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    value={productForm.image}
                    onChange={handleProductFormChange}
                    className="admin-form-input"
                    placeholder="Enter image URL (optional)"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={productForm.description}
                    onChange={handleProductFormChange}
                    className="admin-form-input admin-form-textarea"
                    placeholder="Enter product description (optional)"
                  />
                </div>
                <div className="admin-form-buttons">
                  <button 
                    type="submit" 
                    className="admin-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="admin-loading-spinner" style={{ width: '20px', height: '20px' }} />
                        {editingProduct ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingProduct ? 'Update' : 'Create'
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="admin-button secondary" 
                    onClick={closeProductForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
              <form onSubmit={submitCategoryForm} className="admin-form">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="category-name">Name</label>
                  <input
                    id="category-name"
                    name="name"
                    value={categoryForm.name}
                    onChange={handleCategoryFormChange}
                    required
                    className="admin-form-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="category-description">Description</label>
                  <textarea
                    id="category-description"
                    name="description"
                    value={categoryForm.description}
                    onChange={handleCategoryFormChange}
                    className="admin-form-input admin-form-textarea"
                  />
                </div>
                <div className="admin-form-buttons">
                  <button type="submit" className="admin-button">
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                  <button type="button" className="admin-button secondary" onClick={closeCategoryForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage; 