// apps/web/src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X, UserCircle, LogOut, User, AlertCircle } from 'lucide-react';
import '../styles/header.css';
import keycloak from '../services/keycloak';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{ username?: string; email?: string }>({});
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [hasCompletedExtraInfo, setHasCompletedExtraInfo] = useState(() => {
    // Verificar en localStorage
    return localStorage.getItem('hasCompletedExtraInfo') === 'true';
  });

  useEffect(() => {
    // Inicializar Keycloak y verificar autenticación
    const initKeycloak = () => {
      if (keycloak) {
        const authenticated = keycloak.authenticated || false;
        setIsAuthenticated(authenticated);

        if (authenticated && keycloak.tokenParsed) {
          const token = keycloak.tokenParsed;
          setUserProfile({
            username: token.preferred_username || token.name || 'Usuario',
            email: token.email || ''
          });
        }
      }
    };

    initKeycloak();

    // Verificar si hay información extra completada
    const checkExtraInfo = () => {
      const completed = localStorage.getItem('hasCompletedExtraInfo') === 'true';
      setHasCompletedExtraInfo(completed);
    };

    // Configurar listener para cambios en la autenticación
    const checkAuth = () => {
      setIsAuthenticated(keycloak.authenticated || false);
      if (keycloak.authenticated && keycloak.tokenParsed) {
        const token = keycloak.tokenParsed;
        setUserProfile({
          username: token.preferred_username || token.name || 'Usuario',
          email: token.email || ''
        });
        // También verificar información extra
        checkExtraInfo();
      } else {
        setUserProfile({});
      }
    };

    // Verificar autenticación cada 2 segundos
    const interval = setInterval(checkAuth, 2000);

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
    
    // Verificar información extra periódicamente
    const extraInfoInterval = setInterval(checkExtraInfo, 3000);
    
    // Cerrar menú de usuario al hacer clic fuera
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
      clearInterval(extraInfoInterval);
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

const handleRegister = async () => {
  try {
    const registerUrl = await keycloak.createRegisterUrl({
      redirectUri: `${window.location.origin}?registered=true`
    });
    window.location.href = registerUrl;
  } catch (error) {
    console.error('Error al generar URL de registro:', error);
  }
};


  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin
    });
    setIsAuthenticated(false);
    setUserProfile({});
    setShowUserMenu(false);
    // Limpiar localStorage al cerrar sesión
    localStorage.removeItem('hasCompletedExtraInfo');
    localStorage.removeItem('userData');
  };

  const handleViewProfile = () => {
    // Verificar si tiene información completa antes de redirigir
    if (!hasCompletedExtraInfo && isAuthenticated) {
      const shouldComplete = window.confirm(
        '¡Atención! Necesitas completar tu información personal primero.\n\n¿Deseas completarla ahora?'
      );
      if (shouldComplete) {
        window.location.href = '/customer';
        return;
      }
    }
    window.location.href = '/profile';
    setShowUserMenu(false);
  };

  const handleCompleteInfo = () => {
    window.location.href = '/customer';
    setShowUserMenu(false);
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
                        {!hasCompletedExtraInfo && (
                          <span className="pulse-dot"></span>
                        )}
                      </div>
                      <span className="user-name">
                        {userProfile.username || 'Usuario'}
                      </span>
                      {!hasCompletedExtraInfo && (
                        <div className="info-required-badge">
                          <AlertCircle size={16} />
                        </div>
                      )}
                    </button>
                    
                    {showUserMenu && (
                      <div className="user-dropdown-menu">
                        <div className="user-info">
                          <div className="user-info-name">{userProfile.username}</div>
                          <div className="user-info-email">{userProfile.email}</div>
                          {!hasCompletedExtraInfo && (
                            <div className="info-required-warning">
                              ⚠️ Información incompleta
                            </div>
                          )}
                        </div>
                        <div className="dropdown-divider"></div>
                        
                        <button 
                          className="dropdown-item" 
                          onClick={handleViewProfile}
                        >
                          <User size={16} />
                          <span>Ver Perfil</span>
                        </button>
                        
                        {!hasCompletedExtraInfo && (
                          <>
                            <div className="dropdown-divider"></div>
                            <button 
                              className="dropdown-item info-required-item"
                              onClick={handleCompleteInfo}
                            >
                              <AlertCircle size={16} />
                              <div className="info-required-text">
                                <span>Completar Información</span>
                                <small>¡Obligatorio!</small>
                              </div>
                              <div className="pulse-animation"></div>
                            </button>
                          </>
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