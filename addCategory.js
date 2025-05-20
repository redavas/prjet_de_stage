const axios = require('axios');

async function addCategory() {
  try {
    const response = await axios.post('http://localhost:5000/api/categories', {
      name: 'Accessories',
      description: 'Stylish accessories to complement your look',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    });
    
    console.log('Category added successfully:', response.data);
  } catch (error) {
    console.error('Error adding category:', error.response?.data || error.message);
  }
}

addCategory();
