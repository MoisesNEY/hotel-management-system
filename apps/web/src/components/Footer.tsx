import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer" id="contacto">
      <div className="container">
        <p className="footer-title">
          Síguenos en nuestras redes sociales
        </p>
        <div className="footer-socials">
          <a href="#" aria-label="YouTube">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png"
              alt="YouTube"
            />
          </a>

          <a href="#" aria-label="Instagram">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1384/1384063.png"
              alt="Instagram"
            />
          </a>

          <a href="#" aria-label="Facebook">
            <img
              src="https://cdn-icons-png.flaticon.com/512/1384/1384053.png"
              alt="Facebook"
            />
          </a>

          <a href="#" aria-label="TikTok">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png"
              alt="TikTok"
            />
          </a>
        </div>
        <div className="footer-extra-icon">
          <img
            src="https://cdn-icons-png.flaticon.com/512/6917/6917642.png"
            alt="Icono decorativo"
          />
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
