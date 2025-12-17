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

    // Text color map for active state based on activeColor prop
    const activeTextClass = {
        primary: 'text-[#51cbce]', /* cyan */
        info: 'text-[#51bcda]',    /* blue */
        success: 'text-[#6bd098]', /* green */
        warning: 'text-[#fbc658]', /* orange */
        danger: 'text-[#ef8157]',  /* red */
    }[activeColor] || 'text-[#51cbce]';

    return (
        <div
            className="sidebar"
            data-color="black" /* We enforce black style as per plan */
            style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                width: '260px',
                display: 'block',
                zIndex: 1030,
                color: '#fff',
                fontWeight: 200,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundColor: 'var(--paper-sidebar-bg)', /* #212120 */
                boxShadow: 'none', /* The template usually has a soft shadow or none on black */
                borderRight: '1px solid #ddd' /* from _sidebar-and-main-panel.scss:21 */
            }}
        >
            {/* Logo Section */}
            <div
                className="logo"
                style={{
                    position: 'relative',
                    padding: '7px 15px',
                    zIndex: 4,
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)' /* Separator */
                }}
            >
                <div style={{ padding: '10px 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', border: '1px solid #333', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                        <BedDouble size={20} className="text-gray-800" />
                    </div>
                    <a href="#" className="simple-text logo-normal" style={{
                        textTransform: 'uppercase',
                        color: '#FFFFFF',
                        fontSize: '18px',
                        fontWeight: 400,
                        lineHeight: '30px',
                        textDecoration: 'none'
                    }}>
                        Hotel Admin
                    </a>
                </div>
            </div>

            {/* Navigation Section */}
            <div className="sidebar-wrapper" style={{
                position: 'relative',
                height: 'calc(100vh - 75px)',
                overflow: 'auto',
                width: '260px',
                zIndex: 4,
                paddingBottom: '100px'
            }}>
                <ul className="nav" style={{
                    marginTop: '20px',
                    paddingLeft: 0,
                    marginBottom: 0,
                    listStyle: 'none'
                }}>
                    {routes
                        .filter(route => !route.hidden)
                        .map((route, index) => {
                            const Icon = route.icon;
                            const isActive = isActiveRoute(route.path);

                            return (
                                <li key={index} className={isActive ? 'active' : ''} style={{ marginTop: '0' }}>
                                    <NavLink
                                        to={route.layout + route.path}
                                        style={({ isActive }) => ({
                                            margin: '10px 15px 0',
                                            color: isActive ? 'inherit' : '#FFFFFF', /* Active controls color via class below, inactive white */
                                            display: 'block',
                                            textDecoration: 'none',
                                            position: 'relative',
                                            textTransform: 'uppercase',
                                            cursor: 'pointer',
                                            fontSize: '12px',
                                            padding: '10px 8px',
                                            lineHeight: '30px',
                                            opacity: isActive ? 1 : 0.7,
                                            fontWeight: 600,
                                            transition: 'all 300ms ease 0s'
                                        })}
                                        className={({ isActive }) => isActive ? activeTextClass : ''}
                                    >
                                        <i style={{
                                            fontSize: '24px',
                                            float: 'left',
                                            marginRight: '12px',
                                            lineHeight: '30px',
                                            width: '34px',
                                            textAlign: 'center',
                                            color: isActive ? 'inherit' : 'rgba(255,255,255, 0.5)', /* Inactive icons are semitransparent */
                                        }}>
                                            <Icon size={22} />
                                        </i>
                                        <p style={{ margin: 0, lineHeight: '30px' }}>{route.name}</p>
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
