import React from 'react';
import { Sparkles, TrendingUp, Code, Lightbulb, Globe, BookOpen } from 'lucide-react';

interface ExamplePrompt {
  icon: React.ReactNode;
  text: string;
}

interface NavigationButtonsProps {
  onButtonClick?: (text: string) => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ onButtonClick }) => {
  const examplePrompts: ExamplePrompt[] = [
    { 
      icon: <TrendingUp size={14} className="sm:w-4 sm:h-4" />, 
      text: '¿Cuáles son las últimas noticias sobre inteligencia artificial?' 
    },
    { 
      icon: <Code size={14} className="sm:w-4 sm:h-4" />, 
      text: 'Explícame qué es React y cómo crear un componente' 
    },
    { 
      icon: <Lightbulb size={14} className="sm:w-4 sm:h-4" />, 
      text: 'Dame ideas creativas para un proyecto de IA' 
    },
    { 
      icon: <Globe size={14} className="sm:w-4 sm:h-4" />, 
      text: '¿Qué está pasando en el mundo hoy?' 
    },
    { 
      icon: <BookOpen size={14} className="sm:w-4 sm:h-4" />, 
      text: 'Enséñame sobre física cuántica de forma simple' 
    },
    { 
      icon: <Sparkles size={14} className="sm:w-4 sm:h-4" />, 
      text: '¿Cómo puedo mejorar mi productividad diaria?' 
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Título de sección */}
      <div className="mb-3 sm:mb-4">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider text-center">
          Prompts de Ejemplo
        </h3>
      </div>
      
      {/* Grid de prompts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {examplePrompts.map((prompt, index) => (
          <button
            key={index}
            onClick={() => onButtonClick?.(prompt.text)}
            style={{
              animationDelay: `${index * 50}ms`
            }}
            className="group relative flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 text-xs sm:text-sm text-left
                       bg-gradient-to-br from-gray-800/60 to-gray-900/60
                       rounded-xl
                       border border-gray-700/40
                       shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)]
                       hover:shadow-[0_8px_20px_rgba(170,255,0,0.15),inset_0_1px_0_rgba(170,255,0,0.08)]
                       hover:border-[#AAFF00]/30
                       hover:-translate-y-0.5
                       active:translate-y-0
                       transition-all duration-300
                       animate-in fade-in slide-in-from-bottom-3
                       backdrop-blur-sm"
          >
            {/* 3D effect - top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-t-xl"></div>
            
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="p-1.5 sm:p-2 rounded-lg bg-[#AAFF00]/10 border border-[#AAFF00]/20 
                            group-hover:bg-[#AAFF00]/20 group-hover:border-[#AAFF00]/40 
                            transition-all duration-300">
                <span className="text-[#AAFF00] group-hover:scale-110 transition-transform duration-300 inline-block">
                  {prompt.icon}
                </span>
              </div>
            </div>
            
            {/* Text */}
            <span className="flex-1 text-gray-300 group-hover:text-gray-100 leading-relaxed transition-colors duration-300">
              {prompt.text}
            </span>
            
            {/* Hover indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#AAFF00] to-transparent 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-b-xl"></div>
          </button>
        ))}
      </div>
      
      {/* Hint text */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-600">
          Haz clic en cualquier ejemplo para comenzar o escribe tu propia pregunta
        </p>
      </div>
    </div>
  );
};

export default NavigationButtons;
