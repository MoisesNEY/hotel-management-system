import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import type { UserRole } from '../contexts/AuthProvider';
import LoadingScreen from './shared/LoadingScreen';

interface RoleGuardProps {
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ requiredRole, allowedRoles, children }) => {
  const { isAuthenticated, isInitialized, hasRole, login } = useAuth();


  React.useEffect(() => {
    if (isInitialized && !isAuthenticated) {
        login();
    }
  }, [isInitialized, isAuthenticated, login]);

  if (!isInitialized) {
    return <LoadingScreen message="Verificando permisos..." />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Acceso restringido..." />;
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
