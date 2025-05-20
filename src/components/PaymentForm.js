import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { API_URL } from '../api/config';
import './PaymentForm.css';

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const PaymentForm = ({ cart, shippingAddress, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  // Calculate total amount
  const amount = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Handle payment method change
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    setError(null);
  };

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            items: cart.map(item => ({
              product: item._id,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress,
            paymentMethod: 'credit_card'
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create order');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        toast.error(err.message);
      }
    };

    if (cart.length > 0) {
      createPaymentIntent();
    }
  }, [cart, shippingAddress]);

  const handleChange = async (event) => {
    setDisabled(event.empty);
    setError(event.error ? event.error.message : '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    if (!stripe || !elements) {
      return;
    }
    
    // If pay later option is selected
    if (paymentMethod === 'pay_later') {
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            items: cart.map(item => ({
              product: item._id,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress,
            paymentMethod: 'pay_later'
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to create order');
        }

        setSucceeded(true);
        onSuccess({
          id: `order_${Date.now()}`,
          status: 'succeeded',
          metadata: {
            orderId: data.order._id
          }
        });
      } catch (err) {
        setError(err.message);
        setProcessing(false);
      }
      return;
    }
    
    // For credit card payment
    if (paymentMethod === 'credit_card') {
      try {
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        });

        if (error) {
          setError(error.message);
          setProcessing(false);
          return;
        }

        if (paymentIntent.status === 'succeeded') {
          onSuccess(paymentIntent);
        }
      } catch (err) {
        setError(err.message);
        setProcessing(false);
      }
    }
  };

  return (
    <div className="payment-form-container">
      <form className="payment-form" onSubmit={handleSubmit}>
        <h3>Payment Method</h3>
        
        <div className="payment-method-selector">
          <label className={`payment-method-option ${paymentMethod === 'credit_card' ? 'active' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="credit_card"
              checked={paymentMethod === 'credit_card'}
              onChange={() => handlePaymentMethodChange('credit_card')}
            />
            Credit Card
          </label>
          
          <label className={`payment-method-option ${paymentMethod === 'pay_later' ? 'active' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="pay_later"
              checked={paymentMethod === 'pay_later'}
              onChange={() => handlePaymentMethodChange('pay_later')}
            />
            Pay Later (7 days)
          </label>
        </div>

        {paymentMethod === 'credit_card' && (
          <div className="card-details">
            <h4>Card Details</h4>
            <CardElement
              className="card-element"
              options={CARD_OPTIONS}
              onChange={(e) => {
                setError(e.error ? e.error.message : '');
                setDisabled(e.empty || e.error || e.complete === false);
              }}
            />
          </div>
        )}
        
        {paymentMethod === 'pay_later' && (
          <div className="pay-later-notice">
            <p>Your order will be processed immediately, but you'll have 7 days to complete the payment.</p>
            <p>A payment link will be sent to your email.</p>
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <button
          className="pay-button"
          disabled={!stripe || processing || (paymentMethod === 'credit_card' && (disabled || succeeded))}
        >
          {processing 
            ? 'Processing...' 
            : paymentMethod === 'pay_later' 
              ? `Order Now (Pay Later)` 
              : `Pay $${amount.toFixed(2)}`
          }
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;
