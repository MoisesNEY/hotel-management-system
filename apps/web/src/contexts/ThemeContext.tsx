import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, userProfile, isInitialized } = useAuth();

  const [theme, setThemeState] = useState<Theme>(() => {
    // Si no está inicializado aún, usar light por defecto
    if (!isInitialized) {
      return 'light';
    }

    // Si no está autenticado, usar light
    if (!isAuthenticated || !userProfile?.id) {
      return 'light';
    }

    // Intentar cargar desde localStorage usando el ID del usuario
    const userThemeKey = `app-theme-${userProfile.id}`;
    const savedTheme = localStorage.getItem(userThemeKey) as Theme | null;
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // Si no hay preferencia guardada para este usuario, usar light por defecto
    return 'light';
  });

  // Función para obtener la clave de localStorage del usuario actual
  const getUserThemeKey = () => {
    return userProfile?.id ? `app-theme-${userProfile.id}` : 'app-theme-guest';
  };

  // Aplicar el tema al documento cuando cambie
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }

    // Solo guardar si hay un usuario autenticado
    if (isAuthenticated && userProfile?.id) {
      localStorage.setItem(getUserThemeKey(), theme);
    }
  }, [theme, isAuthenticated, userProfile?.id]);

  // Efecto para manejar cambios de autenticación
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated) {
      // Usuario no autenticado - resetear a light
      setThemeState('light');
      const root = document.documentElement;
      root.setAttribute('data-theme', 'light');
    } else if (userProfile?.id) {
      // Usuario autenticado - cargar su configuración
      const userThemeKey = `app-theme-${userProfile.id}`;
      const savedTheme = localStorage.getItem(userThemeKey) as Theme | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      } else {
        // Nuevo usuario - usar light por defecto
        setThemeState('light');
      }
    }
  }, [isAuthenticated, userProfile?.id, isInitialized]);

  const toggleTheme = () => {
    setThemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
