import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import type { UserRole } from '../contexts/AuthProvider';

interface RoleGuardProps {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, allowedRoles, children }) => {
  const { isAuthenticated, isInitialized, hasRole, login } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    if (isInitialized && !isAuthenticated) {
        login();
    }
  }, [isInitialized, isAuthenticated, login]);

  if (!isInitialized) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div className="loading-screen">Redirigiendo al login (Role)...</div>;
  }

  // Verificar rol
  // Si se pasa allowedRoles, verificamos si tiene alguno de ellos
  // Si se pasa requiredRole (legacy), usamos ese
  const rolesToCheck = allowedRoles || (requiredRole ? [requiredRole] : []);
  
  if (rolesToCheck.length > 0) {
      const hasPermission = rolesToCheck.some(role => hasRole(role));
      if (!hasPermission) {
          return <Navigate to="/" replace />;
      }
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleGuard;
