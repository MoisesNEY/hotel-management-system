import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import AdminReservationPage from './pages/AdminReservationPage';
import './App.css';
import './styles/landing.css';
import keycloak from './services/keycloak';
import { useEffect, useState } from 'react';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({
      onLoad: 'check-sso',  // Verifica si hay sesión sin forzar login
      checkLoginIframe: false
    }).then(authenticated => {
      setAuthenticated(authenticated);
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer" element={<CustomerDetailsPage />} />
      <Route path="/admin/reservations" element={<AdminReservationPage />} />
    </Routes>
  );
}

export default App;
