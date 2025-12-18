import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0B1D2A] dark:bg-[#050a1f] text-white py-10 text-center" id="contacto">
      <div className="max-w-7xl mx-auto px-5">
        <div className="mb-5">
          <p className="text-[#D4AF37] italic font-medium text-xl mb-5">
            "Donde cada estadía se convierte en un recuerdo inolvidable"
          </p>
        </div>
        <div>
          <p className="text-sm text-white m-0">
            &copy; 2025 Luxury Hotel Management System.  
            Experiencias memorables, confianza garantizada.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
