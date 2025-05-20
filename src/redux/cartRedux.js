// Action Types
const ADD_PRODUCT = 'cart/addProduct';
const REMOVE_PRODUCT = 'cart/removeProduct';
const UPDATE_QUANTITY = 'cart/updateQuantity';
const CLEAR_CART = 'cart/clearCart';
const RESET_CART = 'cart/resetCart';
const CART_REQUEST = 'cart/request';
const CART_SUCCESS = 'cart/success';
const CART_FAIL = 'cart/fail';
const SYNC_CART = 'cart/sync';

// Initial State
const initialState = {
  products: [],
  quantity: 0,
  total: 0,
  loading: false,
  error: null,
  lastSync: null
};

// Action Creators
export const addProduct = (product) => ({
  type: ADD_PRODUCT,
  payload: product
});

export const syncCart = (cart) => ({
  type: SYNC_CART,
  payload: cart
});

export const cartRequest = () => ({
  type: CART_REQUEST
});

export const cartSuccess = () => ({
  type: CART_SUCCESS,
  payload: { lastSync: new Date().toISOString() }
});

export const cartFail = (error) => ({
  type: CART_FAIL,
  payload: error
});

export const removeProduct = (productId) => ({
  type: REMOVE_PRODUCT,
  payload: productId
});

export const updateQuantity = (id, quantity) => ({
  type: UPDATE_QUANTITY,
  payload: { id, quantity }
});

export const clearCart = () => ({
  type: CLEAR_CART
});

export const resetCart = () => ({
  type: RESET_CART
});

// Reducer
const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case CART_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case CART_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        lastSync: action.payload.lastSync
      };

    case CART_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case SYNC_CART:
      return {
        ...state,
        products: action.payload.items || [],
        total: action.payload.total || 0,
        quantity: action.payload.items?.reduce((total, item) => total + item.quantity, 0) || 0
      };
    case ADD_PRODUCT:
      // Check if product already exists in cart
      const existingItemIndex = state.products.findIndex(
        item => item.product?._id === action.payload._id || item._id === action.payload._id
      );

      if (existingItemIndex >= 0) {
        // Update quantity if product exists
        const updatedProducts = [...state.products];
        const newQuantity = (updatedProducts[existingItemIndex].quantity || 0) + (action.payload.quantity || 1);
        updatedProducts[existingItemIndex] = {
          ...updatedProducts[existingItemIndex],
          quantity: newQuantity
        };
        
        return {
          ...state,
          products: updatedProducts,
          quantity: state.quantity + (action.payload.quantity || 1),
          total: state.total + (action.payload.price * (action.payload.quantity || 1))
        };
      }

      // Add new product
      const newProduct = {
        ...action.payload,
        quantity: action.payload.quantity || 1,
        product: action.payload // Garder une référence complète du produit
      };
      
      return {
        ...state,
        products: [...state.products, newProduct],
        quantity: state.quantity + 1,
        total: state.total + (action.payload.price * (action.payload.quantity || 1))
      };

    case REMOVE_PRODUCT: {
      const item = state.products.find(item => item._id === action.payload || item.product?._id === action.payload);
      if (!item) return state;
      
      const itemPrice = item.price || (item.product?.price || 0);
      const itemQuantity = item.quantity || 0;
      
      return {
        ...state,
        products: state.products.filter(item => 
          item._id !== action.payload && item.product?._id !== action.payload
        ),
        quantity: state.quantity - itemQuantity,
        total: state.total - (itemPrice * itemQuantity)
      };
    }

    case UPDATE_QUANTITY: {
      const { id, quantity } = action.payload;
      const itemIndex = state.products.findIndex(item => 
        item._id === id || item.product?._id === id
      );
      
      if (itemIndex === -1) return state;
      
      const updatedProducts = [...state.products];
      const oldQuantity = updatedProducts[itemIndex].quantity;
      const itemPrice = updatedProducts[itemIndex].price || 
                      (updatedProducts[itemIndex].product?.price || 0);
      
      updatedProducts[itemIndex] = {
        ...updatedProducts[itemIndex],
        quantity: quantity
      };
      
      return {
        ...state,
        products: updatedProducts,
        quantity: state.quantity - oldQuantity + quantity,
        total: state.total - (itemPrice * oldQuantity) + (itemPrice * quantity)
      };
    }

    case CLEAR_CART:
    case RESET_CART:
      return {
        ...state,
        products: [],
        quantity: 0,
        total: 0
      };

    default:
      return state;
  }
};

export default cartReducer;
