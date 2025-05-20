import React, { useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useLocation, 
  Navigate,
  useNavigate, 
  useParams 
} from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { CartProvider } from './context/CartContext';
import store from './redux/store';
import { loginSuccess } from './redux/userRedux';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Categories from './pages/Categories';
import About from './pages/About';
import Contact from './pages/Contact';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AdminPage from './pages/AdminPage';
import UserPage from './pages/UserPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './components/UserDashboard';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './components/OrderSuccess';
import './styles/App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) {
    return <Navigate to="/signin" replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    return <Navigate to={`/user/${user._id}`} replace />;
  }

  return children;
};

// User Route Component
const UserRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { id } = useParams();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If user is admin, allow access to any user page
  if (user.isAdmin) {
    return children;
  }

  // For regular users, only allow access to their own page
  if (user._id !== id) {
    return <Navigate to={`/user/${user._id}${location.pathname.split('/user/')[1]?.slice(id.length) || ''}`} replace />;
  }

  return children;
};

// Create a wrapper component to access location
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user?.currentUser);
  const isLoggedIn = !!user?._id;
  const isAdminPage = location.pathname.startsWith('/admin');

  // Vérification de l'authentification et redirection si nécessaire
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isLoggedIn = !!token && user?._id;
    const isAdminPage = location.pathname.startsWith('/admin');
    const isUserRoute = location.pathname.startsWith('/user/');
    const isPublicRoute = ['/signin', '/signup', '/login', '/register', '/products', '/product/', '/categories', '/about', '/contact'].some(
      route => location.pathname === route || location.pathname.startsWith(route + '/')
    );

    if (isLoggedIn) {
      // Mettre à jour le store Redux avec les données utilisateur
      dispatch(loginSuccess(user));
      
      // Rediriger depuis les pages d'authentification vers le tableau de bord
      if (['/signin', '/signup', '/login', '/register'].includes(location.pathname)) {
        navigate(user.isAdmin ? '/admin' : `/user/${user._id}`);
      }
      // Rediriger vers le tableau de bord admin si l'utilisateur est admin
      else if (user.isAdmin && !isAdminPage && !isUserRoute && !isPublicRoute) {
        navigate('/admin');
      }
      // Rediriger vers la page utilisateur si l'ID dans l'URL ne correspond pas
      else if (isUserRoute) {
        const userIdFromUrl = location.pathname.split('/')[2];
        if (userIdFromUrl !== user._id) {
          navigate(`/user/${user._id}${location.pathname.split('/').slice(3).join('/')}`);
        }
      }
    } else {
      // Si l'utilisateur n'est pas connecté et tente d'accéder à des routes protégées
      if ((isUserRoute || isAdminPage || 
          ['/cart', '/checkout', '/profile', '/orders', '/payment', '/order-success'].some(
            route => location.pathname.includes(route)
          ))) {
        navigate('/signin', { state: { from: location.pathname } });
      }
    }
  }, [location.pathname, navigate, dispatch]);

  // Render public or protected routes based on authentication
  const renderRoutes = () => {
    const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
    const isUserAuthenticated = isLoggedIn || !!localStorage.getItem('token');
    
    if (isUserAuthenticated) {
      return (
        <Routes>
          {/* User-specific routes */}
          <Route path="/user/:id" element={
            <UserRoute>
              <UserPage />
            </UserRoute>
          }>
            <Route index element={<UserDashboard />} />
            <Route path="cart" element={<Cart />} />
            <Route path="profile" element={<Profile />} />

          </Route>

          {/* Public routes accessibles aux utilisateurs connectés */}
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/order/success/:orderId" 
            element={
              <ProtectedRoute>
                <OrderSuccess />
              </ProtectedRoute>
            } 
          />

          {/* Admin route */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminPage />
              </ProtectedRoute>
            } 
          />

          {/* Redirection vers le tableau de bord utilisateur pour les routes inconnues */}
          <Route 
            path="*" 
            element={<Navigate to={`/user/${currentUser._id}`} replace />} 
          />
        </Routes>
      );
    }
    
    // Public routes pour les utilisateurs non connectés
    return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Rediriger vers la page de connexion pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    );
  };

  return (
    <div className="app">
      {!isAdminPage && <Navbar />}
      <main className="main-content">
        {renderRoutes()}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </Provider>
  );
};

export default App;
