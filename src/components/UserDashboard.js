import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserDetails } from '../redux/actions/userActions';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FavoriteIcon from '@mui/icons-material/Favorite';

const UserDashboard = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.userDetails);
  const { orders } = useSelector((state) => state.userOrders);

  useEffect(() => {
    dispatch(getUserDetails(id));
  }, [dispatch, id]);

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container>
        <Typography>User not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* User Profile Section */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <PersonIcon sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h5">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <List>
              <ListItem>
                <ListItemIcon>
                  <ShoppingBagIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Total Orders"
                  secondary={orders?.length || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LocalShippingIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Active Orders"
                  secondary={orders?.filter(order => order.orderStatus !== 'delivered').length || 0}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <FavoriteIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Wishlist Items"
                  secondary={user.wishlist?.length || 0}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Recent Orders Section */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Orders
            </Typography>
            <List>
              {orders?.slice(0, 5).map((order) => (
                <React.Fragment key={order._id}>
                  <ListItem>
                    <ListItemText
                      primary={`Order #${order._id}`}
                      secondary={`Placed on ${new Date(order.createdAt).toLocaleDateString()}`}
                    />
                    <Typography
                      variant="body2"
                      color={order.orderStatus === 'delivered' ? 'success.main' : 'text.secondary'}
                    >
                      {order.orderStatus.toUpperCase()}
                    </Typography>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
            {orders?.length > 5 && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button variant="outlined" color="primary">
                  View All Orders
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Actions Section */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  startIcon={<ShoppingBagIcon />}
                >
                  View Orders
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  startIcon={<FavoriteIcon />}
                >
                  Wishlist
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="info"
                  fullWidth
                  startIcon={<PersonIcon />}
                >
                  Edit Profile
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={<LocalShippingIcon />}
                >
                  Track Orders
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserDashboard; 