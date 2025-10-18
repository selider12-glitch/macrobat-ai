import React, { useState } from 'react';
import { Settings, Menu } from 'lucide-react';
import Sidebar from './Sidebar';

interface HeaderProps {
  onSidebarToggle: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onSidebarToggle }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    onSidebarToggle(newState);
  };

  const handleSignIn = () => {
    // Simulamos login
    setIsAuthenticated(true);
  };

  const handleSignUp = () => {
    // Simulamos registro
    setIsAuthenticated(true);
  };

  return (
    <>
      {isAuthenticated && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-800/50">
      {/* Subtle gradient line at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-700/30 to-transparent"></div>
      
      <div className="flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4">
        {/* Left side - Sidebar Toggle - Solo visible si está autenticado */}
        {isAuthenticated && (
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="group relative p-2 sm:p-3 rounded-xl 
                       bg-gradient-to-b from-gray-800/60 to-gray-900/60
                       border border-gray-700/40
                       shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                       hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
                       hover:border-gray-600/50
                       hover:-translate-y-0.5
                       active:translate-y-0
                       transition-all duration-300"
              aria-label="Toggle sidebar"
            >
              {/* 3D top highlight */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl"></div>
              
              <Menu size={22} className="relative text-gray-300 group-hover:text-white transition-colors" />
            </button>
          </div>
        )}

        {/* Spacer cuando no está autenticado */}
        {!isAuthenticated && <div></div>}

        {/* Right side - Settings and Auth buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button 
            className="group relative p-2 sm:p-3 rounded-xl 
                     bg-gradient-to-b from-gray-800/60 to-gray-900/60
                     border border-gray-700/40
                     shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                     hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
                     hover:border-gray-600/50
                     hover:-translate-y-0.5
                     active:translate-y-0
                     transition-all duration-300
                     hidden sm:block"
            aria-label="Search"
          >
            {/* 3D top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl"></div>
            
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="relative text-gray-300 group-hover:text-white transition-colors">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
          
          <button 
            className="group relative p-2 sm:p-3 rounded-xl 
                     bg-gradient-to-b from-gray-800/60 to-gray-900/60
                     border border-gray-700/40
                     shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                     hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
                     hover:border-gray-600/50
                     hover:-translate-y-0.5
                     active:translate-y-0
                     transition-all duration-300
                     hidden sm:block"
            aria-label="Settings"
          >
            {/* 3D top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl"></div>
            
            <Settings size={20} className="relative text-gray-300 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
          </button>

          <button 
            onClick={handleSignUp}
            className="relative px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-300
                           bg-gradient-to-b from-gray-800/60 to-gray-900/60
                           border-2 border-gray-700/40 rounded-xl
                           shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.05)]
                           hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
                           hover:border-gray-600/50
                           hover:-translate-y-0.5
                           hover:text-white
                           active:translate-y-0
                           transition-all duration-300">
            {/* 3D top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-xl"></div>
            
            <span className="relative">Sign up</span>
          </button>

          <button 
            onClick={handleSignIn}
            className="relative px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white
                           bg-gradient-to-b from-gray-700/90 to-gray-800/90
                           border border-gray-600/50 rounded-xl
                           shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                           hover:shadow-[0_8px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)]
                           hover:border-gray-500/60
                           hover:-translate-y-0.5
                           active:translate-y-0
                           transition-all duration-300">
            {/* 3D top highlight */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-xl"></div>
            
            <span className="relative">Sign in</span>
          </button>
        </div>
      </div>
    </header>
    </>
  );
};

export default Header;
