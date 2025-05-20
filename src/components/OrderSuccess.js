import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import '../styles/OrderSuccess.css';

const OrderSuccess = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer les détails de la commande depuis le localStorage
    const fetchOrder = () => {
      try {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const foundOrder = orders.find(o => o.orderId === orderId);
        
        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          toast.error('Commande non trouvée', { position: 'top-center' });
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        toast.error('Une erreur est survenue', { position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="order-success">
        <div className="loading">Chargement des détails de la commande...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-success">
        <div className="error">Commande non trouvée</div>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // Formater la date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="order-success">
      <div className="success-container">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        
        <h2>Commande validée avec succès !</h2>
        <p className="order-number">N° de commande : <strong>{order.orderId}</strong></p>
        <p className="order-date">Passée le {formatDate(order.orderDate)}</p>
        
        <div className="order-summary">
          <h3>Récapitulatif de votre commande</h3>
          
          <div className="order-items">
            {order.items.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  <img src={item.product.image} alt={item.product.name} />
                </div>
                <div className="item-details">
                  <h4>{item.product.name}</h4>
                  <p>Quantité: {item.quantity}</p>
                  <p className="item-price">Prix unitaire: {item.product.price} €</p>
                </div>
                <div className="item-subtotal">
                  {(item.product.price * item.quantity).toFixed(2)} €
                </div>
              </div>
            ))}
          </div>
          
          <div className="order-totals">
            <div className="total-row">
              <span>Sous-total :</span>
              <span>{order.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toFixed(2)} €</span>
            </div>
            <div className="total-row">
              <span>Frais de livraison :</span>
              <span>Gratuit</span>
            </div>
            <div className="total-row total">
              <span>Total :</span>
              <span>{order.paymentDetails.amount} €</span>
            </div>
          </div>
        </div>
        
        <div className="shipping-address">
          <h3>Adresse de livraison</h3>
          <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
          <p>{order.shippingAddress.address}</p>
          <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
          <p>{order.shippingAddress.country}</p>
        </div>
        
        <div className="payment-info">
          <h3>Paiement</h3>
          <p>Méthode : Carte bancaire (**** **** **** {order.paymentDetails.cardLast4})</p>
          <p>Montant : {order.paymentDetails.amount} €</p>
          <p className="status">Statut : <span className="status-completed">Payé</span></p>
        </div>
        
        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/user/${JSON.parse(localStorage.getItem('user'))._id}/orders`)}
          >
            Voir mes commandes
          </button>
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/products')}
          >
            Continuer mes achats
          </button>
        </div>
        
        <div className="customer-service">
          <h3>Besoin d'aide ?</h3>
          <p>Pour toute question concernant votre commande, n'hésitez pas à contacter notre service client.</p>
          <p>Email : contact@votreboutique.com</p>
          <p>Téléphone : 01 23 45 67 89</p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
