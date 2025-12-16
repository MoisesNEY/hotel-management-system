import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
    const mainPanelRef = useRef<HTMLDivElement>(null);

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

    return (
        <div className="wrapper" style={{ backgroundColor: '#f4f3ef', position: 'relative', minHeight: '100vh', display: 'block', top: 0, height: '100vh' }}>
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
                    width: 'calc(100% - 260px)',
                    backgroundColor: '#f4f3ef',
                    transition: 'all 0.5s cubic-bezier(0.685, 0.0473, 0.346, 1)',
                    maxHeight: '100%',
                    height: '100%'
                }}
            >
                <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <div className="content" style={{ padding: '0 30px 30px', minHeight: 'calc(100vh - 123px)', marginTop: '30px' }}>
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

            {/* Theme Switcher kept for functionality, though UI might need check */}
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
