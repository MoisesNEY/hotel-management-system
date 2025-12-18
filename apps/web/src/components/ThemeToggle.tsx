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
        className={`p-2 rounded-lg transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 ${className}`}
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
        className={`group flex items-center gap-3 w-full p-3 px-4 rounded-xl text-gray-700 dark:text-gray-200 text-sm font-medium transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/5 hover:translate-x-1 ${className}`}
        onClick={toggleTheme}
      >
        <div className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 group-hover:bg-gold-default/10 group-hover:text-gold-default transition-colors">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </div>
        <span>{theme === 'light' ? 'Activar Modo Oscuro' : 'Activar Modo Claro'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${className}`}
      aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
    >
      {theme === 'light' ? (
        <>
          <Moon size={18} />
          <span>Activar Modo Oscuro</span>
        </>
      ) : (
        <>
          <Sun size={18} />
          <span>Activar Modo Claro</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
