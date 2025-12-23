import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import routes from '../routes';
import { useAuth } from '../../contexts/AuthProvider';

const AdminLayout: React.FC = () => {
    const [bgColor, setBgColor] = useState<string>('black');
    const [activeColor, setActiveColor] = useState<string>('primary');
    const location = useLocation();
    const { hasRole } = useAuth();

    // Load theme from localStorage
    useEffect(() => {
        const savedBgColor = localStorage.getItem('admin-sidebar-bg');
        const savedActiveColor = localStorage.getItem('admin-active-color');

        if (savedBgColor) setBgColor(savedBgColor);
        if (savedActiveColor) setActiveColor(savedActiveColor);
    }, []);

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const handleToggleSidebar = () => {
        // Not needed for hover-based sidebar
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f1115] transition-colors duration-300">
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
            >
                <Navbar onToggleSidebar={handleToggleSidebar} />

                <div className="content px-6 md:px-8 pb-8 pt-24 min-h-[calc(100vh-60px)]">
                    <Routes>
                        {routes.map((route, index) => {
                            // Requisito de rol
                            const isAuthorized = !route.allowedRoles || route.allowedRoles.some(role => hasRole(role as any));

                            if (!isAuthorized) {
                                return (
                                    <Route
                                        key={index}
                                        path={route.path}
                                        element={<Navigate to="/admin/dashboard" replace />}
                                    />
                                );
                            }

                            return (
                                <Route
                                    key={index}
                                    path={route.path}
                                    element={<route.component />}
                                />
                            );
                        })}
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default AdminLayout;
