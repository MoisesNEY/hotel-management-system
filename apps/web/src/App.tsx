// App.tsx
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import AdminReservationPage from './pages/AdminReservationPage';
import UserProfilePage from './pages/UserProfilePage';

import AdminLayout from './admin/layouts/AdminLayout';
import './App.css';
import './styles/landing.css';
import ProtectedRoute from './components/ProtectedRoute';
import RequireProfile from './components/RequireProfile';
import RoleGuard from './components/RoleGuard';
// import './admin/styles/admin.css'; // Removed: Imported in index.css
// import keycloak from './services/keycloak'; // Removed: Handled by AuthProvider
// import { useEffect } from 'react'; // Removed unused

function App() {
  // Keycloak initialization is handled by AuthProvider in main.tsx
  // No need for local useEffect init here to avoid double-init issues.

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      {/* Rutas protegidas que requieren autenticación */}
      <Route element={<ProtectedRoute />}>
        {/* Rutas que requieren perfil completo (o salto explícito) */}
        <Route element={<RequireProfile />}>

          {/* Rutas de Cliente */}
          <Route path="/profile" element={<UserProfilePage />} />

          {/* Rutas Administrativas (Requieren Rol) */}
          {/* Legacy route commented out in favor of new Admin Panel at /admin/* */}
          {/* <Route element={<RoleGuard requiredRole="ROLE_EMPLOYEE" />}>
            <Route path="/admin/reservations" element={<AdminReservationPage />} />
          </Route> */}

        </Route>

        {/* Ruta para llenar detalles (excluida de RequireProfile para evitar ciclo) */}
        <Route path="/customer" element={<CustomerDetailsPage />} />
      </Route>

      {/* Admin Panel - Publicly accessible (no Keycloak authentication) */}
      <Route path="/admin/*" element={<AdminLayout />} />
    </Routes>
  );
}

export default App;
