import { loginSuccess, logout } from './userRedux';

export const authMiddleware = store => next => action => {
  if (action.type === 'user/loginSuccess') {
    // Sauvegarder les informations utilisateur dans le localStorage
    localStorage.setItem('user', JSON.stringify(action.payload));
    
    // Si le token est inclus dans la réponse, le sauvegarder aussi
    if (action.payload.token) {
      localStorage.setItem('token', action.payload.token);
    }
  } 
  else if (action.type === 'user/logout') {
    // Nettoyer le localStorage lors de la déconnexion
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  
  return next(action);
};
