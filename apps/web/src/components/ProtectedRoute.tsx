import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized, login } = useAuth();


  React.useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      login();
    }
  }, [isInitialized, isAuthenticated, login]);

  if (!isInitialized) {
    return <div className="loading-screen">Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div className="loading-screen">Redirigiendo al login...</div>;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
