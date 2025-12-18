import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'light' | 'info' | 'warning' | 'error' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'round';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    isLoading?: boolean;
    block?: boolean;
    iconOnly?: boolean;
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    leftIcon,
    rightIcon,
    isLoading = false,
    block = false,
    iconOnly = false,
    disabled,
    ...props
}) => {
    // Base M3 classes: Flex center, transitions, pill or rounded shape, font medium
    let btnClass = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

    // Size mappings
    const sizeClasses = {
        sm: 'text-xs px-3 py-1.5 h-8',
        md: 'text-sm px-5 py-2.5 h-10', // Standard M3 height approx 40px
        lg: 'text-base px-6 py-3 h-12',
        round: 'text-sm p-3 rounded-full w-10 h-10', // Icon button circle
    };

    // Variant mappings to M3 Styles
    // Primary -> Filled
    // Secondary -> Tonal/Filled Tonal
    // Outline -> Outlined
    // Ghost/Link -> Text

    const variantClasses = {
        primary: 'bg-gold-default text-white shadow-sm hover:shadow-md hover:bg-gold-hover rounded-xl',
        secondary: 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl',
        outline: 'border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl',
        ghost: 'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl',

        danger: 'bg-rose-500 text-white shadow-sm hover:shadow-md hover:bg-rose-600 rounded-xl',
        success: 'bg-emerald-500 text-white shadow-sm hover:shadow-md hover:bg-emerald-600 rounded-xl',
        warning: 'bg-amber-500 text-white shadow-sm hover:shadow-md hover:bg-amber-600 rounded-xl',
        info: 'bg-cyan-500 text-white shadow-sm hover:shadow-md hover:bg-cyan-600 rounded-xl',
        light: 'bg-white dark:bg-white/10 text-gray-800 dark:text-white shadow-sm hover:shadow-md hover:bg-gray-50 dark:hover:bg-white/20 rounded-xl',

        error: 'bg-rose-500 text-white shadow-sm hover:shadow-md rounded-xl',
        link: 'bg-transparent text-gold-default hover:underline p-0 h-auto shadow-none',
    };

    // Apply specific "Icon Only" override if not explicitly 'round' size but 'iconOnly' prop is true
    if (iconOnly && size !== 'round') {
        btnClass += ' p-2 rounded-full aspect-square justify-center';
    } else {
        btnClass += ` ${sizeClasses[size] || sizeClasses.md}`;
    }

    // Apply Variant
    btnClass += ` ${variantClasses[variant] || variantClasses.primary}`;

    if (block) {
        btnClass += ' w-full flex';
    }

    if (className) {
        btnClass += ` ${className}`;
    }

    const iconContent = leftIcon || icon;

    return (
        <button
            className={btnClass}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}

            {!isLoading && iconContent && <span className={`${children ? 'mr-2' : ''} flex items-center justify-center`}>{iconContent}</span>}

            {children}

            {!isLoading && rightIcon && <span className={`${children ? 'ml-2' : ''} flex items-center justify-center`}>{rightIcon}</span>}
        </button>
    );
};

export default Button;
