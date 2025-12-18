import React from 'react';

const Loader: React.FC = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-gold-default/20 border-t-gold-default rounded-full animate-spin"></div>
        </div>
    );
};

export default Loader;
