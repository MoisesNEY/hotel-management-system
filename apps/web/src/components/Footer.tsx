import React from 'react';
import { useListContent, useSingleContent } from '../hooks/useContent';
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  const { data: contactItems } = useListContent('CONTACT_INFO');
  const { data: footerInfo } = useSingleContent('FOOTER_INFO');

  const getContactVal = (key: string) => contactItems.find(c => c.title?.toLowerCase().includes(key.toLowerCase()));
  
  const phone = getContactVal('phone') || getContactVal('teléfono');
  const email = getContactVal('email') || getContactVal('correo');
  const address = getContactVal('address') || getContactVal('dirección');

  return (
    <footer className="bg-[#0a0b10] dark:bg-[#050608] text-white py-16 border-t border-white/5" id="contacto">
      <div className="max-w-7xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 text-left">
          {/* Brand & Quote */}
          <div className="space-y-6">
            <h3 className="text-2xl font-['Playfair_Display'] font-bold text-gold-default tracking-wider">GRAND HOTEL</h3>
            <p className="text-gray-400 italic text-base leading-relaxed">
              {footerInfo?.title || '"Donde cada estadía se convierte en un recuerdo inolvidable"'}
            </p>
            <div className="flex gap-4">
               <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-default/20 hover:text-gold-default transition-all duration-300 border border-white/10"><Facebook size={18} /></a>
               <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-default/20 hover:text-gold-default transition-all duration-300 border border-white/10"><Instagram size={18} /></a>
               <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-gold-default/20 hover:text-gold-default transition-all duration-300 border border-white/10"><Twitter size={18} /></a>
            </div>
          </div>

          {/* Contact Quick Info */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">Contacto Directo</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 group">
                <MapPin size={20} className="text-gold-default mt-1 transition-transform group-hover:scale-110" />
                <span className="text-gray-300 text-sm leading-6">{address?.subtitle || 'Cargando dirección...'}</span>
              </div>
              <div className="flex items-center gap-3 group">
                <Phone size={20} className="text-gold-default transition-transform group-hover:scale-110" />
                <a href={phone?.actionUrl} className="text-gray-300 text-sm hover:text-gold-default transition-colors">{phone?.subtitle || '...'}</a>
              </div>
              <div className="flex items-center gap-3 group">
                <Mail size={20} className="text-gold-default transition-transform group-hover:scale-110" />
                <a href={email?.actionUrl} className="text-gray-300 text-sm hover:text-gold-default transition-colors">{email?.subtitle || '...'}</a>
              </div>
            </div>
          </div>

          {/* Links or Newsletter */}
          <div className="space-y-6">
            <h4 className="text-sm font-bold uppercase tracking-widest text-white/50">Enlaces Útiles</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#habitaciones" className="hover:text-gold-default transition-colors">Habitaciones</a></li>
              <li><a href="#servicios" className="hover:text-gold-default transition-colors">Servicios & Spa</a></li>
              <li><a href="#galeria" className="hover:text-gold-default transition-colors">Galería</a></li>
              <li><a href="/login" className="hover:text-gold-default transition-colors">Portal de Empleados</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5">
          <p className="text-xs text-gray-500 tracking-widest uppercase">
            &copy; {new Date().getFullYear()} {footerInfo?.subtitle || 'Luxury Hotel Management System. Experiencias memorables, confianza garantizada.'}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
