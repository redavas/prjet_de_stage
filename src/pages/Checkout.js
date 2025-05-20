import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { createOrder } from '../redux/orderActions';
import { clearCart as clearCartAction } from '../redux/cartRedux';

const steps = ['Détails de livraison', 'Paiement', 'Récapitulatif'];

const Checkout = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cart, user } = useSelector((state) => ({
    cart: state.cart,
    user: state.user
  }));
  
  const { items, total, loading: cartLoading } = cart;
  const { userInfo } = user;
  
  useEffect(() => {
    if (!userInfo) {
      navigate('/signin?redirect=checkout');
    } else if (items.length === 0) {
      navigate('/cart');
    }
  }, [userInfo, items.length, navigate]);
  
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    // Valider les champs d'adresse ici si nécessaire
    handleNext();
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const handlePlaceOrder = async () => {
    if (!termsAccepted) {
      setError('Veuvez accepter les conditions générales pour continuer');
      return;
    }
    
    try {
      const orderData = {
        orderItems: items.map(item => ({
          product: item.product?._id || item._id,
          name: item.name || item.product?.name,
          quantity: item.quantity,
          price: item.price || item.product?.price,
        })),
        shippingAddress: {
          ...shippingAddress,
          fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
        },
        paymentMethod,
        itemsPrice: total,
        shippingPrice: 0, // À calculer en fonction de l'adresse
        taxPrice: 0, // À calculer
        totalPrice: total,
      };
      
      const result = await dispatch(createOrder(orderData));
      
      if (result.success) {
        // Vider le panier après une commande réussie
        dispatch(clearCartAction());
        // Rediriger vers la page de succès
        navigate(`/order/success/${result.order._id}`);
      } else {
        setError(result.message || 'Une erreur est survenue lors de la commande');
      }
    } catch (error) {
      setError(error.message || 'Une erreur est survenue lors de la commande');
    }
  };
  
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={handleShippingSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Prénom"
                  value={shippingAddress.firstName}
                  onChange={(e) => setShippingAddress({...shippingAddress, firstName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Nom"
                  value={shippingAddress.lastName}
                  onChange={(e) => setShippingAddress({...shippingAddress, lastName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Adresse"
                  value={shippingAddress.address}
                  onChange={(e) => setShippingAddress({...shippingAddress, address: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Ville"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Code postal"
                  value={shippingAddress.postalCode}
                  onChange={(e) => setShippingAddress({...shippingAddress, postalCode: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Pays"
                  value={shippingAddress.country}
                  onChange={(e) => setShippingAddress({...shippingAddress, country: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Continuer vers le paiement
                </Button>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Méthode de paiement
            </Typography>
            <Box sx={{ my: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => handlePaymentMethodChange('credit_card')}
                    color="primary"
                  />
                }
                label="Carte de crédit"
              />
            </Box>
            <Box sx={{ my: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={paymentMethod === 'paypal'}
                    onChange={() => handlePaymentMethodChange('paypal')}
                    color="primary"
                  />
                }
                label="PayPal"
              />
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              fullWidth
              sx={{ mt: 2 }}
            >
              Continuer vers le récapitulatif
            </Button>
          </Box>
        );
      
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Récapitulatif de la commande
            </Typography>
            
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Adresse de livraison
              </Typography>
              <Typography>
                {shippingAddress.firstName} {shippingAddress.lastName}
              </Typography>
              <Typography>{shippingAddress.address}</Typography>
              <Typography>
                {shippingAddress.postalCode} {shippingAddress.city}
              </Typography>
              <Typography>{shippingAddress.country}</Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Méthode de paiement
              </Typography>
              <Typography>
                {paymentMethod === 'credit_card' ? 'Carte de crédit' : 'PayPal'}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ my: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Articles
              </Typography>
              <List>
                {items.map((item) => (
                  <ListItem key={item._id || item.product?._id}>
                    <ListItemText
                      primary={`${item.quantity} x ${item.name || item.product?.name}`}
                      secondary={`Prix unitaire: $${(item.price || item.product?.price).toFixed(2)}`}
                    />
                    <Typography>
                      ${((item.price || item.product?.price) * item.quantity).toFixed(2)}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ textAlign: 'right', my: 2 }}>
              <Typography variant="h6">
                Total: ${total.toFixed(2)}
              </Typography>
            </Box>
            
            <FormControlLabel
              control={
                <Checkbox
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  color="primary"
                />
              }
              label="J'accepte les conditions générales de vente"
            />
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              fullWidth
              disabled={!termsAccepted || cartLoading}
              sx={{ mt: 2 }}
            >
              {cartLoading ? <CircularProgress size={24} /> : 'Confirmer la commande'}
            </Button>
          </Box>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Commander
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" gutterBottom>
              Commande en cours de traitement...
            </Typography>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {renderStepContent(activeStep)}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 3 }}>
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
              >
                Retour
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={activeStep === steps.length - 1 && !termsAccepted}
              >
                {activeStep === steps.length - 1 ? 'Confirmer la commande' : 'Suivant'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default Checkout;
