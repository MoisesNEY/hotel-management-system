import React, { useState } from 'react';
import { Settings, X, Check } from 'lucide-react';

interface ThemeSwitcherProps {
    onBgColorChange: (color: string) => void;
    onActiveColorChange: (color: string) => void;
    currentBgColor: string;
    currentActiveColor: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
    onBgColorChange,
    onActiveColorChange,
    currentBgColor,
    currentActiveColor
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const bgColors = [
        { name: 'black', label: 'Negro', class: 'bg-gradient-to-b from-gray-900 to-gray-800' },
        { name: 'white', label: 'Blanco', class: 'bg-white border border-gray-300' },
        { name: 'blue', label: 'Azul', class: 'bg-gradient-to-b from-blue-900 to-blue-800' },
        { name: 'green', label: 'Verde', class: 'bg-gradient-to-b from-green-900 to-green-800' }
    ];

    const activeColors = [
        { name: 'primary', label: 'Primario', class: 'bg-blue-500' },
        { name: 'info', label: 'Info', class: 'bg-cyan-500' },
        { name: 'success', label: 'Éxito', class: 'bg-green-500' },
        { name: 'warning', label: 'Advertencia', class: 'bg-orange-500' },
        { name: 'danger', label: 'Peligro', class: 'bg-red-500' }
    ];

    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    fixed bottom-6 right-6 z-50
                    w-12 h-12 rounded-full shadow-lg
                    bg-gradient-to-br from-blue-500 to-purple-600
                    flex items-center justify-center
                    text-white hover:shadow-xl
                    transition-all duration-300
                    ${isOpen ? 'rotate-180' : 'rotate-0'}
                `}
                aria-label="Theme Switcher"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6 animate-spin-slow" />}
            </button>

            {/* Theme Panel */}
            <div
                className={`
                    fixed bottom-24 right-6 z-50
                    w-80 bg-white rounded-lg shadow-2xl border border-gray-200
                    transition-all duration-300 transform
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4 pointer-events-none'}
                `}
            >
                <div className="p-6">
                    {/* Header */}
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Personalizar Tema
                    </h3>

                    {/* Sidebar Background Color */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Color de Fondo del Sidebar
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                            {bgColors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => onBgColorChange(color.name)}
                                    className={`
                                        relative w-full h-12 rounded-lg ${color.class}
                                        transition-all duration-200
                                        hover:scale-105 hover:shadow-md
                                    `}
                                    title={color.label}
                                >
                                    {currentBgColor === color.name && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Color */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            Color Activo
                        </h4>
                        <div className="grid grid-cols-5 gap-2">
                            {activeColors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => onActiveColorChange(color.name)}
                                    className={`
                                        relative w-full h-12 rounded-lg ${color.class}
                                        transition-all duration-200
                                        hover:scale-105 hover:shadow-md
                                    `}
                                    title={color.label}
                                >
                                    {currentActiveColor === color.name && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Check className="w-5 h-5 text-white drop-shadow-lg" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-xs text-blue-800">
                            💡 Los cambios se guardan automáticamente
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThemeSwitcher;
