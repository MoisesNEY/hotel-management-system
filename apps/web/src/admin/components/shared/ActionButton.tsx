import React, { type ElementType } from 'react';

interface ActionButtonProps {
    onClick: () => void;
    icon: ElementType;
    label?: string;
    variant?: 'primary' | 'ghost';
    className?: string; // Additional classes (e.g. colors)
    title?: string; // Tooltip text
}

const ActionButton: React.FC<ActionButtonProps> = ({ 
    onClick, 
    icon: Icon, 
    label, 
    variant = 'primary', 
    className = '',
    title
}) => {
    const baseStyles = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";
    const variants = {
        primary: "bg-[#d4af37] text-white hover:bg-[#b8962d]",
        ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-400"
    };

    return (
        <button 
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            title={title || label}
        >
            <Icon className="w-4 h-4" />
            {label && <span>{label}</span>}
        </button>
    );
};

export default ActionButton;
