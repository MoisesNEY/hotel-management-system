import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string; // Explicitly kept for clarity
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', ...props }) => {
    return (
        <div className={`bg-white rounded-xl shadow-md border border-gray-100 flex flex-col min-w-0 break-words mb-6 transition-all hover:shadow-lg ${className}`} {...props}>
            {(title || subtitle) && (
                <div className="px-6 py-4 border-b border-gray-100">
                    {title && <h4 className="m-0 text-gray-900 text-lg font-semibold">{title}</h4>}
                    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
                </div>
            )}
            <div className={`p-6 flex-auto ${!title && !subtitle ? 'pt-6' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;
