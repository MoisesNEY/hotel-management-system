// src/components/Footer.tsx
import React from 'react';
import { Hotel, Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="footer" id="contacto">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="logo">
              <Hotel size={32} color="#3498db" />
              <span className="logo-text">Luxury Hotel</span>
            </div>
            <p className="footer-description">
              Tu experiencia hotelera perfecta comienza aquí. 
              Combinamos lujo, tecnología y servicio excepcional.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><Facebook size={20} /></a>
              <a href="#" className="social-link"><Instagram size={20} /></a>
              <a href="#" className="social-link"><Twitter size={20} /></a>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Contacto</h3>
            <div className="contact-info">
              <div className="contact-item">
                <MapPin size={18} />
                <span>Av. Principal 123, Ciudad</span>
              </div>
              <div className="contact-item">
                <Phone size={18} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="contact-item">
                <Mail size={18} />
                <span>info@luxuryhotel.com</span>
              </div>
            </div>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-title">Enlaces Rápidos</h3>
            <ul className="footer-links">
              <li><a href="#home">Inicio</a></li>
              <li><a href="#habitaciones">Habitaciones</a></li>
              <li><a href="#servicios">Servicios</a></li>
              <li><a href="#caracteristicas">Características</a></li>
              <li><a href="#">Política de Privacidad</a></li>
              <li><a href="#">Términos y Condiciones</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Luxury Hotel Management System. Todos los derechos reservados.</p>
          <p>Sistema desarrollado con Spring Boot, React y Keycloak</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;