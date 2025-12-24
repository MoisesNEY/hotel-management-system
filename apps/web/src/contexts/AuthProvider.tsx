import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import keycloak from '../services/keycloak';
import type { KeycloakProfile } from 'keycloak-js';

// Definición de Roles
export type UserRole = 'ROLE_ADMIN' | 'ROLE_EMPLOYEE' | 'ROLE_CLIENT';

// Jerarquía de roles (cada rol incluye a los de abajo)
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'ROLE_ADMIN': 3,
  'ROLE_EMPLOYEE': 2,
  'ROLE_CLIENT': 1
};

interface AuthContextType {
  isAuthenticated: boolean;
  isInitialized: boolean;
  token?: string;
  userProfile?: KeycloakProfile;
  roles: string[];
  login: () => void;
  logout: () => void;
  accountManagement: () => void;
  hasRole: (role: UserRole) => boolean;
  getHighestRole: () => UserRole | null;
  hasProfile: boolean | null;
  checkProfileStatus: () => Promise<void>;
  updateUserProfile: (profile: Partial<KeycloakProfile>) => void;
  reloadProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState<KeycloakProfile | undefined>(undefined);
  const [roles, setRoles] = useState<string[]>([]);
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  const initLock = React.useRef(false);

  useEffect(() => {
    if (isInitialized || initLock.current) return;
    initLock.current = true;

    const initKeycloak = async () => {
      try {
        console.log('[AuthProvider] Initializing Keycloak...');
        // Check if already initialized (shouldn't happen with lock but good for HMR)
        if (keycloak.didInitialize) {
          console.log('[AuthProvider] Keycloak already initialized');
          // Just update state
          setIsAuthenticated(keycloak.authenticated || false);
          if (keycloak.authenticated) {
            await loadUserData();
          }
          setIsInitialized(true);
          return;
        }

        const authenticated = await keycloak.init({
          onLoad: 'check-sso', // We use check-sso to silently check, if we are in a protected route RoleGuard will force login
          silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          checkLoginIframe: false,
          pkceMethod: 'S256'
        });

        console.log('[AuthProvider] Keycloak init result:', authenticated);
        setIsAuthenticated(authenticated);

        if (authenticated) {
          await loadUserData();
        }
      } catch (error) {
        console.error('[AuthProvider] Failed to initialize Keycloak', error);
      } finally {
        setIsInitialized(true);
      }
    };

    const loadUserData = async () => {
      try {
        const profile = await keycloak.loadUserProfile();
        setUserProfile(profile);

        if (keycloak.realmAccess?.roles) {
          console.log('[AuthProvider] Realm Roles:', keycloak.realmAccess.roles);
          console.table(keycloak.realmAccess.roles.map(r => ({ Role: r })));
          setRoles(keycloak.realmAccess.roles);
        } else if (keycloak.resourceAccess?.['hotel-app']?.roles) {
          const resRoles = keycloak.resourceAccess['hotel-app'].roles;
          console.log('[AuthProvider] Resource Roles (hotel-app):', resRoles);
          console.table(resRoles.map(r => ({ Role: r })));
          setRoles(resRoles);
        }

        // Sync with backend
        try {
          const { getAccount } = await import('../services/accountService');
          await getAccount();
          console.log('[AuthProvider] User synced with backend');
        } catch (syncError) {
          console.error('[AuthProvider] Failed to sync user with backend', syncError);
        }

        checkProfileStatus();
      } catch (error) {
        console.error('[AuthProvider] Failed to load user profile or data', error);
      }
    };

    initKeycloak();
  }, [isInitialized]);

  const login = () => keycloak.login();
  const logout = () => keycloak.logout();
  const accountManagement = () => keycloak.accountManagement();

  /**
   * Verifica el estado del perfil del cliente en el backend
   */
  const checkProfileStatus = async () => {
    // 1. Verificar si decidió saltar
    const skipped = sessionStorage.getItem('skip_customer_details') === 'true';
    if (skipped) {
      setHasProfile(true); // Asumimos true para no molestar
      return;
    }

    // 2. Verificar localStorage (cache rápido)
    const localCompleted = localStorage.getItem('hasCompletedExtraInfo') === 'true';
    if (localCompleted) {
      setHasProfile(true);
      // Podríamos revalidar en background aquí si quisiéramos
    }

    // 3. Verificar backend (Solo si no está confirmado localmente o para confirmar)
    try {
      // Import dinámico para evitar ciclos si customerDetailsService importa auth
      const { getMyProfile } = await import('../services/client/customerService');
      await getMyProfile();

      // Si tiene perfil (200 OK)
      setHasProfile(true);
      localStorage.setItem('hasCompletedExtraInfo', 'true');
    } catch (error: any) {
      // Si es 404, de verdad no tiene perfil
      if (error.response && error.response.status === 404) {
        setHasProfile(false);
        // Importante: Eliminar flag falso si existe
        localStorage.removeItem('hasCompletedExtraInfo');
      }
      // Si es otro error (network), mantenemos el estado local si existía (null -> null, true -> true)
    }
  };

  /**
   * Verifica si el usuario tiene el rol especificado o uno superior en jerarquía
   */
  const hasRole = (requiredRole: UserRole): boolean => {
    if (!roles.length) return false;

    // Verificar coincidencia exacta o jerárquica
    const userHighestRole = getHighestRole();
    if (!userHighestRole) return false;

    return ROLE_HIERARCHY[userHighestRole] >= ROLE_HIERARCHY[requiredRole];
  };

  /**
   * Obtiene el rol más alto del usuario actual
   */
  const getHighestRole = (): UserRole | null => {
    if (roles.includes('ROLE_ADMIN') || roles.includes('ROL_ADMIN')) return 'ROLE_ADMIN';
    if (roles.includes('ROLE_EMPLOYEE') || roles.includes('ROL_EMPLEADO')) return 'ROLE_EMPLOYEE';
    if (roles.includes('ROLE_CLIENT') || roles.includes('ROL_CLIENTE')) return 'ROLE_CLIENT';
    return null;
  };

  const updateUserProfile = (profileUpdate: Partial<KeycloakProfile>) => {
    setUserProfile(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        ...profileUpdate,
        attributes: {
          ...prev.attributes,
          ...profileUpdate.attributes
        }
      };
    });
  };

  /**
   * Recarga el perfil desde el servidor de Keycloak y fuerza la actualización del token
   * para obtener los nuevos claims (JWT)
   */
  const reloadProfile = async () => {
    try {
      console.log('[AuthProvider] Reloading profile and token...');

      // 1. Recargar perfil básico
      const profile = await keycloak.loadUserProfile();
      setUserProfile(profile);

      // 2. Forzar actualización de token (claims)
      // Usamos un valor muy alto para forzar el refresh
      await keycloak.updateToken(-1);
      setIsAuthenticated(true);

      console.log('[AuthProvider] Profile and token reloaded successfully');
    } catch (error) {
      console.error('[AuthProvider] Failed to reload profile', error);
      // Si falla el token refresh, al menos tenemos el loadUserProfile
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isInitialized,
        token: keycloak.token,
        userProfile,
        roles,
        hasProfile,
        checkProfileStatus,
        login,
        logout,
        accountManagement,
        hasRole,
        getHighestRole,
        updateUserProfile,
        reloadProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
