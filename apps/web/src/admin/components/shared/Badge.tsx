import React from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';

interface BadgeProps {
    variant?: BadgeVariant | string;
    children: React.ReactNode;
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children, className = '' }) => {

    const getBadgeStyles = (variant: string) => {
        const styles: Record<string, string> = {
            primary: 'bg-blue-100 text-blue-800',
            secondary: 'bg-gray-100 text-gray-800',
            success: 'bg-green-100 text-green-800',
            danger: 'bg-red-100 text-red-800',
            warning: 'bg-yellow-100 text-yellow-800',
            info: 'bg-cyan-100 text-cyan-800'
        };

        return styles[variant] || styles.primary;
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyles(variant)} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
