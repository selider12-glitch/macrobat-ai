import React, { useState, useEffect, useRef } from 'react';
import MainSidebar from './components/MainSidebar';
import Logo from './components/Logo';
import SearchBar from './components/SearchBar';
import NavigationButtons from './components/NavigationButtons';
import Footer from './components/Footer';
import ChatMessages from './components/ChatMessages';
import Notification from './components/Notification';
import { macrobatAPI } from './services/api';
import type { ConversationMeta } from './services/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  images?: string[]; // Array of base64 image data URLs
  files?: Array<{ name: string; type: string; data: string; size: number }>;
}

const App: React.FC = () => {
  const [selectedMode] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentTitle, setCurrentTitle] = useState<string>('');
  const [conversationId, setConversationId] = useState<string>('');
  const [chatStarted, setChatStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeView, setActiveView] = useState<'chat' | 'history'>('chat');
  const [historyConversations, setHistoryConversations] = useState<ConversationMeta[]>([]);
  const [examplePrompt, setExamplePrompt] = useState<string>('');

  const handleButtonClick = (text: string) => {
    // Establecer el prompt de ejemplo que se enviará al SearchBar
    setExamplePrompt(text);
    // Limpiar después para permitir múltiples clicks
    setTimeout(() => setExamplePrompt(''), 200);
  };

  const handleNavigate = async (item: string, cid?: string) => {
    try {
      if (item === 'new_conversation') {
        // Reiniciar estado para empezar un chat nuevo
        setMessages([]);
        setCurrentTitle('');
        setConversationId('');
        setChatStarted(false);
        setActiveView('chat');
        return;
      }
      if (item === 'History') {
        setActiveView('history');
        // Cargar historial completo
        const res = await macrobatAPI.listConversations();
        setHistoryConversations(res.conversations || []);
        return;
      }
      if (item === 'Chat' || item === 'Current Chat') {
        setActiveView('chat');
        return;
      }
      if (item === 'select_conversation' && cid) {
        // Cargar conversación existente
        const result = await macrobatAPI.getConversation(cid);
        const msgs = Array.isArray(result?.messages) ? result.messages : [];
        setMessages(msgs);
        setConversationId(result?.conversation_id || cid);
        setCurrentTitle(result?.title || '');
        setChatStarted(true);
        setActiveView('chat');
        // Hacer scroll al final
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return;
      }
      // Navegaciones genéricas
      console.log('Navegando a:', item);
    } catch (e) {
      console.error('Error navegando:', e);
    }
  };

  // Auto-scroll cuando hay nuevos mensajes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNewMessage = (
    userMessage: string, 
    aiResponse: string, 
    title?: string, 
    convId?: string,
    images?: string[],
    files?: Array<{ name: string; type: string; data: string; size: number }>
  ) => {
    // Buscar si ya existe un mensaje del usuario pendiente
    setMessages(prev => {
      const lastMessage = prev[prev.length - 1];
      const secondLastMessage = prev[prev.length - 2];
      
      // Si el último mensaje es del asistente y el penúltimo es del usuario con el mismo contenido
      // entonces estamos actualizando la respuesta del streaming
      if (
        lastMessage?.role === 'assistant' &&
        secondLastMessage?.role === 'user' &&
        secondLastMessage.content === userMessage
      ) {
        // Actualizar solo la respuesta del asistente
        return [
          ...prev.slice(0, -1),
          {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString(),
          }
        ];
      }
      
      // Si el último mensaje es del usuario con el mismo contenido, agregar la respuesta
      if (lastMessage?.role === 'user' && lastMessage.content === userMessage) {
        return [
          ...prev,
          {
            role: 'assistant',
            content: aiResponse,
            timestamp: new Date().toISOString(),
          }
        ];
      }
      
      // De lo contrario, es un mensaje nuevo, agregar ambos
      return [
        ...prev,
        {
          role: 'user',
          content: userMessage,
          timestamp: new Date().toISOString(),
          images: images,
          files: files,
        },
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
        }
      ];
    });
    
    if (title) {
      setCurrentTitle(title);
    }
    if (convId) {
      setConversationId(convId);
    }
    if (!chatStarted) {
      setChatStarted(true);
    }
  };

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  useEffect(() => {
    // Restaurar desde localStorage
    try {
      const storedMessages = localStorage.getItem('macrobat_messages');
      const storedTitle = localStorage.getItem('macrobat_currentTitle');
      const storedConvId = localStorage.getItem('macrobat_conversationId');
      const storedChatStarted = localStorage.getItem('macrobat_chatStarted');

      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          if (parsed.length > 0) {
            setChatStarted(true);
          }
        }
      }
      if (storedTitle) setCurrentTitle(storedTitle);
      if (storedConvId) setConversationId(storedConvId);
      if (storedChatStarted) setChatStarted(storedChatStarted === 'true');
    } catch (e) {
      console.error('Error restaurando datos del chat:', e);
    }

    // Chequeo de salud del backend (solo notificar si hay error)
    macrobatAPI.healthCheck()
      .catch(() => {
        setNotification({ message: 'Backend no disponible. Inícialo en http://localhost:8000', type: 'warning' });
      });
  }, []);

  useEffect(() => {
    // Guardar en localStorage
    try {
      localStorage.setItem('macrobat_messages', JSON.stringify(messages));
      localStorage.setItem('macrobat_currentTitle', currentTitle || '');
      localStorage.setItem('macrobat_conversationId', conversationId || '');
      localStorage.setItem('macrobat_chatStarted', chatStarted ? 'true' : 'false');
    } catch (e) {
      console.error('Error guardando datos del chat:', e);
    }
  }, [messages, currentTitle, conversationId, chatStarted]);

  const handleError = (message: string, type: 'success' | 'info' | 'warning' = 'warning') => {
    setNotification({ message, type });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white flex relative overflow-hidden">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          duration={3000}
        />
      )}
      {/* Subtle dark background effects - Minimalista */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(170,255,0,0.02),transparent_50%)]"></div>
        
        {/* Very subtle ambient light - top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#AAFF00]/[0.02] rounded-full blur-3xl"></div>
        
        {/* Very subtle ambient light - bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#AAFF00]/[0.01] rounded-full blur-3xl"></div>
      </div>

      {/* Main Sidebar */}
      <MainSidebar onNavigate={handleNavigate} currentTitle={currentTitle} />

      {/* Main Content - se ajusta automáticamente con el sidebar */}
      <main className="flex-1 flex flex-col relative z-10 transition-all duration-500 ease-out md:ml-72 ml-0 min-h-screen">
        {activeView === 'history' ? (
          // Página de Historial
          <div className="flex-1 flex flex-col px-4 sm:px-6 py-8">
            <div className="w-full max-w-4xl mx-auto">
              <h2 className="text-xl font-bold mb-4">Historial de conversaciones</h2>
              <div className="space-y-2">
                {historyConversations.length === 0 ? (
                  <div className="text-sm text-gray-500">No hay conversaciones aún.</div>
                ) : (
                  historyConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleNavigate('select_conversation', conv.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-gray-800/50 hover:border-gray-700/50 transition"
                      title={conv.title}
                    >
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-semibold truncate">{conv.title || 'Nueva conversación'}</div>
                        {conv.updated_at && (
                          <div className="text-xs text-gray-600 truncate">{new Date(conv.updated_at).toLocaleString()}</div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          // Vista de Chat
          /* Chat Area - Solo se muestra cuando el chat ha comenzado */
          <>
            {chatStarted ? (
              <div className="flex-1 flex flex-col h-screen">
                {/* Mensajes del chat - scrollable con padding inferior para el input */}
                <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 py-8 pb-32">
                  <ChatMessages messages={messages} />
                  {/* Elemento invisible para scroll automático */}
                  <div ref={messagesEndRef} />
                </div>

                {/* Search Bar fijo abajo - posición absoluta */}
                <div className="fixed bottom-0 left-0 right-0 md:left-72 bg-gradient-to-t from-black via-black/95 to-black/80 backdrop-blur-xl border-t border-gray-800/50 px-4 sm:px-6 py-4 z-20">
                  <div className="w-full max-w-4xl mx-auto">
                    <SearchBar 
                      selectedMode={selectedMode} 
                      onMessageSent={handleNewMessage}
                      conversationId={conversationId}
                      onError={handleError}
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Vista inicial - Logo y botones centrados */
              <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
                {/* Logo */}
                <div className="mb-8 sm:mb-14">
                  <Logo />
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-3xl mb-4 sm:mb-6 px-2 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  <SearchBar 
                    selectedMode={selectedMode} 
                    onMessageSent={handleNewMessage}
                    conversationId={conversationId}
                    onError={handleError}
                    examplePrompt={examplePrompt}
                  />
                </div>

                {/* Example Prompts */}
                <div className="w-full px-2 sm:px-0 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <NavigationButtons onButtonClick={handleButtonClick} />
                </div>

                {/* Footer */}
                <div className="w-full max-w-3xl px-2 sm:px-0 mt-10">
                  <Footer />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer - solo se muestra en vista inicial */}
      {!chatStarted && <Footer />}
    </div>
  );
};

export default App;

