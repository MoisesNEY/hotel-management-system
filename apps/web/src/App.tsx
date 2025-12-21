import { Routes, Route, Navigate } from 'react-router-dom';
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Toaster } from 'react-hot-toast';
import { useAuth } from './contexts/AuthProvider';
import LandingPage from './pages/LandingPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import UserProfilePage from './pages/UserProfilePage';
import ClientLayout from './layouts/ClientLayout';
import ClientDashboardPage from './pages/ClientDashboardPage';
import ClientServiceRequests from './pages/ClientServiceRequests';

import AdminLayout from './admin/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RequireProfile from './components/RequireProfile';
import RoleGuard from './components/RoleGuard';

const RootRedirect = () => {
  const { isInitialized, isAuthenticated, roles } = useAuth();
  
  if (!isInitialized) return null;
  
  if (!isAuthenticated) return <Navigate to="/landing" replace />;
  
  if (roles?.includes('ROLE_ADMIN') || roles?.includes('ROLE_EMPLOYEE')) {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/client/dashboard" replace />;
};

function App() {
  return (
    <PayPalScriptProvider options={{ 
        clientId: "AXtI3lQlPN11na0d8it84mPLxDV4qHZkQQztH-2UEupx9gqwqkmgsBtVxPYnlCQcl7IoEropWKFl-YWX",
        currency: "USD",
        intent: "capture" 
    }}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Rutas protegidas que requieren autenticación */}
        <Route element={<ProtectedRoute />}>
          {/* Rutas que requieren perfil completo (o salto explícito) */}
          <Route element={<RequireProfile />}>

            {/* Rutas de Cliente envueltas en ClientLayout */}
            <Route element={<ClientLayout />}>
              <Route path="/profile" element={<UserProfilePage />} />
              <Route path="/client/dashboard" element={<ClientDashboardPage />} />
              <Route path="/client/services" element={<ClientServiceRequests />} />
            </Route>
            
          </Route>

          {/* Ruta para llenar detalles (excluida de RequireProfile para evitar ciclo) */}
          <Route path="/customer" element={<CustomerDetailsPage />} />
          
          {/* Rutas Administrativas (Requieren Rol) */}
          <Route element={<RoleGuard allowedRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']} />}>
             <Route path="/admin/*" element={<AdminLayout />} />
          </Route>
        </Route>
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
    </PayPalScriptProvider>
  );
}

export default App;
