import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const ClientHeader: React.FC = () => {
  const { userProfile, logout, getHighestRole } = useAuth();
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

  const userRole = getHighestRole();
  const roleLabel =
    userRole === 'ROLE_ADMIN' ? 'Administrador' :
      userRole === 'ROLE_EMPLOYEE' ? 'Empleado' :
        userRole === 'ROLE_CLIENT' ? 'Cliente' : 'Usuario';

  const menuItems = [
    { name: 'Dashboard', path: '/client/dashboard' },
    { name: 'Servicios', path: '/client/services' },
    { name: 'Explorar Hotel', path: '/landing' }
  ];

  return (
    <header className={`fixed top-0 w-full z-[1000] transition-all duration-300 ${isScrolled ? 'bg-white/95 dark:bg-[#050505]/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5 py-4 shadow-sm dark:shadow-none' : 'bg-transparent py-6'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/client/dashboard" className="flex items-center gap-3 group">
            <Hotel size={32} className="text-[#d4af37] group-hover:scale-110 transition-transform" />
            <span className="font-['Playfair_Display'] text-xl font-bold tracking-wider text-gray-900 dark:text-white">HOTEL</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.path + item.name}
                to={item.path}
                className={`text-sm font-medium tracking-wide transition-colors hover:text-[#d4af37] ${location.pathname === item.path ? 'text-[#d4af37]' : 'text-gray-600 dark:text-gray-400'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-2">
            <ThemeToggle variant="icon" className="p-2.5 rounded-xl hover:bg-white/10 transition-colors text-gray-400 hover:text-[#d4af37]" />

            <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>

            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/10 transition-all group"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#d4af37] to-[#8c7324] flex items-center justify-center text-[#0a0a0a] font-bold text-sm shadow-lg shadow-[#d4af37]/20 group-hover:shadow-[#d4af37]/40 transition-all">
                  {username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight">
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#d4af37] transition-colors">{username}</span>
                  <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{roleLabel}</span>
                </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 group-hover:text-[#d4af37] ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute top-[calc(100%+12px)] right-0 w-64 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Sesión activa</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-default/10 text-gold-default border border-gold-default/20">
                        {roleLabel}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#d4af37] truncate">{userProfile?.email || username}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => { navigate('/profile'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-[#d4af37]/20 group-hover:text-[#d4af37] transition-colors">
                        <User size={16} />
                      </div>
                      Mi Perfil
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-white/5 my-1 mx-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all group"
                    >
                      <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20 transition-colors">
                        <LogOut size={16} />
                      </div>
                      Cerrar Sesión
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
