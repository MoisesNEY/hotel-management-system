import React, { useState, useEffect } from 'react';
import { Hotel, Menu, X, LogOut, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthProvider';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const { isAuthenticated, userProfile, login, logout, hasProfile } = useAuth();
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState('home');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const hasCompletedExtraInfo = hasProfile !== false;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      const sections = ['home', 'caracteristicas', 'habitaciones', 'servicios', 'galeria', 'contacto'];
      let closestSection = sections[0];
      let minDistance = Infinity;

      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - 80);
          if (distance < minDistance) {
            minDistance = distance;
            closestSection = sectionId;
          }
        }
      });

      setActiveLink(closestSection);
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

    if (window.location.pathname !== '/') {
      navigate('/');
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

  const handleViewProfile = () => {
    navigate('/profile');
    setShowUserMenu(false);
  };

  const handleCompleteInfo = () => {
    navigate('/customer');
    setShowUserMenu(false);
  };

  const username =
    `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() ||
    userProfile?.username ||
    'Usuario';

  const email = userProfile?.email || '';
  
  const getInitials = (name?: string) => {
    if (!name) return '';
    return name
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(word => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header 
      className={`fixed top-0 w-full z-[1000] transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-white dark:bg-navy-default/95 backdrop-blur-md border-gray-200 dark:border-white/5 shadow-lg' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <nav className="py-[15px]">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3 transition-transform duration-300 hover:scale-105">
              <Hotel size={36} color="#d4af37" />
              <div>
                <div className={`font-['Playfair_Display'] text-2xl font-bold tracking-wide ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
                  Grand Hotel
                </div>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-1.5 rounded hover:bg-white/10 transition-all duration-300 text-white"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Navigation Links */}
            <div className={`
              md:flex md:items-center md:gap-9
              ${isMenuOpen ? 'flex' : 'hidden'}
              max-md:absolute max-md:top-full max-md:left-0 max-md:right-0
              max-md:flex-col max-md:bg-[rgba(26,26,46,0.98)] max-md:backdrop-blur-[20px]
              max-md:p-6 max-md:rounded-xl max-md:mt-4 max-md:border max-md:border-white/10
              max-md:shadow-[0_10px_30px_rgba(0,0,0,0.4)] max-md:gap-0
            `}>
              {/* Nav Links */}
              <a
                href="#home"
                className={`nav-link relative py-2 font-medium transition-all duration-300 font-['Inter'] text-[0.95rem] tracking-wide
                  ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} hover:opacity-90
                  max-md:py-4 max-md:w-full max-md:text-center max-md:border-b max-md:border-white/10
                  ${activeLink === 'home' ? 'font-semibold after:w-full' : 'after:w-0'}
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-[#d4af37] after:to-[#f7ef8a] 
                  after:transition-all after:duration-300 after:rounded-sm
                  hover:after:w-full
                `}
                onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }}
              >
                Inicio
              </a>
              <a
                href="#caracteristicas"
                className={`nav-link relative py-2 font-medium transition-all duration-300 font-['Inter'] text-[0.95rem] tracking-wide
                  ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} hover:opacity-90
                  max-md:py-4 max-md:w-full max-md:text-center max-md:border-b max-md:border-white/10
                  ${activeLink === 'caracteristicas' ? 'font-semibold after:w-full' : 'after:w-0'}
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-[#d4af37] after:to-[#f7ef8a] 
                  after:transition-all after:duration-300 after:rounded-sm
                  hover:after:w-full
                `}
                onClick={(e) => { e.preventDefault(); handleLinkClick('caracteristicas'); }}
              >
                Características
              </a>
              <a
                href="#habitaciones"
                className={`nav-link relative py-2 font-medium transition-all duration-300 font-['Inter'] text-[0.95rem] tracking-wide
                  ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} hover:opacity-90
                  max-md:py-4 max-md:w-full max-md:text-center max-md:border-b max-md:border-white/10
                  ${activeLink === 'habitaciones' ? 'font-semibold after:w-full' : 'after:w-0'}
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-[#d4af37] after:to-[#f7ef8a] 
                  after:transition-all after:duration-300 after:rounded-sm
                  hover:after:w-full
                `}
                onClick={(e) => { e.preventDefault(); handleLinkClick('habitaciones'); }}
              >
                Habitaciones
              </a>
              <a
                href="#servicios"
                className={`nav-link relative py-2 font-medium transition-all duration-300 font-['Inter'] text-[0.95rem] tracking-wide
                  ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} hover:opacity-90
                  max-md:py-4 max-md:w-full max-md:text-center max-md:border-b max-md:border-white/10
                  ${activeLink === 'servicios' ? 'font-semibold after:w-full' : 'after:w-0'}
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-[#d4af37] after:to-[#f7ef8a] 
                  after:transition-all after:duration-300 after:rounded-sm
                  hover:after:w-full
                `}
                onClick={(e) => { e.preventDefault(); handleLinkClick('servicios'); }}
              >
                Servicios
              </a>
              <a
                href="#galeria"
                className={`nav-link relative py-2 font-medium transition-all duration-300 font-['Inter'] text-[0.95rem] tracking-wide
                  ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} hover:opacity-90
                  max-md:py-4 max-md:w-full max-md:text-center max-md:border-b max-md:border-white/10
                  ${activeLink === 'galeria' ? 'font-semibold after:w-full' : 'after:w-0'}
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-[#d4af37] after:to-[#f7ef8a] 
                  after:transition-all after:duration-300 after:rounded-sm
                  hover:after:w-full
                `}
                onClick={(e) => { e.preventDefault(); handleLinkClick('galeria'); }}
              >
                Galeria
              </a>
              <a
                href="#contacto"
                className={`nav-link relative py-2 font-medium transition-all duration-300 font-['Inter'] text-[0.95rem] tracking-wide
                  ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} hover:opacity-90
                  max-md:py-4 max-md:w-full max-md:text-center max-md:border-b-0
                  ${activeLink === 'contacto' ? 'font-semibold after:w-full' : 'after:w-0'}
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-[#d4af37] after:to-[#f7ef8a] 
                  after:transition-all after:duration-300 after:rounded-sm
                  hover:after:w-full
                `}
                onClick={(e) => { e.preventDefault(); handleLinkClick('contacto'); }}
              >
                Contacto
              </a>

              {/* Auth Buttons */}
              <div className="flex gap-3 max-md:flex-col max-md:w-full max-md:mt-5 max-md:gap-2.5">
                {!isAuthenticated ? (
                  <>
                    <button
                      className="bg-transparent text-white border-2 border-[rgba(212,175,55,0.4)] px-6 py-2.5 rounded-md font-semibold transition-all duration-300 font-['Inter'] text-sm tracking-wide hover:bg-[rgba(212,175,55,0.1)] hover:border-[rgba(212,175,55,0.8)] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(212,175,55,0.2)] max-md:w-full max-md:text-center max-md:py-3"
                      onClick={() => login()}
                    >
                      Iniciar Sesión
                    </button>
                    <button
                      className="bg-gradient-to-br from-[#d4af37] to-[#b8941f] text-[#1a1a2e] px-6 py-2.5 rounded-md font-semibold transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.3)] font-['Inter'] text-sm tracking-wide hover:bg-gradient-to-br hover:from-[#b8941f] hover:to-[#9c7c1a] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(212,175,55,0.4)] hover:text-white max-md:w-full max-md:text-center max-md:py-3"
                      onClick={() => login()}
                    >
                      Registrarse
                    </button>
                  </>
                ) : (
                  <div className="user-menu-container relative max-md:w-full">
                    <button
                      className="flex items-center gap-2 p-2 px-3 rounded-lg hover:bg-white/10 transition-colors duration-300 max-md:justify-center max-md:w-full"
                      onClick={toggleUserMenu}
                      aria-label="User menu"
                    >
                      <div className="relative w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-gradient-to-br from-[#0B1D2A] to-[#102A43] border-[1.5px] border-[#D4AF37] flex items-center justify-center shadow-[0_2px_6px_rgba(11,29,42,0.45),inset_0_0_4px_rgba(212,175,55,0.25)] transition-all duration-250 hover:shadow-[0_4px_12px_rgba(212,175,55,0.35),inset_0_0_6px_rgba(212,175,55,0.3)] hover:scale-105">
                        <span className="text-[#F5D76E] font-bold text-xs tracking-wider font-['Poppins'] select-none">
                          {getInitials(username)}
                        </span>
                        {!hasCompletedExtraInfo && (
                          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                      </div>

                      <span className={`${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} font-medium text-sm max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap`}>
                        {username}
                      </span>

                      {!hasCompletedExtraInfo && (
                        <div className="text-[#f59e0b] animate-pulse">
                          <AlertCircle size={16} />
                        </div>
                      )}
                    </button>

                    {showUserMenu && (
                      <div className="absolute top-[calc(100%+15px)] right-0 
                        bg-white/95 dark:bg-[#0b1437]/95 backdrop-blur-xl 
                        border border-gray-100 dark:border-white/10 
                        rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] 
                        min-w-[260px] z-[1000] overflow-hidden
                        animate-[fadeIn_0.3s_ease-out] 
                        max-md:fixed max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:right-0 
                        max-md:rounded-t-[2.5rem] max-md:rounded-b-none max-md:min-w-0 
                        max-md:animate-[slideUp_0.4s_cubic-bezier(0.4,0,0.2,1)]"
                      >
                        {/* Header Section */}
                        <div className="p-6 pb-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b39226] flex items-center justify-center text-[#0a143c] font-bold text-lg shadow-lg">
                              {getInitials(username)}
                            </div>
                            <div className="flex flex-col overflow-hidden">
                              <span className="font-semibold text-gray-900 dark:text-white truncate text-base">
                                {username}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {email}
                              </span>
                            </div>
                          </div>
                          
                          {!hasCompletedExtraInfo ? (
                             <div className="flex items-center gap-2 py-1.5 px-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-full">
                               <AlertCircle size={12} className="text-amber-600 dark:text-amber-400" />
                               <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                 Perfil Incompleto
                               </span>
                             </div>
                          ) : (
                            <div className="flex items-center gap-2 py-1.5 px-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-full w-fit">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                               <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                 Cliente Verificado
                               </span>
                             </div>
                          )}
                        </div>

                        <div className="px-3">
                          <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-white/5 to-transparent"></div>
                        </div>

                        {/* Menu Actions */}
                        <div className="p-2 pt-3">
                          <button
                            className="group flex items-center gap-3 w-full p-3 px-4 rounded-xl text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:translate-x-1"
                            onClick={handleViewProfile}
                          >
                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-[#d4af37]/10 group-hover:text-[#d4af37] transition-colors">
                              <User size={18} />
                            </div>
                            <span>Mi Perfil</span>
                          </button>

                          <ThemeToggle variant="dropdown" className="mt-1" />

                          {!hasCompletedExtraInfo && (
                            <button
                              className="group flex items-center gap-3 w-full p-3 px-4 mt-2 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300 text-sm font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
                              onClick={handleCompleteInfo}
                            >
                              <div className="p-2 rounded-lg bg-white dark:bg-white/5 text-amber-600 dark:text-amber-400">
                                <AlertCircle size={18} className="animate-pulse" />
                              </div>
                              <div className="flex flex-col items-start leading-tight">
                                <span>Verificar Identidad</span>
                                <small className="text-[10px] opacity-70">Acción Requerida</small>
                              </div>
                            </button>
                          )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-2 pb-3">
                          <div className="px-4 mb-2">
                             <div className="h-px bg-gradient-to-r from-transparent via-gray-100 dark:via-white/5 to-transparent"></div>
                          </div>
                          <button
                            className="group flex items-center gap-3 w-full p-3 px-4 rounded-xl text-red-600 dark:text-red-400 text-sm font-semibold transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={handleLogout}
                          >
                            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors">
                              <LogOut size={18} />
                            </div>
                            <span>Cerrar Sesión</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes pulseBorder {
          0% {
            width: calc(100% + 12px);
            height: calc(100% + 12px);
            opacity: 1;
          }
          100% {
            width: calc(100% + 24px);
            height: calc(100% + 24px);
            opacity: 0;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;