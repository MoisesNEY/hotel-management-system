import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'; // Added useLocation
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
        <div
            className={`wrapper ${isCollapsed ? 'sidebar-mini' : ''}`}
            style={{ backgroundColor: '#f4f3ef', position: 'relative', minHeight: '100vh', display: 'block', top: 0, height: '100vh', overflowX: 'hidden' }}
        >
            <Sidebar
                bgColor={bgColor}
                activeColor={activeColor}
                routes={routes}
            />

            <div
                className="main-panel"
                ref={mainPanelRef}
                style={{
                    position: 'relative',
                    float: 'right',
                    backgroundColor: '#f4f3ef',
                    maxHeight: '100%',
                    height: '100%',
                    overflow: 'auto',
                    // width is handled by CSS (calc(100% - 260px) or calc(100% - 80px) via sidebar-mini)
                }}
            >
                <Navbar onToggleSidebar={handleToggleSidebar} />

                {/* Overlay for mobile sidebar closing - visible via CSS when nav-open */}
                <div
                    className="close-layer"
                    onClick={() => {
                        if (sidebarOpen) handleToggleSidebar();
                    }}
                />

                <div className="content" style={{ padding: '0 30px 30px', minHeight: 'calc(100vh - 123px)', marginTop: '80px' }}> {/* Increased margin-top to prevent overlap */}
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
