import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, User, LogOut, 
  Menu, ChevronDown, LayoutDashboard,
  Settings, Shield
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthProvider';
import ThemeToggle from '../../../components/ThemeToggle';

interface NavbarProps {
    onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userProfile, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.admin-user-menu') && !target.closest('.admin-profile-trigger')) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('click', handleClickOutside);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('dashboard')) return 'Dashboard';
        if (path.includes('rooms')) return 'Habitaciones';
        if (path.includes('room-types')) return 'Tipos de Habitación';
        if (path.includes('bookings')) return 'Reservas';
        if (path.includes('services')) return 'Servicios';
        if (path.includes('customers')) return 'Clientes';
        if (path.includes('cms')) return 'Gestión de Contenido';
        if (path.includes('profile')) return 'Mi Perfil';
        return 'Panel de Administración';
    };

    const username = `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || userProfile?.username || 'Administrador';
    
    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={`
            sticky top-0 z-[1000] w-full transition-all duration-300
            ${isScrolled 
                ? 'bg-white/80 dark:bg-[#111111]/80 backdrop-blur-lg border-b border-gray-100 dark:border-white/5 shadow-sm' 
                : 'bg-transparent border-transparent'
            }
        `}>
            <div className="px-6 py-3 flex items-center justify-between">
                {/* Left Side: Page Title & Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <button
                        type="button"
                        className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        onClick={onToggleSidebar}
                    >
                        <Menu size={20} />
                    </button>
                    
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold-default/80">
                            <LayoutDashboard size={10} />
                            <span>Gran Hotel Admin</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {getPageTitle()}
                        </h1>
                    </div>
                </div>

                {/* Right Side: Search, Notifications, Theme, Profile */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search - Desktop Only */}
                    <div className="hidden md:flex items-center relative group">
                        <Search size={18} className="absolute left-3 text-gray-400 group-focus-within:text-gold-default transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Buscar..." 
                            className="pl-10 pr-4 py-2 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-transparent focus:border-gold-default/30 focus:bg-white dark:focus:bg-[#1e293b] text-sm text-gray-900 dark:text-white outline-none transition-all w-48 lg:w-64"
                        />
                    </div>

                    <div className="flex items-center gap-1">
                        <ThemeToggle variant="icon" className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" />
                    </div>

                    <div className="h-8 w-px bg-gray-200 dark:bg-white/5 mx-1"></div>

                    {/* Profile Dropdown */}
                    <div className="relative admin-user-menu">
                        <button 
                            className="admin-profile-trigger flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-default to-gold-dark flex items-center justify-center text-[#0f172a] font-bold text-sm shadow-sm">
                                {getInitials(username)}
                            </div>
                            <div className="hidden lg:flex flex-col items-start leading-tight pr-1">
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                                    {username}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                    Administrador
                                </span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 animate-[scaleIn_0.2s_ease-out] origin-top-right">
                                <div className="px-4 py-3 mb-1">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cuenta</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userProfile?.email || 'admin@hotel.com'}</p>
                                </div>
                                
                                <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 mb-1"></div>
                                
                                <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:text-gold-default transition-colors">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Mi Perfil</span>
                                </button>
                                
                                <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:text-gold-default transition-colors">
                                        <Settings size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Configuración</span>
                                </button>

                                <button className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:text-gold-default transition-colors">
                                        <Shield size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Seguridad</span>
                                </button>
                                
                                <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 my-1"></div>
                                
                                <button 
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-red-100 dark:bg-red-500/20 group-hover:bg-red-200 dark:group-hover:bg-red-500/30 transition-colors">
                                        <LogOut size={16} />
                                    </div>
                                    <span className="text-sm font-bold">Cerrar Sesión</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
