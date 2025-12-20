import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from './AuthProvider';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'hotel-app-theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, userProfile, isInitialized } = useAuth();
  
  // Initialize from local storage immediately to avoid flicker
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Effect to apply class to documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Effect to sync with user profile when logged in (optional but good)
  useEffect(() => {
    if (isInitialized && isAuthenticated && userProfile?.id) {
      const userKey = `app-theme-${userProfile.id}`;
      const userSaved = localStorage.getItem(userKey) as Theme | null;
      if (userSaved && userSaved !== theme) {
        setThemeState(userSaved);
      }
    }
  }, [isInitialized, isAuthenticated, userProfile?.id]);

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      // Also save to user specific key if logged in
      if (isAuthenticated && userProfile?.id) {
        localStorage.setItem(`app-theme-${userProfile.id}`, next);
      }
      return next;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (isAuthenticated && userProfile?.id) {
      localStorage.setItem(`app-theme-${userProfile.id}`, newTheme);
    }
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

