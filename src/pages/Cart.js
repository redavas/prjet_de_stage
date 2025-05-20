import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { 
  updateQuantity as updateQuantityAction, 
  removeProduct as removeProductAction,
  clearCart as clearCartAction
} from '../redux/cartRedux';
import { loadCart } from '../redux/cartMiddleware';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cart = useSelector((state) => state.cart) || {};
  const items = cart.products || [];
  const loading = cart.loading || false;
  const error = cart.error || null;
  const total = cart.total || 0;
  const cartQuantity = cart.quantity || 0;
  
  const { userInfo } = useSelector((state) => state.user);
  
  // Charger le panier au montage du composant
  useEffect(() => {
    if (userInfo) {
      dispatch(loadCart());
    }
  }, [dispatch, userInfo]);

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1 || newQuantity > (item.product?.countInStock || item.countInStock)) {
      return;
    }
    dispatch(updateQuantityAction({ 
      id: item._id || item.product?._id, 
      quantity: newQuantity 
    }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeProductAction(id));
  };

  const checkoutHandler = () => {
    if (!userInfo) {
      navigate('/signin', { state: { from: '/cart' } });
      return;
    }
    
    if (items.length === 0) {
      return;
    }
    
    navigate('/checkout');
  };
  
  const clearCartHandler = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
      dispatch(clearCartAction());
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Panier</Typography>
        {items.length > 0 && (
          <Button 
            variant="outlined" 
            color="error"
            onClick={clearCartHandler}
            disabled={loading}
          >
            Vider le panier
          </Button>
        )}
      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!loading && items.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Your cart is empty
          </Typography>
          <Button
            component={Link}
            to="/products"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Continuer vos achats
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Price</TableCell>
                    <TableCell align="center">Quantity</TableCell>
                    <TableCell align="right">Total</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.product}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <img
                            src={item.image || item.product?.image}
                            alt={item.name || item.product?.name}
                            style={{ width: 50, height: 50, objectFit: 'cover', marginRight: 10 }}
                          />
                          <Typography>{item.name || item.product?.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">${(item.price || item.product?.price).toFixed(2)}</TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IconButton
                            onClick={() => handleQuantityChange(item, (item.quantity || 1) - 1)}
                            disabled={(item.quantity || 1) <= 1 || loading}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            size="small"
                            value={item.quantity || 1}
                            onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                            inputProps={{ 
                              min: 1, 
                              max: item.product?.countInStock || item.countInStock,
                              style: { textAlign: 'center' } 
                            }}
                            sx={{ width: 60, mx: 1 }}
                            disabled={loading}
                          />
                          <IconButton
                            onClick={() => handleQuantityChange(item, (item.quantity || 1) + 1)}
                            disabled={loading || (item.quantity || 1) >= (item.product?.countInStock || item.countInStock)}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ${((item.price || (item.product?.price || 0)) * (item.quantity || 1)).toFixed(2)}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          color="error"
                          onClick={() => removeFromCartHandler(item._id || item.product?._id)}
                          disabled={loading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              <Box sx={{ my: 2 }}>
                <Typography variant="body1">
                  Subtotal: ${items.reduce((acc, item) => acc + (item.price || item.product?.price) * (item.quantity || 1), 0).toFixed(2)}
                </Typography>
                <Typography variant="body1">
                  Shipping: $0.00
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Total: ${(total || 0).toFixed(2)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {cartQuantity} article{cartQuantity !== 1 ? 's' : ''} dans le panier
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  component={Link} 
                  to="/checkout"
                  disabled={items.length === 0}
                  sx={{ flex: 1 }}
                >
                  Passer la commande
                </Button>
                <Button 
                  variant="contained" 
                  color="success" 
                  component={Link} 
                  to="/checkout"
                  disabled={items.length === 0}
                  sx={{ flex: 1 }}
                >
                  Payer maintenant
                </Button>
              </Box>
              <Button
                component={Link}
                to="/products"
                variant="outlined"
                fullWidth
              >
                Continuer vos achats
              </Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default Cart; 