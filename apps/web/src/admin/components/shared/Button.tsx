import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'light' | 'info' | 'warning' | 'error' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'round';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode; // Alias for icon or explicit left position
    isLoading?: boolean;
    block?: boolean; // Full width
    children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    icon,
    leftIcon,
    isLoading = false,
    block = false,
    disabled,
    ...props
}) => {
    // Determine CSS classes based on props
    let btnClass = 'btn';

    // Variant classes (map to .btn-primary, .btn-danger etc defined in css)
    if (variant && variant !== 'ghost') {
        btnClass += ` btn-${variant}`;
    } else if (variant === 'ghost') {
        btnClass += ' btn-neutral'; // closest match or custom
    }

    // Size classes
    if (size === 'sm') {
        btnClass += ' btn-sm';
    } else if (size === 'lg') {
        btnClass += ' btn-lg';
    }

    // Shape
    // Paper Dashboard buttons are 'round' (pill) by default for main actions in our design, 
    // or explicit 'btn-round' class. 
    // User requested "estilo pill (rounded-30px)".
    if (size !== 'round') { // 'round' size usually implies icon button, handle separately or here
        btnClass += ' btn-round';
    } else {
        // Icon button case
        btnClass += ' btn-round btn-icon';
        // Add specific style for icon button size if needed, usually handles padding
    }

    if (block) {
        btnClass += ' w-full';
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

            {!isLoading && iconContent && <span className={`${children ? 'mr-2' : ''} flex items-center`}>{iconContent}</span>}

            {children}
        </button>
    );
};

export default Button;
