import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerClassName?: string;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerClassName = '',
    className = '',
    id,
    disabled,
    ...props
}) => {
    // Generate a unique ID if not provided, for the label
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`flex flex-col mb-4 ${containerClassName}`}>
            {label && (
                <label 
                    htmlFor={inputId} 
                    className="mb-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest ml-1"
                >
                    {label}
                </label>
            )}
            
            <div className="relative flex items-center">
                {leftIcon && (
                    <div className="absolute left-3 text-gray-400 pointer-events-none">
                        {leftIcon}
                    </div>
                )}
                
                <input
                    id={inputId}
                    disabled={disabled}
                    className={`
                        w-full 
                        px-4 py-2.5
                        bg-white dark:bg-white/5
                        border border-gray-300 dark:border-white/10
                        rounded-xl
                        text-gray-900 dark:text-white
                        shadow-sm 
                        placeholder-gray-400 dark:placeholder-gray-600
                        transition-all duration-200
                        focus:outline-none focus:ring-1 focus:ring-gold-default focus:border-gold-default
                        disabled:bg-gray-100 dark:disabled:bg-white/5 disabled:text-gray-500 disabled:cursor-not-allowed
                        ${error ? '!border-paper-danger focus:!ring-paper-danger' : ''}
                        ${leftIcon ? 'pl-10' : ''}
                        ${rightIcon ? 'pr-10' : ''}
                        ${className}
                    `}
                    {...props}
                />
                
                {rightIcon && (
                    <div className="absolute right-3 text-gray-400 pointer-events-none">
                        {rightIcon}
                    </div>
                )}
            </div>

            {(error || helperText) && (
                <div className="mt-1 text-xs">
                    {error ? (
                        <span className="text-paper-danger">{error}</span>
                    ) : (
                        <span className="text-gray-500">{helperText}</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default Input;
