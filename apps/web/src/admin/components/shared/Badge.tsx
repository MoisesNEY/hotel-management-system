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
            primary: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
            secondary: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
            success: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
            danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
            warning: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
            info: 'bg-sky-500/10 text-sky-500 border border-sky-500/20'
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
