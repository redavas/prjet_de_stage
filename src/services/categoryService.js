const API_BASE_URL = 'http://localhost:5000/api';
const CATEGORIES_URL = `${API_BASE_URL}/categories`;
const PRODUCTS_URL = `${API_BASE_URL}/products`;

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

// Cache pour stocker les données déjà chargées
let allProductsCache = null;

// Récupérer tous les produits
const fetchAllProducts = async () => {
  if (allProductsCache) {
    return allProductsCache;
  }
  
  try {
    console.log('Fetching all products from:', PRODUCTS_URL);
    const response = await fetch(PRODUCTS_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    allProductsCache = await handleResponse(response);
    return allProductsCache;
  } catch (error) {
    console.error('Error fetching all products:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
  }
};

export const getCategories = async () => {
  try {
    console.log('Fetching categories from:', CATEGORIES_URL);
    const response = await fetch(CATEGORIES_URL, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error in getCategories:', error);
    throw new Error(`Failed to fetch categories: ${error.message}`);
  }
};

export const getCategoryWithProducts = async (categoryName) => {
  if (!categoryName) {
    throw new Error('Category name is required');
  }
  
  try {
    // Récupérer tous les produits
    const allProducts = await fetchAllProducts();
    
    // Si la catégorie est 'default', retourner les produits sans catégorie
    if (categoryName.toLowerCase() === 'default') {
      return allProducts.filter(product => {
        const hasNoCategory = !product.category || 
                           (typeof product.category === 'string' && !product.category.trim()) ||
                           (typeof product.category === 'object' && !product.category?.name);
        return hasNoCategory;
      });
    }
    
    // Pour les autres catégories, filtrer normalement
    const productsInCategory = allProducts.filter(
      product => {
        // Vérifier si la catégorie est un objet avec un nom ou directement une chaîne
        const productCategory = typeof product.category === 'object' 
          ? product.category.name?.toLowerCase() 
          : product.category?.toLowerCase();
        
        return productCategory === categoryName.toLowerCase();
      }
    );
    
    return productsInCategory;
  } catch (error) {
    console.error('Error in getCategoryWithProducts:', {
      categoryName,
      error: error.message,
      stack: error.stack
    });
    throw new Error(`Failed to get products for category ${categoryName}: ${error.message}`);
  }
};
