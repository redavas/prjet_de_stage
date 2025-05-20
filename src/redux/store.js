import { createStore, combineReducers, compose, applyMiddleware } from 'redux';

// Import your reducers
import userReducer from './userRedux';
import cartReducer from './cartRedux';
import { authMiddleware } from './authMiddleware';
import cartMiddleware, { loadCart } from './cartMiddleware';

// Combine reducers
const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
});

// Enable Redux DevTools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Create store with middleware
const store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(authMiddleware, cartMiddleware)
  )
);

// Charger l'utilisateur depuis le localStorage au démarrage
const loadUserFromStorage = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (user?._id && token) {
      store.dispatch({
        type: 'user/loginSuccess',
        payload: user
      });
    }
  } catch (error) {
    console.error('Failed to load user from localStorage', error);
  }
};

loadUserFromStorage();

// Charger le panier après le chargement de l'utilisateur
store.subscribe(() => {
  const { user } = store.getState();
  if (user?.userInfo?.token) {
    store.dispatch(loadCart());
  }
});

export default store;