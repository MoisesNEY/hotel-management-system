import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { HomeModernIcon } from '@heroicons/react/24/outline';

interface RouteConfig {
    path: string;
    name: string;
    icon: React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement>>;
    layout: string;
    hidden?: boolean;
    group?: string;
}

interface SidebarProps {
    bgColor: string;
    activeColor: string;
    routes: RouteConfig[];
    isOpen: boolean;
    onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeColor, routes }) => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);

    const isActiveRoute = (path: string) => {
        return location.pathname.includes(path);
    };

    // Group routes
    const groupedRoutes: { [key: string]: RouteConfig[] } = {};
    routes.filter(route => !route.hidden).forEach(route => {
        const group = route.group || 'main';
        if (!groupedRoutes[group]) {
            groupedRoutes[group] = [];
        }
        groupedRoutes[group].push(route);
    });

    const activeTextClass = {
        primary: 'text-blue-500',
        info: 'text-cyan-500',
        success: 'text-green-500',
        warning: 'text-yellow-500',
        danger: 'text-red-500',
    }[activeColor] || 'text-blue-500';

    return (
        <aside
            className={`admin-sidebar fixed top-0 left-0 h-screen bg-[#1c1c1c] dark:bg-[#1c1c1c] border-r border-gray-800 transition-all duration-300 ease-in-out z-[1030] ${
                isExpanded ? 'w-[220px]' : 'w-[60px]'
            }`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center border-b border-gray-800" style={{ justifyContent: isExpanded ? 'flex-start' : 'center', paddingLeft: isExpanded ? '12px' : '0', paddingRight: isExpanded ? '12px' : '0' }}>
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center flex-shrink-0">
                    <HomeModernIcon className="w-5 h-5 text-white" />
                </div>
                {isExpanded && (
                    <span className="text-white text-sm font-medium whitespace-nowrap" style={{ marginLeft: '12px' }}>
                        Hotel Admin
                    </span>
                )}
            </div>

            {/* Navigation Section */}
            <nav className="py-4 h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden">
                {Object.entries(groupedRoutes).map(([groupName, groupRoutes], groupIndex) => (
                    <div key={groupName} className={groupIndex > 0 ? 'mt-6 pt-6 border-t border-gray-800' : ''}>
                        <ul className="space-y-1 px-2">
                            {groupRoutes.map((route, index) => {
                                const Icon = route.icon;
                                const isActive = isActiveRoute(route.path);

                                return (
                                    <li key={index}>
                                        <NavLink
                                            to={route.layout + route.path}
                                            className={`
                                                flex items-center h-10 rounded-md
                                                transition-all duration-200
                                                group relative
                                                ${isActive 
                                                    ? `bg-gray-800 ${activeTextClass}` 
                                                    : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                                                }
                                            `}
                                            style={{
                                                paddingLeft: isExpanded ? '12px' : '0',
                                                paddingRight: isExpanded ? '12px' : '0',
                                                justifyContent: isExpanded ? 'flex-start' : 'center'
                                            }}
                                        >
                                            <div style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                width: '20px',
                                                height: '20px',
                                                flexShrink: 0
                                            }}>
                                                <Icon className={`w-5 h-5 ${isActive ? 'stroke-2' : 'stroke-[1.5]'}`} />
                                            </div>
                                            
                                            {isExpanded && (
                                                <span style={{ marginLeft: '12px' }} className="text-sm font-normal whitespace-nowrap">
                                                    {route.name}
                                                </span>
                                            )}

                                            {/* Tooltip when collapsed */}
                                            {!isExpanded && (
                                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity duration-200">
                                                    {route.name}
                                                </div>
                                            )}
                                        </NavLink>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;
