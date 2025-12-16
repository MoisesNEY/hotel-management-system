import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'light' | 'info' | 'warning' | 'error';
type ButtonSize = 'sm' | 'md' | 'lg' | 'round';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: React.ReactNode;
    leftIcon?: React.ReactNode; // Alias for icon or explicit left position
    isLoading?: boolean;
    block?: boolean; // Full width
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    icon,
    leftIcon,
    isLoading = false,
    block = false,
    children,
    className = '',
    disabled,
    ...props
}) => {

    // Use exact Paper Dashboard classes or inline styles where possible
    const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed border-box box-border';

    // Paper Dashboard specific overrides
    const variants = {
        primary: 'bg-[#51cbce] text-white hover:bg-[#4bc2c5] hover:shadow-md border border-[#51cbce]', /* $primary-color */
        secondary: 'bg-[#66615B] text-white hover:bg-[#403D39] hover:shadow-md border border-[#66615B]', /* $default-color */
        info: 'bg-[#51bcda] text-white hover:bg-[#4ab4d1] hover:shadow-md border border-[#51bcda]',
        success: 'bg-[#6bd098] text-white hover:bg-[#63c38e] hover:shadow-md border border-[#6bd098]',
        warning: 'bg-[#fbc658] text-white hover:bg-[#fab52d] hover:shadow-md border border-[#fbc658]',
        danger: 'bg-[#ef8157] text-white hover:bg-[#eb7446] hover:shadow-md border border-[#ef8157]',
        error: 'bg-[#ef8157] text-white hover:bg-[#eb7446] hover:shadow-md border border-[#ef8157]', /* Error alias for danger */
        outline: 'bg-transparent text-[#66615B] border-[2px] border-[#66615B] hover:bg-[#66615B] hover:text-white',
        ghost: 'bg-transparent text-[#66615B] hover:text-[#403D39] shadow-none hover:shadow-none border-none',
        light: 'bg-white text-[#66615B] border border-[#ccc5b9] hover:bg-gray-50'
    };

    const sizes = {
        sm: 'px-[15px] py-[5px] text-[12px] rounded-[3px]', /* btn-sm */
        md: 'px-[22px] py-[11px] text-[14px] rounded-[4px]', /* Default btn padding */
        lg: 'px-[48px] py-[15px] text-[16px] rounded-[6px]', /* btn-lg */
        round: 'px-[23px] py-[11px] text-[14px] rounded-[30px]' /* Special round variant found in template */
    };

    // If user passed a specific 'round' prop or we want to support it via size? 
    // For now we map standard sizes to Paper Dashboard standard button size.
    // Use `className` prop to pass `rounded-full` if needed, or we can add a `shape` prop later.

    const widthClass = block ? 'w-full' : '';
    const iconContent = leftIcon || icon;

    // Check if variant exists or fallback to primary
    const variantClass = variants[variant as keyof typeof variants] || variants.primary;

    return (
        <button
            className={`
                ${baseStyles}
                ${variantClass}
                ${sizes[size] || sizes.md}
                ${widthClass}
                uppercase tracking-wide
                ${className}
            `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            {!isLoading && iconContent && <span className="mr-2">{iconContent}</span>}
            {children}
        </button>
    );
};

export default Button;
