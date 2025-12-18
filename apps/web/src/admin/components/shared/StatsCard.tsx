import React from 'react';


interface StatsCardProps {
    type?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
    icon: React.ElementType;
    title: string;
    value: React.ReactNode;
    footerInitIcon?: React.ElementType;
    footerText?: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({
    type = 'primary',
    icon: Icon,
    title,
    value,
    footerInitIcon: FooterIcon,
    footerText
}) => {
    // Map colors to text colors
    const iconColorClass = {
        primary: 'text-paper-primary',
        success: 'text-paper-success',
        danger: 'text-paper-danger',
        warning: 'text-paper-warning',
        info: 'text-paper-info'
    }[type];

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 h-full flex flex-col justify-between transition-all hover:shadow-lg mb-6">
            <div className="p-0 flex-auto">
                <div className="flex flex-row items-center">
                    {/* Left Col: Icon */}
                    <div className="flex-none w-16 h-16 mr-4">
                        <div className={`${iconColorClass} bg-opacity-10 bg-current rounded-full w-full h-full flex items-center justify-center`}>
                            <Icon size={32} strokeWidth={2} />
                        </div>
                    </div>
                    {/* Right Col: Numbers */}
                    <div className="flex-1 text-right">
                        <p className="text-gray-500 text-sm font-medium mb-1 capitalize">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {value}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="text-gray-500 text-xs flex items-center font-medium">
                    {FooterIcon && <FooterIcon size={14} className="mr-2" />}
                    {footerText}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
