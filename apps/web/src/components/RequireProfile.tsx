import React, { useEffect, useState, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthProvider';
import { getMyProfile } from '../services/client/customerDetailsService';
import { getAccount } from '../services/accountService';
import LoadingScreen from './shared/LoadingScreen';

const RequireProfile: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const hasCheckedRef = useRef(false); // Prevenir múltiples checks

  useEffect(() => {
    const checkProfile = async () => {
      console.log('[RequireProfile] Starting check...', {
        isInitialized,
        isAuthenticated,
        pathname: location.pathname,
        hasChecked: hasCheckedRef.current
      });

      // 1. Si no está autenticado, esperamos
      if (!isInitialized || !isAuthenticated) {
        console.log('[RequireProfile] Not initialized or not authenticated, skipping check');
        setIsChecking(false);
        return;
      }

      // 2. Si ya verificamos, no volver a verificar (prevenir loops)
      if (hasCheckedRef.current) {
        console.log('[RequireProfile] Already checked, skipping');
        setIsChecking(false);
        return;
      }

      // 3. Verificar si decidió saltar en esta sesión
      const skipped = sessionStorage.getItem('skip_customer_details') === 'true';
      console.log('[RequireProfile] Skip flag:', skipped);
      
      if (skipped) {
        hasCheckedRef.current = true;
        setIsChecking(false);
        return;
      }

      // 4. Verificar localStorage primero (optimización)
      const localCompleted = localStorage.getItem('hasCompletedExtraInfo') === 'true';
      console.log('[RequireProfile] LocalStorage completed flag:', localCompleted);
      
      if (localCompleted) {
        console.log('[RequireProfile] Profile already marked as complete in localStorage');
        hasCheckedRef.current = true;
        setIsChecking(false);
        return;
      }

      // 5. Verificar con el backend
      try {
        console.log('[RequireProfile] Calling backend to verify profile...');
        await getAccount();
        
        const profileData = await getMyProfile();
        console.log('[RequireProfile] ✅ Profile exists!', profileData);
        
        // Marcar como completado
        localStorage.setItem('hasCompletedExtraInfo', 'true');
        hasCheckedRef.current = true;
        setIsChecking(false);
        
      } catch (error: any) {
        console.warn('[RequireProfile] Error verifying profile:', error);
        
        // Si recibimos un 404, CONFIRMAMOS que no tiene perfil
        if (error.response && error.response.status === 404) {
             console.log('[RequireProfile] ❌ Profile not found (404), redirecting to /customer');
             hasCheckedRef.current = true;
             navigate('/customer', { replace: true, state: { from: location } });
        } else {
            // Otro error - fail open para no bloquear
            console.error('[RequireProfile] Unexpected error, allowing access:', error);
            hasCheckedRef.current = true;
            setIsChecking(false);
        }
      }
    };

    checkProfile();
  }, [isInitialized, isAuthenticated, navigate, location]);

  if (!isInitialized || isChecking) {
    return <LoadingScreen message="Actualizando perfil..." />; 
  }

  return <Outlet />;
};

export default RequireProfile;
