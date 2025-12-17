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
        primary: 'text-[#51cbce]',
        success: 'text-[#6bd098]',
        danger: 'text-[#ef8157]',
        warning: 'text-[#fbc658]',
        info: 'text-[#51bcda]'
    }[type];

    return (
        <div style={{
            borderRadius: '12px',
            boxShadow: '0 6px 10px -4px rgba(0, 0, 0, 0.15)',
            backgroundColor: '#FFFFFF',
            marginBottom: '20px',
            border: '0 none',
            padding: '15px 15px 10px 15px',
            height: '100%'
        }}>
            <div className="card-body" style={{ padding: '0' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {/* Left Col: Icon */}
                    <div style={{ flex: '0 0 41.666667%', maxWidth: '41.666667%', paddingRight: '15px' }}>
                        <div style={{
                            fontSize: '3em',
                            minHeight: '64px',
                            lineHeight: '59px',
                            textAlign: 'center'
                        }} className={iconColorClass}>
                            <Icon size={50} strokeWidth={1.5} />
                        </div>
                    </div>
                    {/* Right Col: Numbers */}
                    <div style={{ flex: '0 0 58.333333%', maxWidth: '58.333333%', paddingLeft: '15px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{
                                color: '#9A9A9A',
                                fontSize: '16px',
                                lineHeight: '1.4em',
                                marginBottom: 0,
                                textTransform: 'capitalize'
                            }}>
                                {title}
                            </p>
                            <h3 style={{
                                fontSize: '2em', /* ~28px-30px */
                                fontWeight: 400,
                                margin: 0,
                                color: '#252422'
                            }}>
                                {value}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card-footer" style={{
                backgroundColor: 'transparent',
                borderTop: '1px solid #ddd',
                padding: '0',
                paddingTop: '10px',
                marginTop: '10px'
            }}>
                <div style={{ color: '#a49e93', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                    {FooterIcon && <FooterIcon size={14} style={{ marginRight: '5px' }} />}
                    {footerText}
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
