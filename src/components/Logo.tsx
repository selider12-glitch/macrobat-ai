import React from 'react';

const Logo: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-4 duration-1000 mb-4 sm:mb-8">
      <div className="group relative">
        <img 
          src="/logo.png" 
          alt="Macrobat AI" 
          className="w-12 h-12 sm:w-16 sm:h-16 object-contain transition-all duration-500 ease-out 
                     group-hover:scale-110 group-hover:rotate-3
                     drop-shadow-[0_0_20px_rgba(170,255,0,0.3)]
                     group-hover:drop-shadow-[0_0_35px_rgba(170,255,0,0.5)]"
        />
        <div className="absolute inset-0 bg-[#AAFF00]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <h1 className="mt-3 sm:mt-4 text-xl sm:text-2xl font-bold tracking-wider
                     bg-gradient-to-r from-[#AAFF00] via-[#88dd00] to-[#AAFF00]
                     bg-clip-text text-transparent
                     drop-shadow-[0_0_10px_rgba(170,255,0,0.4)]
                     hover:scale-105 transition-transform duration-300
                     cursor-default select-none">
        Macrobat AI
      </h1>
      
      <div className="h-1 w-24 mt-2 rounded-full
                      bg-gradient-to-r from-transparent via-[#AAFF00] to-transparent
                      opacity-50" />
    </div>
  );
};

export default Logo;
