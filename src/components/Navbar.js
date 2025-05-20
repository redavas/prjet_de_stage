import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { loginSuccess, logout } from '../redux/userRedux';
import { useCart } from '../context/CartContext';
import NavbarUser from './NavbarUser';
import NavbarGuest from './NavbarGuest';
import '../styles/Navbar.css';

const Navbar = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.currentUser);
  const location = useLocation();
  const { cartItems } = useCart();
  const cartQuantity = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token && userData?._id) {
      // Mettre à jour le store Redux avec les données utilisateur
      dispatch(loginSuccess(userData));
    } else {
      // Déconnecter l'utilisateur si le token est invalide
      dispatch(logout());
    }
  }, [dispatch]);

  // Si l'utilisateur est connecté, on utilise NavbarUser, sinon NavbarGuest
  return user?._id ? (
    <NavbarUser 
      user={user} 
      currentPath={location.pathname} 
    />
  ) : (
    <NavbarGuest 
      cartQuantity={cartQuantity} 
      currentPath={location.pathname} 
    />
  );
};

export default Navbar;