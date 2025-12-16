import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string; // Explicitly kept for clarity
}

const Card: React.FC<CardProps> = ({ title, subtitle, children, className = '', ...props }) => {
    return (
        <div className={`card ${className}`} {...props} style={{
            borderRadius: '12px',
            boxShadow: '0 6px 10px -4px rgba(0,0,0,0.15)',
            backgroundColor: '#fff',
            marginBottom: '20px',
            border: '0 none',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            wordWrap: 'break-word',
            ...props.style
        }}>
            {(title || subtitle) && (
                <div className="card-header" style={{ padding: '15px 15px 0', backgroundColor: 'transparent', borderBottom: '0 none' }}>
                    {title && <h4 className="card-title" style={{ margin: 0, color: '#333', marginTop: '0px', fontSize: '22px', fontWeight: 400 }}>{title}</h4>}
                    {subtitle && <p className="card-category" style={{ color: '#9a9a9a', fontSize: '14px', margin: 0, marginTop: '5px' }}>{subtitle}</p>}
                </div>
            )}
            <div className="card-body" style={{ padding: '15px 15px 10px 15px', flex: '1 1 auto' }}>
                {children}
            </div>
        </div>
    );
};

export default Card;
