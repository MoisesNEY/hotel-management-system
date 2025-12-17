import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import type { UserRole } from '../contexts/AuthProvider';

interface RoleGuardProps {
  requiredRole: UserRole;
  children?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, children }) => {
  const { isAuthenticated, isInitialized, hasRole } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Verificar rol
  if (!hasRole(requiredRole)) {
    // Si no tiene el rol, redirigir a Home (o página de Unauthorized)
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;
