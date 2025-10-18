import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 sm:gap-4 mb-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Avatar de la IA con animación de pulso */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#AAFF00] to-[#88dd00] 
                      flex items-center justify-center
                      shadow-[0_0_20px_rgba(170,255,0,0.4),0_0_40px_rgba(170,255,0,0.2)]
                      animate-pulse">
          <img 
            src="/logo.png" 
            alt="AI" 
            className="w-5 h-5 sm:w-6 sm:h-6 object-contain drop-shadow-[0_0_4px_rgba(0,0,0,0.8)]"
          />
        </div>
        
        {/* Anillos de pulso externos */}
        <div className="absolute inset-0 rounded-xl bg-[#AAFF00]/30 animate-ping"></div>
        <div className="absolute inset-0 rounded-xl bg-[#AAFF00]/20 animate-pulse" style={{ animationDelay: '150ms' }}></div>
      </div>

      {/* Contenedor del mensaje con efecto de escritura */}
      <div className="flex-1 min-w-0">
        <div className="inline-block px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl
                      bg-gradient-to-br from-gray-900/90 to-black/90
                      border border-[#AAFF00]/20
                      shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(170,255,0,0.1),inset_0_1px_0_rgba(170,255,0,0.1)]
                      backdrop-blur-xl">
          
          {/* Indicador de typing con 3 puntos animados */}
          <div className="flex items-center gap-1.5">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#AAFF00] animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
              <span className="w-2 h-2 rounded-full bg-[#AAFF00] animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
              <span className="w-2 h-2 rounded-full bg-[#AAFF00] animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
            </div>
            
            {/* Texto de estado */}
            <span className="ml-2 text-xs text-gray-500 font-medium animate-pulse">
              Thinking...
            </span>
          </div>

          {/* Barra de progreso animada */}
          <div className="mt-2 h-0.5 bg-gray-800/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#AAFF00] via-[#88dd00] to-[#AAFF00] 
                          animate-progress-bar rounded-full"></div>
          </div>
        </div>

        {/* Partículas flotantes alrededor del mensaje */}
        <div className="relative">
          <div className="absolute -top-2 left-4 w-1 h-1 rounded-full bg-[#AAFF00]/60 animate-float" style={{ animationDelay: '0ms' }}></div>
          <div className="absolute -top-3 left-12 w-1.5 h-1.5 rounded-full bg-[#AAFF00]/40 animate-float" style={{ animationDelay: '200ms' }}></div>
          <div className="absolute -top-1 left-20 w-1 h-1 rounded-full bg-[#AAFF00]/50 animate-float" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
