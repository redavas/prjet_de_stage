import { 
  addToCart as addToCartApi,
  updateCartItem,
  removeFromCart,
  clearCart as clearCartApi,
  getCart
} from '../api/cartApi';
import { 
  addProduct, 
  removeProduct, 
  updateQuantity, 
  clearCart, 
  syncCart,
  cartRequest,
  cartSuccess,
  cartFail
} from './cartRedux';

const cartMiddleware = store => next => async action => {
  const { dispatch, getState } = store;
  const { auth } = getState();
  const token = auth?.userInfo?.token;

  // Si l'utilisateur n'est pas connecté, on laisse passer l'action
  if (!token) {
    return next(action);
  }

  // Actions à intercepter pour la synchronisation
  switch (action.type) {
    case 'cart/addProduct':
      try {
        dispatch(cartRequest());
        const { _id, quantity = 1 } = action.payload;
        const response = await addToCartApi(_id, quantity, token);
        dispatch(syncCart(response));
        dispatch(cartSuccess());
      } catch (error) {
        dispatch(cartFail(error.message));
        // On laisse passer l'action originale pour une mise à jour locale
        return next(action);
      }
      break;

    case 'cart/updateQuantity':
      try {
        dispatch(cartRequest());
        const { id, quantity } = action.payload;
        const response = await updateCartItem(id, quantity, token);
        dispatch(syncCart(response));
        dispatch(cartSuccess());
      } catch (error) {
        dispatch(cartFail(error.message));
        // On laisse passer l'action originale pour une mise à jour locale
        return next(action);
      }
      break;

    case 'cart/removeProduct':
      try {
        dispatch(cartRequest());
        const response = await removeFromCart(action.payload, token);
        dispatch(syncCart(response));
        dispatch(cartSuccess());
      } catch (error) {
        dispatch(cartFail(error.message));
        // On laisse passer l'action originale pour une mise à jour locale
        return next(action);
      }
      break;

    case 'cart/clearCart':
      try {
        dispatch(cartRequest());
        await clearCartApi(token);
        dispatch(cartSuccess());
      } catch (error) {
        dispatch(cartFail(error.message));
        // On laisse passer l'action originale pour une mise à jour locale
        return next(action);
      }
      break;

    default:
      return next(action);
  }
};

export const loadCart = () => async (dispatch, getState) => {
  const { auth } = getState();
  const token = auth?.userInfo?.token;

  if (!token) return;

  try {
    dispatch(cartRequest());
    const cart = await getCart(token);
    dispatch(syncCart(cart));
    dispatch(cartSuccess());
  } catch (error) {
    dispatch(cartFail(error.message));
  }
};

export default cartMiddleware;
