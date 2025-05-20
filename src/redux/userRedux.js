// Action Types
const LOGIN_START = 'user/loginStart';
const LOGIN_SUCCESS = 'user/loginSuccess';
const LOGIN_FAILURE = 'user/loginFailure';
const LOGOUT = 'user/logout';
const UPDATE_USER = 'user/updateUser';

// Initial State
const initialState = {
  currentUser: null,
  isFetching: false,
  error: false
};

// Action Creators
export const loginStart = () => ({
  type: LOGIN_START
});

export const loginSuccess = (user) => ({
  type: LOGIN_SUCCESS,
  payload: user
});

export const loginFailure = () => ({
  type: LOGIN_FAILURE
});

export const logout = () => ({
  type: LOGOUT
});

export const updateUser = (userData) => ({
  type: UPDATE_USER,
  payload: userData
});

// Reducer
const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_START:
      return {
        ...state,
        isFetching: true,
        error: false
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isFetching: false,
        currentUser: action.payload,
        error: false
      };
    case LOGIN_FAILURE:
      return {
        ...state,
        isFetching: false,
        error: true
      };
    case LOGOUT:
      return {
        ...state,
        currentUser: null,
        isFetching: false,
        error: false
      };
    case UPDATE_USER:
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...action.payload
        }
      };
    default:
      return state;
  }
};

export default userReducer;
