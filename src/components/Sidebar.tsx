import React from 'react';
import { MessageSquare, Plus, Settings, User, X, Trash2, Edit3, Clock } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  // Chats de ejemplo - Array vacío para usuario nuevo
  const chats: Array<{
    id: number;
    title: string;
    date: string;
    preview: string;
    unread: number;
  }> = [];

  return (
    <>
      {/* Overlay para móviles */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar - responsive */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 bg-gradient-to-b from-gray-950/98 via-black/98 to-black/98
                   backdrop-blur-xl
                   border-r border-gray-800/80
                   shadow-[4px_0_24px_rgba(0,0,0,0.5)]
                   z-50
                   transform transition-transform duration-300 ease-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                   flex flex-col`}
      >
        {/* Glow effect en el borde */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-green-500/20 via-green-500/5 to-transparent"></div>

        {/* Header del Sidebar - más compacto */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 
                          flex items-center justify-center
                          shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <h2 className="text-base font-bold bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Macrobat AI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-all duration-200
                     hover:rotate-90 active:scale-90"
            aria-label="Close sidebar"
          >
            <X size={18} className="text-gray-400 hover:text-white transition-colors" />
          </button>
        </div>

        {/* Botón Nuevo Chat - más moderno */}
        <div className="p-3">
          <button
            className="w-full group relative overflow-hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                     bg-gradient-to-r from-green-600 to-emerald-600
                     hover:from-green-500 hover:to-emerald-500
                     border border-green-500/30
                     shadow-[0_4px_16px_rgba(34,197,94,0.25),inset_0_1px_0_rgba(255,255,255,0.2)]
                     hover:shadow-[0_6px_20px_rgba(34,197,94,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]
                     hover:scale-[1.02]
                     active:scale-[0.98]
                     transition-all duration-300
                     text-white font-semibold text-sm"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                          translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            
            <Plus size={18} strokeWidth={2.5} className="relative" />
            <span className="relative">Nuevo Chat</span>
          </button>
        </div>

        {/* Lista de Chats - mejorada */}
        <div className="flex-1 overflow-y-auto px-2 py-1 
                      scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent
                      hover:scrollbar-thumb-gray-700">
          {chats.length > 0 ? (
            <div className="space-y-0.5">
              {chats.map((chat) => (
              <div
                key={chat.id}
                className="group relative"
              >
                <button
                  className="w-full text-left px-3 py-2.5 rounded-lg
                           hover:bg-gradient-to-r hover:from-green-500/10 hover:to-emerald-500/10
                           border border-transparent
                           hover:border-green-500/20
                           transition-all duration-200
                           relative"
                >
                  {/* Indicador de chat activo */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 bg-gradient-to-b from-green-400 to-emerald-500 
                                rounded-r-full group-hover:h-8 transition-all duration-300"></div>
                  
                  <div className="flex items-start gap-2.5 relative">
                    <div className="p-1.5 rounded-lg bg-gray-800/80 group-hover:bg-green-500/20 
                                  border border-gray-700/50 group-hover:border-green-500/30
                                  transition-all duration-300">
                      <MessageSquare size={14} className="text-gray-500 group-hover:text-green-400 transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-xs font-semibold text-gray-200 group-hover:text-white truncate transition-colors">
                          {chat.title}
                        </h3>
                        {chat.unread > 0 && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-green-500/20 border border-green-500/30
                                       text-[10px] font-bold text-green-400">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 group-hover:text-gray-400 truncate transition-colors">
                        {chat.preview}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={10} className="text-gray-600" />
                        <span className="text-[10px] text-gray-600">{chat.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción - aparecen en hover */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 
                                flex items-center gap-1 opacity-0 group-hover:opacity-100 
                                transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit chat', chat.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                      aria-label="Edit chat"
                    >
                      <Edit3 size={12} className="text-gray-500 hover:text-blue-400 transition-colors" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Delete chat', chat.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-red-500/20 transition-colors"
                      aria-label="Delete chat"
                    >
                      <Trash2 size={12} className="text-gray-500 hover:text-red-400 transition-colors" />
                    </button>
                  </div>
                </button>
              </div>
            ))}
            </div>
          ) : (
            // Mensaje cuando no hay chats
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20
                            border border-green-500/30 flex items-center justify-center mb-4">
                <MessageSquare size={32} className="text-green-400/60" />
              </div>
              <h3 className="text-sm font-semibold text-gray-300 mb-2">
                No hay conversaciones aún
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Inicia un nuevo chat para comenzar a hablar con Macrobat AI
              </p>
              <div className="w-12 h-1 rounded-full bg-gradient-to-r from-green-500/50 to-emerald-500/50"></div>
            </div>
          )}
        </div>

        {/* Footer con opciones - más moderno */}
        <div className="border-t border-gray-800/50 bg-black/40 backdrop-blur-sm">
          <div className="p-2 space-y-1">
            <button
              className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg
                       hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-cyan-500/10
                       border border-transparent hover:border-blue-500/20
                       transition-all duration-200
                       text-gray-400 hover:text-white text-sm"
            >
              <div className="p-1.5 rounded-lg bg-gray-800/80 group-hover:bg-blue-500/20 
                            border border-gray-700/50 group-hover:border-blue-500/30 transition-all">
                <User size={14} />
              </div>
              <span className="font-medium">Mi Perfil</span>
            </button>
            
            <button
              className="w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg
                       hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10
                       border border-transparent hover:border-purple-500/20
                       transition-all duration-200
                       text-gray-400 hover:text-white text-sm"
            >
              <div className="p-1.5 rounded-lg bg-gray-800/80 group-hover:bg-purple-500/20 
                            border border-gray-700/50 group-hover:border-purple-500/30 transition-all">
                <Settings size={14} />
              </div>
              <span className="font-medium">Configuración</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
