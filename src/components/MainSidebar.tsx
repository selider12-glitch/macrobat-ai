import React, { useState } from 'react';
import { Search, MessageSquare, Mic, Image, FolderKanban, History, ChevronRight, ChevronLeft } from 'lucide-react';
import { useEffect } from 'react';
import { macrobatAPI } from '../services/api';
import type { ConversationMeta } from '../services/api';

interface MainSidebarProps {
  onNavigate: (item: string, conversationId?: string) => void;
  currentTitle?: string;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ onNavigate, currentTitle }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('Chat');
  const [conversations, setConversations] = useState<ConversationMeta[]>([]);

  useEffect(() => {
    // Cargar historial de conversaciones
    macrobatAPI.listConversations()
      .then(res => {
        setConversations(res.conversations || []);
      })
      .catch(err => {
        console.error('Error cargando conversaciones:', err);
      });
  }, []);

  const navigationItems = [
    { icon: Search, label: 'Search', shortcut: '⌘K' },
    { icon: MessageSquare, label: 'Chat' },
    { icon: Mic, label: 'Voice' },
    { icon: Image, label: 'Imagine' },
    { icon: FolderKanban, label: 'Projects' },
    { icon: History, label: 'History' },
  ];

  const handleItemClick = (label: string) => {
    setActiveItem(label);
    onNavigate(label);
  };

  const handleSelectConversation = (cid: string) => {
    onNavigate('select_conversation', cid);
  };

  const handleNewConversation = () => {
    onNavigate('new_conversation');
  };

  return (
    <aside className={`
      hidden md:flex md:fixed md:top-0 md:left-0 md:h-screen z-50
      bg-black/95 backdrop-blur-2xl
      border-r border-gray-900/50
      transition-all duration-500 ease-out
      ${isCollapsed ? 'w-20' : 'w-72'}
      md:flex-col
    `}>
      {/* Ambient light effect */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#AAFF00]/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="flex flex-col h-full relative z-10">
        {/* Logo - Ultra minimalista */}
        <div className="flex items-center justify-center py-6 px-4">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              {/* Logo 3D con efecto neomórfico */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-black/40 to-black/60 
                            flex items-center justify-center
                            shadow-[0_8px_32px_rgba(170,255,0,0.25),inset_0_2px_8px_rgba(255,255,255,0.05),inset_0_-2px_8px_rgba(0,0,0,0.3)]
                            before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-t before:from-transparent before:to-white/5
                            overflow-hidden">
                <img 
                  src="/logo.png" 
                  alt="Macrobat AI" 
                  className="w-8 h-8 object-contain relative z-10 drop-shadow-[0_0_8px_rgba(170,255,0,0.6)]"
                />
              </div>
              <div>
                <h1 className="font-black text-base tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Macrobat AI
                </h1>
                <div className="w-12 h-0.5 bg-gradient-to-r from-[#AAFF00] to-transparent rounded-full mt-0.5"></div>
              </div>
            </div>
          ) : (
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-black/40 to-black/60 
                          flex items-center justify-center
                          shadow-[0_8px_32px_rgba(170,255,0,0.25),inset_0_2px_8px_rgba(255,255,255,0.05),inset_0_-2px_8px_rgba(0,0,0,0.3)]
                          before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-t before:from-transparent before:to-white/5
                          overflow-hidden">
              <img 
                src="/logo.png" 
                alt="Macrobat AI" 
                className="w-8 h-8 object-contain relative z-10 drop-shadow-[0_0_8px_rgba(170,255,0,0.6)]"
              />
            </div>
          )}
        </div>

        {/* Navigation Items - Super minimalista con efectos 3D */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;
            
            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item.label)}
                className={`
                  group relative w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl
                  transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#AAFF00]/10 to-[#AAFF00]/5 shadow-[0_8px_24px_rgba(170,255,0,0.15),inset_0_1px_0_rgba(170,255,0,0.2)] border border-[#AAFF00]/20' 
                    : 'hover:bg-white/[0.02] border border-transparent hover:border-white/5'
                  }
                  ${isCollapsed ? 'justify-center px-0' : ''}
                `}
                title={isCollapsed ? item.label : undefined}
              >
                {/* Icono 3D con efecto neomórfico */}
                <div className={`
                  relative p-2 rounded-xl
                  transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-[#AAFF00] to-[#88dd00] shadow-[0_4px_16px_rgba(170,255,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_2px_rgba(0,0,0,0.2)]' 
                    : 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)] group-hover:from-gray-700/40 group-hover:to-gray-800/40'
                  }
                `}>
                  <Icon 
                    size={18} 
                    strokeWidth={2.5}
                    className={`
                      relative z-10 transition-all duration-300
                      ${isActive ? 'text-black' : 'text-gray-400 group-hover:text-gray-200'}
                    `} 
                  />
                </div>
                
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className={`
                      text-sm font-semibold transition-all duration-300
                      ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}
                    `}>
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <span className={`
                        text-xs px-2 py-0.5 rounded-lg
                        transition-all duration-300
                        ${isActive 
                          ? 'bg-[#AAFF00]/10 text-[#AAFF00] border border-[#AAFF00]/20' 
                          : 'bg-gray-800/40 text-gray-600 border border-gray-700/30 group-hover:border-gray-600/30'
                        }
                      `}>
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}

          {/* History Section */}
          {!isCollapsed && (
            <div className="pt-6 mt-4 space-y-1">
              <div className="px-4 mb-3">
                <div className="h-px bg-gradient-to-r from-transparent via-gray-800/50 to-transparent"></div>
              </div>
              
              {/* Mostrar título del chat actual si existe */}
              {currentTitle && (
                <button
                  onClick={() => handleItemClick('Current Chat')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                           text-sm font-medium text-[#AAFF00] bg-[#AAFF00]/5
                           hover:bg-[#AAFF00]/10 border border-[#AAFF00]/20
                           transition-all duration-200"
                >
                  <MessageSquare size={16} />
                  <span className="truncate">{currentTitle}</span>
                </button>
              )}
              
              <button
                onClick={handleNewConversation}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                         text-sm font-medium text-gray-600 hover:text-gray-300
                         hover:bg-white/[0.02] transition-all duration-200"
              >
                Nueva conversación
              </button>
              
              {/* Lista de conversaciones históricas */}
              <div className="mt-2 space-y-1 max-h-64 overflow-y-auto scrollbar-hide px-2">
                {conversations.length === 0 ? (
                  <div className="px-2 py-2 text-xs text-gray-600">No hay conversaciones aún</div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl
                               text-xs font-medium text-gray-400 hover:text-gray-200
                               hover:bg-white/[0.02] transition-all duration-200"
                      title={conv.title}
                    >
                      <MessageSquare size={14} />
                      <div className="flex-1 min-w-0 text-left">
                        <div className="truncate">{conv.title || 'Nueva conversación'}</div>
                        {conv.updated_at && (
                          <div className="text-[10px] text-gray-600 truncate">{new Date(conv.updated_at).toLocaleString()}</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl
                               text-xs font-medium text-gray-700 hover:text-gray-500
                               transition-all duration-200">
                Ver todo
              </button>
            </div>
          )}
        </nav>

        {/* Bottom Section - User Profile con efecto 3D */}
        <div className="p-3">
          <button className={`
            group relative w-full flex items-center gap-3 px-3 py-3 rounded-2xl
            bg-gradient-to-br from-gray-900/40 to-black/40
            border border-gray-800/50
            shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.03)]
            hover:border-gray-700/50
            hover:shadow-[0_6px_20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.05)]
            transition-all duration-300
            ${isCollapsed ? 'justify-center px-0' : ''}
          `}>
            {/* Avatar 3D con logo */}
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-black/60 to-black/80 
                          flex items-center justify-center flex-shrink-0
                          shadow-[0_4px_16px_rgba(170,255,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.05),inset_0_-1px_2px_rgba(0,0,0,0.3)]
                          before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-transparent before:to-white/5
                          overflow-hidden
                          border border-[#AAFF00]/20">
              <img 
                src="/logo.png" 
                alt="User" 
                className="w-6 h-6 object-contain relative z-10 drop-shadow-[0_0_6px_rgba(170,255,0,0.5)]"
              />
            </div>
            
            {!isCollapsed && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white">Francis</p>
                  <p className="text-xs text-gray-600 font-medium">Ver perfil</p>
                </div>
                
                <ChevronRight size={16} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
              </>
            )}
          </button>
        </div>

        {/* Collapse Toggle - Minimalista */}
        <div className="p-3 pt-0">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center py-2.5 rounded-xl
                     bg-gradient-to-br from-gray-900/40 to-black/40
                     border border-gray-800/50
                     shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)]
                     hover:border-gray-700/50
                     hover:shadow-[0_4px_12px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]
                     transition-all duration-300
                     group"
            title={isCollapsed ? 'Expandir' : 'Contraer'}
          >
            {isCollapsed ? (
              <ChevronRight size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            ) : (
              <ChevronLeft size={18} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default MainSidebar;
