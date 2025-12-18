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
        <div className="bg-white rounded-[12px] shadow-[0_6px_10px_-4px_rgba(0,0,0,0.15)] mb-5 border-none p-[15px_15px_10px_15px] h-full flex flex-col justify-between">
            <div className="p-0 flex-auto">
                <div className="flex flex-row">
                    {/* Left Col: Icon */}
                    <div className="flex-none w-5/12 pr-[15px]">
                        <div className={`${iconColorClass} text-center leading-[59px] min-h-[64px]`}>
                            <Icon size={50} strokeWidth={1.5} className="inline-block" />
                        </div>
                    </div>
                    {/* Right Col: Numbers */}
                    <div className="flex-none w-7/12 pl-[15px]">
                        <div className="text-right">
                            <p className="text-[#9A9A9A] text-base leading-[1.4em] mb-0 capitalize">
                                {title}
                            </p>
                            <h3 className="text-[2em] font-normal m-0 text-[#252422]">
                                {value}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-transparent border-t border-[#ddd] p-0 pt-[10px] mt-[10px]">
                <div className="text-[#a49e93] text-xs flex items-center">
                    {FooterIcon && <FooterIcon size={14} className="mr-[5px]" />}
                    {footerText}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
