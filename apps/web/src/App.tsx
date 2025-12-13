
import LandingPage from './pages/LandingPage';
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
    <div className="App">
      <LandingPage />
    </div>
  );
}

export default App;