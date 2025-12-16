// App.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import AdminReservationPage from './pages/AdminReservationPage';
import UserProfilePage from './pages/UserProfilePage';

import './App.css';
import './styles/landing.css';
import keycloak from './services/keycloak';
import { useEffect, useState } from 'react';

// ✅ Variable global para evitar múltiples inicializaciones
let keycloakInitialized = false;

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (!keycloakInitialized) {
      keycloakInitialized = true;

      keycloak.init({
        onLoad: 'check-sso',
        checkLoginIframe: false
      }).then(auth => {
        setAuthenticated(auth);
      }).catch(err => {
        console.error('Error al inicializar Keycloak:', err);
      });
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer" element={<CustomerDetailsPage />} />
      <Route path="/admin/reservations" element={<AdminReservationPage />} />
      <Route path="/profile" element={<UserProfilePage />} />
      <Route path="*" element={!authenticated ? <Navigate to="/" /> : null} />
    </Routes>
  );
}

export default App;
