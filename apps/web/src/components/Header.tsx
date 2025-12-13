import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');

  const navigate = useNavigate();

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

              <div className="nav-buttons">
                <button className="btn btn-secondary" onClick={() => console.log('Login clickeado')}>
                  Iniciar Sesión
                </button>
                <button className="btn btn-primary" onClick={() => console.log('Register clickeado')}>
                  Registrarse
                </button>
                <button className="btn btn-info" onClick={() => navigate('/customer')}>
                  Detalles Cliente
                </button>
                <button
                  className="btn btn-admin"
                  onClick={() => navigate('/admin/reservations')}
                  style={{
                    background: 'linear-gradient(90deg, #0a1a2d 0%, #1a365d 100%)',
                    color: '#d4af37',
                    border: '1px solid #d4af37'
                  }}
                >
                  <i className="fas fa-tools" style={{ marginRight: '8px' }}></i>
                  Admin Reservas
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
