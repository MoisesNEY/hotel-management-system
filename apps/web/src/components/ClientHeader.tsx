import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const ClientHeader: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const username = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.username || 'Cliente';

  const menuItems = [
    { name: 'Dashboard', path: '/client/dashboard' },
    { name: 'Mis Reservas', path: '/client/dashboard' }, // Podríamos separar esto luego si el usuario quiere
    { name: 'Servicios', path: '/client/services' },
    { name: 'Explorar Hotel', path: '/landing' }
  ];

  return (
    <header className={`fixed top-0 w-full z-[1000] transition-all duration-300 ${
      isScrolled ? 'bg-[#050505]/95 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/client/dashboard" className="flex items-center gap-3 group">
            <Hotel size={32} className="text-[#d4af37] group-hover:scale-110 transition-transform" />
            <span className="font-['Playfair_Display'] text-xl font-bold tracking-wider text-white">HOTEL</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path + item.name}
                to={item.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[#d4af37] ${
                  location.pathname === item.path ? 'text-[#d4af37]' : 'text-gray-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <ThemeToggle variant="dropdown" className="hidden sm:block" />
            
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 rounded-full bg-white/5 border border-white/10 hover:border-[#d4af37]/50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center text-black font-bold text-xs uppercase">
                  {username.charAt(0)}
                </div>
                <span className="hidden sm:block text-sm font-medium text-white pr-2">{username}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-56 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Sesión activa</p>
                    <p className="text-sm font-semibold text-white truncate">{username}</p>
                  </div>
                  <div className="p-2">
                    <button 
                      onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                    >
                      <User size={18} /> Mi Perfil
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    >
                      <LogOut size={18} /> Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[73px] bg-[#050505] z-50 p-6 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-medium ${location.pathname === item.path ? 'text-[#d4af37]' : 'text-white'}`}
              >
                {item.name}
              </Link>
            ))}
            <div className="h-px bg-white/5 my-2" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 text-rose-500 font-medium"
            >
              <LogOut size={20} /> Cerrar Sesión
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default ClientHeader;
