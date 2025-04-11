import React from 'react';
import { BrowserRouter as Router, Routes as ReactRoutes, Route } from 'react-router-dom';
import { ChakraProvider, CSSReset } from '@chakra-ui/react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';
import PricingPlans from './pages/PricingPlans';

// Private Pages
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import OrganizationSettings from './pages/OrganizationSettings';
import Billing from './pages/Billing';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

function App() {
  return (
    <ChakraProvider>
      <CSSReset />
      <Router>
        <AuthProvider>
          <CartProvider>
            <ReactRoutes>
              {/* Public Routes */}
              <Route path="/" element={<PublicRoute><PricingPlans /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

              {/* Private Routes */}
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute roles={['admin']}><OrganizationSettings /></PrivateRoute>} />
              <Route path="/billing" element={<PrivateRoute roles={['admin']}><Billing /></PrivateRoute>} />
              <Route path="/super-admin" element={<PrivateRoute roles={['superAdmin']}><SuperAdminDashboard /></PrivateRoute>} />
            </ReactRoutes>
          </CartProvider>
        </AuthProvider>
        <Toaster position="top-right" />
      </Router>
    </ChakraProvider>
  );
}

export default App;
