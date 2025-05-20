import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Container, Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { getCategories } from '../../services/categoryService';
import { getOrders } from '../../services/orderService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (activeTab === 'categories') {
          const data = await getCategories();
          setCategories(data);
        } else if (activeTab === 'orders') {
          const data = await getOrders();
          setOrders(data);
        }
      } catch (err) {
        console.error(`Error fetching ${activeTab}:`, err);
        setError(`Failed to load ${activeTab}. Please try again.`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    // TODO: Implement add category
    setShowAddCategory(false);
    setNewCategory({ name: '', description: '' });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, description: category.description || '' });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    // TODO: Implement update category
    setEditingCategory(null);
    setNewCategory({ name: '', description: '' });
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      // TODO: Implement delete category
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // TODO: Implement update order status
      // await updateOrderStatus(orderId, newStatus);
      // Refresh orders
      const updatedOrders = await getOrders();
      setOrders(updatedOrders);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status');
    }
  };

  return (
    <Container className="admin-dashboard mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="categories" title="Categories">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Manage Categories</h3>
            <Button variant="primary" onClick={() => setShowAddCategory(true)}>
              Add New Category
            </Button>
          </div>
          
          {loading ? (
            <p>Loading categories...</p>
          ) : (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description || 'N/A'}</td>
                    <td>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEditCategory(category)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteCategory(category._id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
        
        <Tab eventKey="orders" title="Orders">
          <h3 className="mb-3">Recent Orders</h3>
          
          {loading ? (
            <p>Loading orders...</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.substring(0, 8)}...</td>
                    <td>{order.user?.name || 'Guest'}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>${order.totalAmount?.toFixed(2)}</td>
                    <td>
                      <span className={`badge bg-${getStatusBadgeColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => updateOrderStatus(order._id, 'Shipped')}
                        disabled={order.status === 'Shipped'}
                      >
                        Mark as Shipped
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => updateOrderStatus(order._id, 'Delivered')}
                        disabled={order.status === 'Delivered'}
                      >
                        Mark as Delivered
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Tab>
      </Tabs>

      {/* Add/Edit Category Modal */}
      <Modal show={showAddCategory || editingCategory} onHide={() => {
        setShowAddCategory(false);
        setEditingCategory(null);
        setNewCategory({ name: '', description: '' });
      }}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category name"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter category description"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              />
            </Form.Group>
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => {
                setShowAddCategory(false);
                setEditingCategory(null);
                setNewCategory({ name: '', description: '' });
              }}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editingCategory ? 'Update' : 'Add'} Category
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

// Helper function to determine badge color based on status
const getStatusBadgeColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'shipped':
      return 'info';
    case 'delivered':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'secondary';
  }
};

export default AdminDashboard;
