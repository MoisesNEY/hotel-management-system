import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string; // Explicitly kept for clarity
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', ...props }) => {
    return (
        <div className={`bg-white rounded-[12px] shadow-[0_6px_10px_-4px_rgba(0,0,0,0.15)] mb-5 border-none relative flex flex-col min-w-0 break-words ${className}`} {...props}>
            {(title || subtitle) && (
                <div className="p-[15px_15px_0] bg-transparent border-b-0">
                    {title && <h4 className="mt-0 mb-0 text-[#333] text-[22px] font-normal">{title}</h4>}
                    {subtitle && <p className="text-[#9a9a9a] text-sm m-0 mt-[5px]">{subtitle}</p>}
                </div>
            )}
            <div className={`p-[15px_15px_10px_15px] flex-auto ${!title && !subtitle ? 'p-0' : ''}`}>
                {children}
            </div>
        </div>
    );
};

export default Card;
