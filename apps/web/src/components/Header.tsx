import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X } from 'lucide-react';
import '../styles/header.css';
import keycloak from '../services/keycloak';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');



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
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
    keycloak.register({
      redirectUri: window.location.origin
    });
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
                <button className="btn btn-secondary" onClick={handleLogin}>
                  Iniciar Sesión
                </button>
                <button className="btn btn-primary" onClick={handleRegister}>
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
