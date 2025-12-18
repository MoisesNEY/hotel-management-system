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
        // Not needed for hover-based sidebar
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Supabase-style Sidebar */}
            <Sidebar
                bgColor={bgColor}
                activeColor={activeColor}
                routes={routes}
                isOpen={true}
                onToggle={handleToggleSidebar}
            />

            {/* Main Content - Always has left margin for collapsed sidebar */}
            <div
                className="main-panel min-h-screen transition-all duration-300 ease-in-out ml-[60px]"
                ref={mainPanelRef}
            >
                <Navbar onToggleSidebar={handleToggleSidebar} />

                <div className="content px-6 md:px-8 pb-8 pt-20">
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

            {/* Theme Switcher */}
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
