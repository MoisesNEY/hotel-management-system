import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import AdminReservationPage from './pages/AdminReservationPage';
import AdminLayout from './admin/layouts/AdminLayout';
import './App.css';
import './styles/landing.css';
import './admin/styles/admin.css';
import keycloak from './services/keycloak';
import { useEffect } from 'react';

function App() {
  // const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    keycloak.init({
      onLoad: 'check-sso',  // Verifica si hay sesión sin forzar login
      checkLoginIframe: false
    }).then(() => {
      // setAuthenticated(authenticated);
    });
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/customer" element={<CustomerDetailsPage />} />
      <Route path="/admin/reservations" element={<AdminReservationPage />} />

      {/* Admin Panel - Publicly accessible (no Keycloak authentication) */}
      <Route path="/admin/*" element={<AdminLayout />} />
    </Routes>
  );
}

export default App;
