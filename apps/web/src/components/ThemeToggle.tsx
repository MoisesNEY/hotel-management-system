import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeToggleProps {
  variant?: 'button' | 'icon' | 'dropdown';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'button', className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`theme-toggle-icon ${className}`}
        aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <button
        className={`dropdown-item theme-toggle-dropdown ${className}`}
        onClick={toggleTheme}
        aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      >
        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        <span>{theme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-button ${className}`}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      <div className="theme-toggle-content">
        {theme === 'light' ? (
          <>
            <Moon size={18} />
            <span>Modo Oscuro</span>
          </>
        ) : (
          <>
            <Sun size={18} />
            <span>Modo Claro</span>
          </>
        )}
      </div>
    </button>
  );
};

export default ThemeToggle;
