import React from 'react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatPrice';

const OrderSummary = () => {
  const { cartItems, getCartTotal, getCartCount } = useCart();
  
  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      <div className="summary-item">
        <span>Items ({getCartCount()}):</span>
        <span>{formatPrice(getCartTotal())}</span>
      </div>
      <div className="summary-item total">
        <strong>Order Total:</strong>
        <strong>{formatPrice(getCartTotal())}</strong>
      </div>
    </div>
  );
};

export default OrderSummary;
