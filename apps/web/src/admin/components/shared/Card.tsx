import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    title?: React.ReactNode;
    subtitle?: string;
    children: React.ReactNode;
    className?: string; // Explicitly kept for clarity
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', ...props }) => {
    return (
        <div className={`bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col min-w-0 break-words mb-6 transition-all hover:shadow-md ${className}`} {...props}>
            {(title || subtitle) && (
                <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
                    {title && <h4 className="m-0 text-gray-900 dark:text-white text-lg font-bold tracking-tight">{title}</h4>}
                    {subtitle && <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">{subtitle}</p>}
                </div>
            )}
            <div className={`p-6 flex-auto ${!title && !subtitle ? 'pt-6' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;
