import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface NotificationProps {
  message: string;
  type?: 'success' | 'info' | 'warning';
  onClose: () => void;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type = 'info', 
  onClose,
  duration = 2500 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-400" />,
    info: <Zap size={18} className="text-green-400" />,
    warning: <AlertCircle size={18} className="text-orange-400" />,
  };

  const colors = {
    success: 'bg-gray-800/90 border-green-400/40',
    info: 'bg-gray-800/90 border-green-400/40',
    warning: 'bg-gray-800/90 border-orange-400/40',
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50
      max-w-sm w-auto
      ${colors[type]}
      backdrop-blur-sm
      border rounded-lg
      px-3 py-2
      shadow-lg
      animate-in fade-in slide-in-from-top-2 duration-300
    `}>
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-black/20">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-white text-sm leading-snug">
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X size={16} className="text-white/80" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
