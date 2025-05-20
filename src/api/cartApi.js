import { API_URL } from './config';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.message || 'Une erreur est survenue');
    error.response = response;
    error.data = data;
    throw error;
  }
  return data;
};

// Récupérer le panier de l'utilisateur
export const getCart = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    throw error.response?.data?.message || 'Erreur lors de la récupération du panier';
  }
};

// Ajouter un produit au panier
export const addToCart = async (product, token) => {
  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
    throw error.response?.data?.message || 'Erreur lors de l\'ajout au panier';
  }
};

// Mettre à jour la quantité d'un produit dans le panier
export const updateCartItem = async (productId, quantity, token) => {
  try {
    const response = await fetch(`${API_URL}/api/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier:', error);
    throw error.response?.data?.message || 'Erreur lors de la mise à jour du panier';
  }
};

// Supprimer un produit du panier
export const removeFromCart = async (productId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit du panier:', error);
    throw error.response?.data?.message || 'Erreur lors de la suppression du produit du panier';
  }
};

// Vider le panier
export const clearCart = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/cart`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error('Erreur lors de la suppression du panier:', error);
    throw error.response?.data?.message || 'Erreur lors de la suppression du panier';
  }
};
