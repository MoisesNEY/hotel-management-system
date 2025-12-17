import React from 'react';
import '../styles/footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer" id="contacto">
      <div className="container">
        <div className="footer-content">
          <p className="footer-quote">
            "Donde cada estadía se convierte en un recuerdo inolvidable"
          </p>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; 2025 Luxury Hotel Management System.  
            Experiencias memorables, confianza garantizada.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
