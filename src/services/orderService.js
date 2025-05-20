const API_BASE_URL = 'http://localhost:5000/api';
const ORDERS_URL = `${API_BASE_URL}/orders`;

const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    console.error('Expected JSON response, got:', text);
    throw new Error('Invalid response format from server');
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('API Error:', {
      status: response.status,
      statusText: response.statusText,
      data
    });
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }
  
  return data;
};

export const getOrders = async () => {
  try {
    console.log('Fetching orders from:', ORDERS_URL);
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(ORDERS_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error in getOrders:', error);
    throw new Error(`Failed to fetch orders: ${error.message}`);
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${ORDERS_URL}/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw new Error(`Failed to update order status: ${error.message}`);
  }
};
