console.log('Chargement de la configuration Stripe...');

// Configuration temporaire pour débogage
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_51PJzX9Rr6pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9pV9';
console.log('Utilisation de la clé Stripe:', stripeKey ? 'Définie' : 'Non définie');

const stripe = require('stripe')(stripeKey);

exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'eur' } = req.body;
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir en centimes
      currency,
      metadata: { integration_check: 'accept_a_payment' },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Erreur de paiement:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.handleWebhook = (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Gérer les événements Stripe
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Paiement réussi:', paymentIntent.id);
      // TODO: Mettre à jour la base de données ici
      break;
    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  res.json({ received: true });
};
