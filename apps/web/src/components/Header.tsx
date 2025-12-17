// apps/web/src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X, UserCircle, LogOut, User, AlertCircle } from 'lucide-react';
import '../styles/header.css';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { isAuthenticated, userProfile, login, logout, hasProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Usar el estado global para la UI. Si es null (cargando), asumimos true para no molestar.
  // Solo molestamos si es explícitamente false.
  const hasCompletedExtraInfo = hasProfile !== false;

  // Efecto solo para UI (scroll y clicks externos)
  useEffect(() => {
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
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleUserMenu = () => setShowUserMenu(!showUserMenu);

  const handleLinkClick = (sectionId: string) => {
    setActiveLink(sectionId);
    setIsMenuOpen(false);

    // Si estamos en otra página que no es Home, navegar a Home primero
    if (window.location.pathname !== '/') {
      navigate('/');
      // Esperar un poco para que cargue Home antes de hacer scroll
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

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

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    localStorage.removeItem('hasCompletedExtraInfo');
    localStorage.removeItem('userData');
  };

  // Necesitamos setear isAuthenticated local si queremos usarlo en el render inmediatamente
  // aunque useAuth ya nos lo da. 
  // NOTA: En el render usaremos 'isAuthenticated' del hook directly.

  const handleViewProfile = () => {
    // Simplemente navegar - RequireProfile manejará la lógica de redirección
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleCompleteInfo = () => {
    navigate('/customer');
    setShowUserMenu(false);
  };
  
  // Extraer datos de perfil de forma segura
  const username = userProfile?.username || userProfile?.firstName || 'Usuario';
  const email = userProfile?.email || '';

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
              <a href="#home" className={`nav-link ${activeLink === 'home' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}>Inicio</a>
              <a href="#habitaciones" className={`nav-link ${activeLink === 'habitaciones' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleLinkClick('habitaciones'); }}>Habitaciones</a>
              <a href="#servicios" className={`nav-link ${activeLink === 'servicios' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleLinkClick('servicios'); }}>Servicios</a>
              <a href="#caracteristicas" className={`nav-link ${activeLink === 'caracteristicas' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleLinkClick('caracteristicas'); }}>Características</a>
              <a href="#contacto" className={`nav-link ${activeLink === 'contacto' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleLinkClick('contacto'); }}>Contacto</a>

              <div className="nav-buttons">
                {!isAuthenticated ? (
                  <>
                    <button className="btn btn-secondary" onClick={() => login()}>Iniciar Sesión</button>
                    {/* Keycloak maneja registro en login con parámetro, o login() abre la página de login que tiene opción registro */}
                    <button className="btn btn-primary" onClick={() => login()}>Registrarse</button>
                  </>
                ) : (
                  <div className="user-menu-container">
                    <button className="user-profile-btn" onClick={toggleUserMenu} aria-label="User menu">
                      <div className="user-avatar">
                        <UserCircle size={32} />
                        {!hasCompletedExtraInfo && <span className="pulse-dot"></span>}
                      </div>
                      <span className="user-name">{username}</span>
                      {!hasCompletedExtraInfo && (
                        <div className="info-required-badge"><AlertCircle size={16} /></div>
                      )}
                    </button>
                    
                    {showUserMenu && (
                      <div className="user-dropdown-menu">
                        <div className="user-info">
                          <div className="user-info-name">{username}</div>
                          <div className="user-info-email">{email}</div>
                          {!hasCompletedExtraInfo && (
                            <div className="info-required-warning">⚠️ Información incompleta</div>
                          )}
                        </div>
                        <div className="dropdown-divider"></div>
                        
                        <button className="dropdown-item" onClick={handleViewProfile}>
                          <User size={16} /><span>Ver Perfil</span>
                        </button>
                        
                        {!hasCompletedExtraInfo && (
                          <>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item info-required-item" onClick={handleCompleteInfo}>
                              <AlertCircle size={16} />
                              <div className="info-required-text"><span>Completar Información</span><small>¡Obligatorio!</small></div>
                              <div className="pulse-animation"></div>
                            </button>
                          </>
                        )}
                        
                        <div className="dropdown-divider"></div>
                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                          <LogOut size={16} /><span>Cerrar Sesión</span>
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