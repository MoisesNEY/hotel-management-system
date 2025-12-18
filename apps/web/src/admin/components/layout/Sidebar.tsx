import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { BedDouble } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface RouteConfig {
    path: string;
    name: string;
    icon: LucideIcon;
    layout: string;
    hidden?: boolean;
}

interface SidebarProps {
    bgColor: string;
    activeColor: string;
    routes: RouteConfig[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeColor, routes }) => {
    const location = useLocation();

    const isActiveRoute = (path: string) => {
        return location.pathname.includes(path);
    };

    // Text color map for active state based on activeColor prop (using defined theme vars)
    const activeTextClass = {
        primary: 'text-paper-primary',
        info: 'text-paper-info',
        success: 'text-paper-success',
        warning: 'text-paper-warning',
        danger: 'text-paper-danger',
    }[activeColor] || 'text-paper-primary';

    return (
        <div
            className="sidebar fixed inset-y-0 left-0 w-[260px] block z-[1030] text-white font-[200] bg-paper-dark border-r border-[#ddd] bg-cover bg-center"
            data-color="black"
        >
            {/* Logo Section */}
            <div className="logo relative py-[7px] px-[15px] z-[4] border-b border-white/20">
                <div className="py-[10px] text-center flex items-center justify-center gap-3">
                    <div className="w-10 h-10 border border-[#333] rounded-full flex items-center justify-center bg-white">
                        <BedDouble size={20} className="text-gray-800" />
                    </div>
                    <a href="#" className="simple-text logo-normal uppercase text-white text-lg font-normal leading-[30px] no-underline">
                        Hotel Admin
                    </a>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="sidebar-wrapper relative h-[calc(100vh-75px)] overflow-auto w-[260px] z-[4] pb-[100px]">
                <ul className="nav mt-5 pl-0 mb-0 list-none">
                    {routes
                        .filter(route => !route.hidden)
                        .map((route, index) => {
                            const Icon = route.icon;
                            const isActive = isActiveRoute(route.path);

                            return (
                                <li key={index} className={`mt-0 ${isActive ? 'active' : ''}`}>
                                    <NavLink
                                        to={route.layout + route.path}
                                        className={({ isActive }) => `
                                            block my-[10px] mx-[15px] p-[10px_8px] 
                                            text-white no-underline relative uppercase cursor-pointer 
                                            text-xs leading-[30px] font-semibold transition-all duration-300
                                            flex items-center
                                            ${isActive ? activeTextClass + ' opacity-100' : 'opacity-70 hover:opacity-100'}
                                        `}
                                    >
                                        <i className={`text-2xl mr-3 leading-[30px] w-[34px] text-center ${isActive ? 'text-inherit' : 'text-white/50'}`}>
                                            <Icon size={22} />
                                        </i>
                                        <p className="m-0 leading-[30px]">{route.name}</p>
                                    </NavLink>
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
