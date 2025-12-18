import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import LoadingScreen from './shared/LoadingScreen';

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
    return <LoadingScreen message="Inicializando sistema..." />;
  }

  if (!isAuthenticated) {
    return <LoadingScreen message="Redirigiendo al portal..." />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
