import React from 'react';

interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '' }) => {
    return (
        <div className={`bg-white rounded-lg p-6 ${className}`}>
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
