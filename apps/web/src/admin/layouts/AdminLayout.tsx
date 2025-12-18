import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PerfectScrollbar from 'perfect-scrollbar';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ThemeSwitcher from '../components/layout/ThemeSwitcher';
import routes from '../routes';

const AdminLayout: React.FC = () => {
    const [bgColor, setBgColor] = useState<string>('black');
    const [activeColor, setActiveColor] = useState<string>('primary');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const mainPanelRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Load theme from localStorage
    useEffect(() => {
        const savedBgColor = localStorage.getItem('admin-sidebar-bg');
        const savedActiveColor = localStorage.getItem('admin-active-color');

        if (savedBgColor) setBgColor(savedBgColor);
        if (savedActiveColor) setActiveColor(savedActiveColor);
    }, []);

    // Initialize Perfect Scrollbar (Windows only)
    useEffect(() => {
        let ps: PerfectScrollbar | null = null;

        if (mainPanelRef.current && navigator.platform.indexOf('Win') > -1) {
            ps = new PerfectScrollbar(mainPanelRef.current, {
                suppressScrollX: true,
                suppressScrollY: false
            });
            document.body.classList.add('perfect-scrollbar-on');
        }

        return () => {
            if (ps) {
                ps.destroy();
                document.body.classList.remove('perfect-scrollbar-on');
            }
        };
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        if (mainPanelRef.current) {
            mainPanelRef.current.scrollTop = 0;
            // Also scroll window just in case
            window.scrollTo(0, 0);
        }
    }, [location.pathname]);

    const handleBgColorChange = (color: string) => {
        setBgColor(color);
        localStorage.setItem('admin-sidebar-bg', color);
    };

    const handleActiveColorChange = (color: string) => {
        setActiveColor(color);
        localStorage.setItem('admin-active-color', color);
    };

    const handleToggleSidebar = () => {
        // Desktop Collapse Logic
        if (document.documentElement.clientWidth > 991) {
            setIsCollapsed(!isCollapsed);
            return;
        }

        // Mobile Overlay Logic
        setSidebarOpen(!sidebarOpen);
        const html = document.documentElement;
        const body = document.body;

        if (!sidebarOpen) {
            html.classList.add('nav-open');
            body.classList.add('nav-open');
        } else {
            html.classList.remove('nav-open');
            body.classList.remove('nav-open');
        }
    };

    // Close sidebar when route changes on mobile
    useEffect(() => {
        const html = document.documentElement;
        const body = document.body;
        html.classList.remove('nav-open');
        body.classList.remove('nav-open');
        setSidebarOpen(false);
    }, [location.pathname]);

    return (
        <div className={`relative min-h-screen block t-0 h-screen overflow-x-hidden bg-paper-bg transition-all duration-300 ease-in-out ${isCollapsed ? 'sidebar-mini' : ''}`}>
            <Sidebar
                bgColor={bgColor}
                activeColor={activeColor}
                routes={routes}
            />

            <div
                className="main-panel relative float-right bg-paper-bg max-h-full h-full overflow-auto w-full transition-all duration-300 ease-in-out lg:w-[calc(100%-260px)]"
                ref={mainPanelRef}
            >
                <Navbar onToggleSidebar={handleToggleSidebar} />

                {/* Overlay for mobile sidebar closing */}
                <div
                    className={`fixed inset-0 bg-black/30 z-[9998] transition-all duration-300 ease-in-out ${sidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'} lg:hidden`}
                    onClick={() => {
                        if (sidebarOpen) handleToggleSidebar();
                    }}
                />

                <div className="content px-8 pb-8 mt-20 min-h-[calc(100vh-123px)]">
                    <Routes>
                        {routes.map((route, index) => (
                            <Route
                                key={index}
                                path={route.path}
                                element={<route.component />}
                            />
                        ))}
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                </div>

                <Footer />
            </div>

            {/* Theme Switcher kept for functionality */}
            <ThemeSwitcher
                onBgColorChange={handleBgColorChange}
                onActiveColorChange={handleActiveColorChange}
                currentBgColor={bgColor}
                currentActiveColor={activeColor}
            />
        </div>
    );
};

export default AdminLayout;
