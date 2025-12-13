import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X, User, LogOut, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import '../styles/header.css';
import keycloak from '../services/keycloak';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username?: string; email?: string }>({});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  useEffect(() => {
    // Inicializar Keycloak
    const initKeycloak = () => {
      if (keycloak) {
        const authenticated = keycloak.authenticated || false;
        setIsAuthenticated(authenticated);

        if (authenticated && keycloak.tokenParsed) {
          const tokenParsed = keycloak.tokenParsed;
          setUserProfile({
            username: tokenParsed.preferred_username || tokenParsed.name || 'Usuario',
            email: tokenParsed.email || ''
          });
        }
      }
    };

    initKeycloak();

    // Verificar si se acaba de registrar (basado en URL o parámetros)
    const urlParams = new URLSearchParams(window.location.search);
    const registered = urlParams.get('registered') === 'true';
    
    if (registered) {
  setJustRegistered(true);

  const newUrl = window.location.pathname;
  window.history.replaceState({}, '', newUrl);

  setTimeout(() => {
    keycloak.logout({
      redirectUri: window.location.origin
    });
  }, 300);
}


    // Configurar listener para cambios en la autenticación
    const checkAuth = () => {
      setIsAuthenticated(keycloak.authenticated || false);
      if (keycloak.authenticated && keycloak.tokenParsed) {
        const tokenParsed = keycloak.tokenParsed;
        setUserProfile({
          username: tokenParsed.preferred_username || tokenParsed.name || 'Usuario',
          email: tokenParsed.email || ''
        });
      } else {
        setUserProfile({});
      }
    };

    const interval = setInterval(checkAuth, 1000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = ['home', 'habitaciones', 'servicios', 'caracteristicas', 'testimonios', 'contacto'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });

      if (currentSection) {
        setActiveLink(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container') && !target.closest('.user-profile-btn')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  const handleLinkClick = (sectionId: string) => {
    setActiveLink(sectionId);
    setIsMenuOpen(false);

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleLogin = () => {
    keycloak.login({
      redirectUri: window.location.origin
    });
  };
const handleRegister = () => {
  keycloak.login({
    action: 'register',
    redirectUri: `${window.location.origin}?registered=true`
  });
};


  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    });
    setIsAuthenticated(false);
    setUserProfile({});
    setShowUserMenu(false);
  };

 const handleViewProfile = () => {
    // Método 1: Usando React Router (recomendado)
    navigate('/profile');
    setShowUserMenu(false);
    
    // Método alternativo: Redirección directa
    // window.location.href = '/profile';
  };

  const handleAdminPanel = () => {
    window.location.href = '/admin';
  };

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <Hotel size={36} color="#d4af37" />
              <div>
                <div className="logo-text">Grand Hotel</div>
              </div>
            </div>

            <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
              <a
                href="#home"
                className={`nav-link ${activeLink === 'home' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}
              >
                Inicio
              </a>
              <a
                href="#habitaciones"
                className={`nav-link ${activeLink === 'habitaciones' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick('habitaciones'); }}
              >
                Habitaciones
              </a>
              <a
                href="#servicios"
                className={`nav-link ${activeLink === 'servicios' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick('servicios'); }}
              >
                Servicios
              </a>
              <a
                href="#caracteristicas"
                className={`nav-link ${activeLink === 'caracteristicas' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); handleLinkClick('caracteristicas'); }}
              >
                Características
              </a>
              <a
                href="#contacto"
                className={`nav-link ${activeLink === 'contacto' ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('contacto');
                }}
              >
                Contacto
              </a>

              <div className="nav-buttons">
                {!isAuthenticated ? (
                  <>
                    {justRegistered && (
                      <div className="registration-success">
                        ¡Registro exitoso! Por favor inicia sesión.
                      </div>
                    )}
                    <button className="btn btn-secondary" onClick={handleLogin}>
                      Iniciar Sesión
                    </button>
                    <button className="btn btn-primary" onClick={handleRegister}>
                      Registrarse
                    </button>
                  </>
                ) : (
                  <div className="user-menu-container">
                    <button 
                      className="user-profile-btn"
                      onClick={toggleUserMenu}
                      aria-label="User menu"
                    >
                      <div className="user-avatar">
                        <UserCircle size={32} />
                      </div>
                      <span className="user-name">
                        {userProfile.username || 'Usuario'}
                      </span>
                    </button>
                    
                    {showUserMenu && (
                      <div className="user-dropdown-menu">
                        <div className="user-info">
                          <div className="user-info-name">{userProfile.username}</div>
                          <div className="user-info-email">{userProfile.email}</div>
                        </div>
                        <div className="dropdown-divider"></div>
                        <button 
                          className="dropdown-item" 
                          onClick={handleViewProfile}
                        >
                          <User size={16} />
                          <span>Ver Perfil</span>
                        </button>
                        {keycloak.hasRealmRole('admin') && (
                          <button 
                            className="dropdown-item" 
                            onClick={handleAdminPanel}
                          >
                            <span>Panel Admin</span>
                          </button>
                        )}
                        <div className="dropdown-divider"></div>
                        <button 
                          className="dropdown-item logout-item" 
                          onClick={handleLogout}
                        >
                          <LogOut size={16} />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;