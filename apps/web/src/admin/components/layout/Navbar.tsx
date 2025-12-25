import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search, User, LogOut,
    Menu, ChevronDown, LayoutDashboard,
    Settings, Shield
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthProvider';
import ThemeToggle from '../../../components/ThemeToggle';
import routes from '../../routes';

interface NavbarProps {
    onToggleSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userProfile, logout, getHighestRole, hasRole } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Command palette search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter routes based on search and user role
    const searchableRoutes = useMemo(() => {
        return routes.filter(route => {
            // Only show non-hidden routes
            if (route.hidden) return false;
            // Filter by role if applicable
            if (route.allowedRoles) {
                return route.allowedRoles.some(role => hasRole(role as 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_CLIENT'));
            }
            return true;
        });
    }, [hasRole]);

    const filteredRoutes = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase();
        return searchableRoutes.filter(route => 
            route.name.toLowerCase().includes(query) ||
            route.path.toLowerCase().includes(query)
        ).slice(0, 8); // Limit to 8 results
    }, [searchQuery, searchableRoutes]);

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
            if (!target.closest('.admin-search-container')) {
                setShowSearchResults(false);
            }
        };
        document.addEventListener('click', handleClickOutside);

        // Keyboard shortcut: Ctrl+K or Cmd+K to focus search
        const handleKeydown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            // Escape to close
            if (e.key === 'Escape') {
                setShowSearchResults(false);
                setSearchQuery('');
                searchInputRef.current?.blur();
            }
        };
        document.addEventListener('keydown', handleKeydown);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeydown);
        };
    }, []);

    // Reset selected index when results change
    useEffect(() => {
        setSelectedIndex(0);
    }, [filteredRoutes]);

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (filteredRoutes.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredRoutes.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredRoutes.length) % filteredRoutes.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const selectedRoute = filteredRoutes[selectedIndex];
            if (selectedRoute) {
                navigateToRoute(selectedRoute.path);
            }
        }
    };

    const navigateToRoute = (path: string) => {
        navigate(`/admin${path}`);
        setSearchQuery('');
        setShowSearchResults(false);
        searchInputRef.current?.blur();
    };

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

    const userRole = getHighestRole();
    const roleLabel =
        userRole === 'ROLE_ADMIN' ? 'Administrador' :
            userRole === 'ROLE_EMPLOYEE' ? 'Empleado' :
                userRole === 'ROLE_CLIENT' ? 'Cliente' : 'Usuario';

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
                ? 'bg-white/90 dark:bg-[#0f1115]/90 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 shadow-sm'
                : 'bg-transparent border-b border-transparent'
            }
        `}>
            <div className="px-6 h-16 flex items-center justify-between">
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
                            <span>Hotel Admin</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {getPageTitle()}
                        </h1>
                    </div>
                </div>

                {/* Right Side: Search, Notifications, Theme, Profile */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Search - Desktop Only - Command Palette */}
                    <div className="hidden md:flex items-center relative group admin-search-container">
                        <Search size={18} className="absolute left-3 text-gray-400 group-focus-within:text-gold-default transition-colors z-10" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Buscar sección... (Ctrl+K)"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSearchResults(true);
                            }}
                            onFocus={() => setShowSearchResults(true)}
                            onKeyDown={handleSearchKeyDown}
                            className="pl-10 pr-4 py-2 rounded-xl bg-gray-100/50 dark:bg-white/5 border border-transparent focus:border-gold-default/30 focus:bg-white dark:focus:bg-[#1e293b] text-sm text-gray-900 dark:text-white outline-none transition-all w-48 lg:w-64"
                        />

                        {/* Search Results Dropdown */}
                        {showSearchResults && filteredRoutes.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1c] rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 overflow-hidden animate-[scaleIn_0.15s_ease-out] origin-top z-50">
                                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-white/5">
                                    Secciones encontradas
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {filteredRoutes.map((route, index) => {
                                        const Icon = route.icon;
                                        const isSelected = index === selectedIndex;
                                        return (
                                            <button
                                                key={route.path}
                                                onClick={() => navigateToRoute(route.path)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-all ${
                                                    isSelected
                                                        ? 'bg-gold-default/10 text-gold-default'
                                                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-lg ${
                                                    isSelected
                                                        ? 'bg-gold-default/20 text-gold-default'
                                                        : 'bg-gray-100 dark:bg-white/10 text-gray-500'
                                                }`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold">{route.name}</div>
                                                    <div className="text-xs text-gray-400">/admin{route.path}</div>
                                                </div>
                                                {isSelected && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded bg-gold-default/20 text-gold-default font-bold">
                                                        Enter ↵
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="px-3 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-white/5 flex gap-4">
                                    <span>↑↓ navegar</span>
                                    <span>↵ seleccionar</span>
                                    <span>esc cerrar</span>
                                </div>
                            </div>
                        )}

                        {/* No results message */}
                        {showSearchResults && searchQuery.trim() && filteredRoutes.length === 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1c1c1c] rounded-xl shadow-2xl border border-gray-100 dark:border-white/10 p-4 text-center animate-[scaleIn_0.15s_ease-out] origin-top z-50">
                                <p className="text-sm text-gray-500">No se encontraron secciones</p>
                            </div>
                        )}
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
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-default to-gold-dark flex items-center justify-center text-[#0f172a] font-bold text-sm shadow-sm overflow-hidden">
                                {((userProfile?.attributes as any)?.picture?.[0]) ? (
                                    <img
                                        src={(userProfile?.attributes as any).picture[0]}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    getInitials(username)
                                )}
                            </div>
                            <div className="hidden lg:flex flex-col items-start leading-tight pr-1">
                                <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[100px]">
                                    {username}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">
                                    {roleLabel}
                                </span>
                            </div>
                            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/10 p-2 animate-[scaleIn_0.2s_ease-out] origin-top-right">
                                <div className="px-4 py-3 mb-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cuenta</p>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-default/10 text-gold-default border border-gold-default/20">
                                            {roleLabel}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{userProfile?.email || 'admin@hotel.com'}</p>
                                </div>

                                <div className="h-px bg-gray-100 dark:bg-white/5 mx-2 mb-1"></div>

                                <button
                                    onClick={() => {
                                        navigate('/admin/user-profile');
                                        setShowUserMenu(false);
                                    }}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:text-gold-default transition-colors">
                                        <User size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Mi Perfil</span>
                                </button>

                                <button
                                    onClick={() => {
                                        alert('Configuración próximamente');
                                        setShowUserMenu(false);
                                    }}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/10 group-hover:text-gold-default transition-colors">
                                        <Settings size={16} />
                                    </div>
                                    <span className="text-sm font-medium">Configuración</span>
                                </button>

                                <button
                                    onClick={() => {
                                        alert('Seguridad próximamente');
                                        setShowUserMenu(false);
                                    }}
                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                                >
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
