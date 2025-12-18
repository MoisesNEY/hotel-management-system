import React from 'react';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Cargando...', 
  fullScreen = true 
}) => {
  return (
    <div className={`
      flex flex-col items-center justify-center 
      ${fullScreen ? 'fixed inset-0 z-[9999] bg-white dark:bg-[#050a1f]' : 'h-full w-full min-h-[200px] bg-transparent'}
      transition-colors duration-500
    `}>
      <div className="relative flex items-center justify-center">
        {/* Animated Outer Ring */}
        <div className="w-20 h-20 border-2 border-gold-default/10 rounded-full"></div>
        
        {/* Spinning Ring */}
        <div className="absolute w-20 h-20 border-2 border-transparent border-t-gold-default rounded-full animate-spin"></div>
        
        {/* Inner pulsing element */}
        <div className="absolute flex items-center justify-center">
          <div className="w-12 h-12 bg-gold-default/10 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-3 h-3 bg-gold-default rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)]"></div>
          </div>
        </div>
      </div>
      
      {message && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-gray-500 dark:text-gray-400">
            {message}
          </p>
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-gold-default to-transparent"></div>
        </div>
      )}
      
      {/* Decorative Brand Mark */}
      {fullScreen && (
        <div className="absolute bottom-12 flex flex-col items-center opacity-20 transition-opacity hover:opacity-100 duration-1000">
           <span className="text-[10px] font-black tracking-[0.5em] uppercase text-navy-default dark:text-white">
             Noir Hotel
           </span>
        </div>
      )}
    </div>
  );
};

export default LoadingScreen;
