import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { API_URL } from '../api/config';
import '../styles/CheckoutPage.css';

const CheckoutPage = () => {
  const { cartItems, clearCart, getTotal } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    email: '',
    phone: ''
  });
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });
  const navigate = useNavigate();
  
  // Calculate order total
  const calculateTotal = () => {
    const itemsPrice = cartItems.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping for orders over $100
    const tax = itemsPrice * 0.10; // Example tax (10%)
    return (itemsPrice + shippingPrice + tax).toFixed(2);
  };

  // Handle shipping address changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle card details changes
  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gestion de la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Empêcher les soumissions multiples
    if (paymentCompleted || isProcessing) {
      return;
    }
    
    setIsProcessing(true);
    setLoading(true);
    
    try {
      // 1. Validation des champs obligatoires
      const requiredFields = [
        { field: shippingAddress.firstName, message: 'Le prénom est requis' },
        { field: shippingAddress.lastName, message: 'Le nom est requis' },
        { field: shippingAddress.address, message: 'L\'adresse est requise' },
        { field: shippingAddress.city, message: 'La ville est requise' },
        { field: shippingAddress.postalCode, message: 'Le code postal est requis' },
        { field: shippingAddress.country, message: 'Le pays est requis' },
        { field: cardDetails.cardNumber, message: 'Le numéro de carte est requis' },
        { field: cardDetails.expiryDate, message: 'La date d\'expiration est requise' },
        { field: cardDetails.cvv, message: 'Le code de sécurité est requis' },
      ];

      for (const { field, message } of requiredFields) {
        if (!field) throw new Error(message);
      }

      // 2. Validation du format de la carte
      const cleanedCardNumber = cardDetails.cardNumber.replace(/\s/g, '');
      if (cleanedCardNumber.length !== 16 || !/^\d+$/.test(cleanedCardNumber)) {
        throw new Error('Numéro de carte invalide (16 chiffres requis)');
      }

      // 3. Validation de la date d'expiration
      const [month, year] = cardDetails.expiryDate.split('/');
      
      // Vérification du format
      if (!/^\d{2}$/.test(month) || !/^\d{2}$/.test(year)) {
        throw new Error('Format de date invalide (utilisez MM/AA)');
      }
      
      const expMonth = parseInt(month, 10);
      const expYear = 2000 + parseInt(year, 10); // Convertir en année complète (ex: 20 -> 2020)
      
      // Vérification du mois (1-12)
      if (expMonth < 1 || expMonth > 12) {
        throw new Error('Mois d\'expiration invalide (01-12)');
      }
      
      // Désactiver temporairement la vérification d'expiration pour les tests
      if (process.env.NODE_ENV !== 'development') {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
          throw new Error('La carte est expirée');
        }
      }

      // 4. Validation du CVV
      if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
        throw new Error('Code de sécurité invalide (3 ou 4 chiffres)');
      }

      // 5. Vérifier que le panier n'est pas vide
      if (cartItems.length === 0) {
        throw new Error('Votre panier est vide');
      }

      // 6. Calculer le total de la commande
      const orderTotal = parseFloat(calculateTotal());
      
      // 7. Créer l'objet de commande
      const order = {
        orderId: 'CMD-' + Date.now() + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        items: cartItems.map(item => ({
          product: {
            id: item.id || item._id,
            name: item.product?.name || 'Produit inconnu',
            price: item.product?.price || 0,
            image: item.product?.image || '/images/default-product.jpg'
          },
          quantity: item.quantity,
          subtotal: ((item.product?.price || 0) * item.quantity).toFixed(2)
        })),
        shippingAddress: { ...shippingAddress },
        paymentDetails: {
          cardLast4: cleanedCardNumber.slice(-4),
          cardType: cleanedCardNumber.match(/^4/) ? 'Visa' : 
                   (cleanedCardNumber.match(/^5[1-5]/) ? 'Mastercard' : 'Carte bancaire'),
          amount: orderTotal.toFixed(2),
          transactionId: 'TXN' + Date.now()
        },
        orderDate: new Date().toISOString(),
        status: 'payé',
        deliveryStatus: 'en préparation',
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        customerNote: ''
      };
      
      // 8. Simulation d'un délai de traitement
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 9. Sauvegarder la commande
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      existingOrders.push(order);
      localStorage.setItem('orders', JSON.stringify(existingOrders));
      
      // 10. Associer la commande à l'utilisateur
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user?._id) {
        const userOrders = JSON.parse(localStorage.getItem('userOrders') || '{}');
        userOrders[user._id] = [...(userOrders[user._id] || []), order.orderId];
        localStorage.setItem('userOrders', JSON.stringify(userOrders));
      }
      
      // 11. Vider le panier
      clearCart();
      setPaymentCompleted(true);
      
      // 12. Rediriger vers la page de confirmation
      navigate(`/order/success/${order.orderId}`);
      
    } catch (error) {
      console.error('Erreur lors de la commande:', error);
      toast.error(error.message || 'Erreur lors du traitement de votre commande');
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };
  
  // If cart is empty, redirect to cart page
  useEffect(() => {
    if (cartItems.length === 0 && !paymentCompleted) {
      navigate('/cart');
    }
  }, [cartItems, navigate, paymentCompleted]);

  // Format card number as user types (add space every 4 digits)
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  if (paymentCompleted) {
    return (
      <div className="checkout-container">
        <div className="payment-success">
          <h2>Payment Successful!</h2>
          <p>Your order has been placed successfully.</p>
          <p>Redirecting to your order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h1>Checkout</h1>
          
          {/* Shipping Address */}
          <div className="checkout-section">
            <h2>Shipping Address</h2>
            <div className="form-group">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={shippingAddress.firstName}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={shippingAddress.lastName}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={shippingAddress.address}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={shippingAddress.city}
                  onChange={handleShippingChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  name="postalCode"
                  placeholder="Postal Code"
                  value={shippingAddress.postalCode}
                  onChange={handleShippingChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={shippingAddress.email}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={shippingAddress.phone}
                onChange={handleShippingChange}
                required
              />
            </div>
            <div className="form-group">
              <select
                name="country"
                value={shippingAddress.country}
                onChange={handleShippingChange}
                required
                className="form-select"
              >
                <option value="">Select Country</option>
                <option value="France">France</option>
                <option value="Belgium">Belgium</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Canada">Canada</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          {/* Payment Method */}
          <div className="checkout-section">
            <h2>Payment Method</h2>
            <div className="payment-method">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(cardDetails.cardNumber)}
                  onChange={(e) => {
                    const formatted = formatCardNumber(e.target.value);
                    setCardDetails(prev => ({
                      ...prev,
                      cardNumber: formatted
                    }));
                  }}
                  maxLength="19"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={cardDetails.expiryDate}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Format as MM/YY
                      if (value.length === 2 && !value.includes('/')) {
                        value = value + '/';
                      }
                      if (value.length > 5) return;
                      setCardDetails(prev => ({
                        ...prev,
                        expiryDate: value
                      }));
                    }}
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={handleCardChange}
                    maxLength="4"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Name on Card</label>
                <input
                  type="text"
                  name="cardName"
                  placeholder="John Doe"
                  value={cardDetails.cardName}
                  onChange={handleCardChange}
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button 
                type="submit" 
                className="pay-now-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${calculateTotal()}`}
              </button>
            </div>
          </div>
          
          <div className="order-summary-container">
            <h2>Order Summary</h2>
            <div className="order-summary">
              <div className="order-items">
                {cartItems && cartItems.length > 0 ? cartItems.map((cartItem, index) => (
                  <div key={index} className="order-item">
                    <div className="item-details">
                      <span className="item-name">{cartItem.product.name}</span>
                      <span className="item-quantity">x {cartItem.quantity}</span>
                      <span className="item-price">${(cartItem.product.price * cartItem.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="empty-cart-message">Your cart is empty</div>
                )}
              </div>
              <div className="order-totals">
                <div className="subtotal">
                  <span>Subtotal:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="shipping">
                  <span>Shipping:</span>
                  <span>${getTotal() > 100 ? '0.00' : '10.00'}</span>
                </div>
                <div className="tax">
                  <span>Tax (10%):</span>
                  <span>${(getTotal() * 0.1).toFixed(2)}</span>
                </div>
                <div className="total">
                  <strong>Total:</strong>
                  <strong>${calculateTotal()}</strong>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
