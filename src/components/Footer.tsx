import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/95 to-transparent backdrop-blur-sm">
      <div className="flex items-center justify-center gap-2 px-6 py-5 text-sm text-gray-500">
        <span className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          By messaging Macrobat AI, you agree to our
        </span>
        <a 
          href="#" 
          className="text-gray-400 hover:text-white transition-all duration-300 underline underline-offset-2 hover:underline-offset-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100"
        >
          Terms
        </a>
        <span className="animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150">and</span>
        <a 
          href="#" 
          className="text-gray-400 hover:text-white transition-all duration-300 underline underline-offset-2 hover:underline-offset-4 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-200"
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
};

export default Footer;
