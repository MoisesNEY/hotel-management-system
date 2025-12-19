import React from 'react';


interface StatsCardProps {
    type?: 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'purple';
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
        primary: 'text-blue-500',
        success: 'text-emerald-500',
        danger: 'text-rose-500',
        warning: 'text-amber-500',
        info: 'text-cyan-500',
        purple: 'text-purple-500'
    }[type];

    return (
        <div className="bg-white dark:bg-[#1c1c1c] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-6 h-full flex flex-col justify-between transition-all hover:shadow-md mb-6">
            <div className="p-0 flex-auto">
                <div className="flex flex-row items-center">
                    {/* Left Col: Icon */}
                    <div className="flex-none w-14 h-14 mr-4">
                        <div className={`${iconColorClass} bg-current bg-opacity-10 dark:bg-opacity-20 rounded-xl w-full h-full flex items-center justify-center`}>
                            <Icon size={28} strokeWidth={2} />
                        </div>
                    </div>
                    {/* Right Col: Numbers */}
                    <div className="flex-1 text-right">
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                            {title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {value}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-100 dark:border-white/5 pt-4 mt-5">
                <div className="text-gray-400 dark:text-gray-500 text-[10px] flex items-center font-bold uppercase tracking-widest">
                    {FooterIcon && <FooterIcon size={12} className="mr-2" />}
                    {footerText}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
