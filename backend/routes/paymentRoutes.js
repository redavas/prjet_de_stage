const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Créer un paiement
router.post('/create-payment-intent', protect, paymentController.createPaymentIntent);

// Webhook pour les événements Stripe
router.post('/webhook', express.raw({type: 'application/json'}), paymentController.handleWebhook);

module.exports = router;
