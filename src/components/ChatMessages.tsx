import React from 'react';
import { Bot, User, CheckCircle, Loader2, Search, Globe, Sparkles, FileText } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  images?: string[]; // Array of base64 image data URLs
  files?: Array<{ name: string; type: string; data: string; size: number }>;
}

interface ChatMessagesProps {
  messages: Message[];
}

// Extraer el dominio de una URL para obtener el favicon
const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

// Obtener el favicon de un dominio
const getFaviconUrl = (url: string): string => {
  const domain = getDomainFromUrl(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
};

const formatMessage = (content: string) => {
  // Helpers para construir HTML estructurado seguro
  const escapeHtml = (text: string) => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Elimina marcadores de formato (negrita **texto** e itálica *texto*)
  const stripFormatting = (text: string) => {
    let out = text;
    // **negrita**
    out = out.replace(/\*\*([^*]+)\*\*/g, '$1');
    // *itálica*
    out = out.replace(/\*([^*\n]+)\*/g, '$1');
    return out;
  };

  const buildStructuredHtml = (raw: string) => {
    const normalized = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    let html = '';
    let paragraph: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        const text = stripFormatting(escapeHtml(paragraph.join(' ').trim()));
        if (text) html += `<p class="mt-2">${text}</p>`;
        paragraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Si ya es un bloque HTML (por ejemplo, los bloques de Deep Think), mantenerlo
      if (trimmed.startsWith('<div') || trimmed.startsWith('<svg')) {
        flushParagraph();
        html += line;
        continue;
      }

      // Ítems numerados: "1. Título"
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        flushParagraph();
        const num = numMatch[1];
        const title = numMatch[2];
        html += `<div class="mt-3 mb-2"><span class="text-[#AAFF00] font-bold">${num}.</span> <strong class="text-white font-bold">${stripFormatting(escapeHtml(title))}</strong></div>`;
        continue;
      }

      // Viñetas unicode: "• texto"
      const bulletMatch = trimmed.match(/^•\s+(.*)$/);
      if (bulletMatch) {
        flushParagraph();
        const text = bulletMatch[1];
        html += `<div class="ml-4 mt-1"><span class="text-gray-400">•</span> ${stripFormatting(escapeHtml(text))}</div>`;
        continue;
      }

      // Viñetas Markdown: "* texto" o "- texto"
      const mdBulletMatch = trimmed.match(/^[*-]\s+(.*)$/);
      if (mdBulletMatch) {
        flushParagraph();
        const text = mdBulletMatch[1];
        html += `<div class="ml-4 mt-1"><span class="text-gray-400">•</span> ${stripFormatting(escapeHtml(text))}</div>`;
        continue;
      }

      // Línea en blanco -> pequeño espacio
      if (trimmed === '') {
        flushParagraph();
        html += `<div class="h-1"></div>`;
        continue;
      }

      // Acumular párrafos normales
      paragraph.push(line);
    }

    flushParagraph();
    return html;
  };

  // Mensaje normal: construir HTML estructurado (numeración y viñetas bien presentadas)
  return buildStructuredHtml(content);
};

// Parser de contenido DeepThink para animaciones y estado visual
const parseDeepThink = (content: string) => {
  const loading = content.includes('[LOADING]');
  const complete = content.includes('[COMPLETE]');

  // Extraer pasos línea por línea, soportando streaming parcial
  const steps: { number: number; text: string; done: boolean }[] = [];
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith('[STEP-')) {
      // Ej: [STEP-1] Paso 1: Texto del paso... [DONE]
      const numMatch = line.match(/\[STEP-(\d+)\]/);
      const textMatch = line.match(/\]\s*Paso\s*\d+:\s*(.*?)(?:\s*\[DONE\]|$)/);
      if (numMatch && textMatch) {
        const number = parseInt(numMatch[1], 10);
        const text = textMatch[1];
        const done = line.includes('[DONE]');
        steps.push({ number, text, done });
      }
    }
  }

  // Parte de respuesta final (después de [COMPLETE])
  let answerHtml = '';
  if (complete) {
    const idx = content.indexOf('[COMPLETE]');
    const answerPart = content.slice(idx + '[COMPLETE]'.length);
    answerHtml = formatMessage(answerPart);
  }

  return { loading, steps, complete, answerHtml };
};

// Parser de contenido Deep Search para animaciones y visualización de fuentes
const parseDeepSearch = (content: string) => {
  const hasSearchStart = content.includes('[SEARCHING]') || content.includes('Iniciando búsqueda profunda');
  const hasFound = content.includes('[FOUND]');
  const hasAnalyzing = content.includes('[ANALYZING]');
  const hasSynthesizing = content.includes('[SYNTHESIZING]');
  
  // Extraer información de fuentes
  const sources: { index: number; title: string; url: string }[] = [];
  const lines = content.split('\n');
  
  // Buscar enlaces en formato [1] Title: URL o [1] [Title](URL)
  for (const line of lines) {
    // Formato: [1] Title: URL
    const match1 = line.match(/\[(\d+)\]\s+([^:]+):\s+(https?:\/\/[^\s]+)/);
    if (match1) {
      sources.push({
        index: parseInt(match1[1]),
        title: match1[1].trim(),
        url: match1[3].trim()
      });
      continue;
    }
    
    // Formato: [1] [Title](URL)
    const match2 = line.match(/\[(\d+)\]\s+\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
    if (match2) {
      sources.push({
        index: parseInt(match2[1]),
        title: match2[2].trim(),
        url: match2[3].trim()
      });
    }
  }
  
  // Extraer respuesta principal (sin las referencias)
  let mainContent = content;
  const referencesIndex = content.indexOf('---');
  if (referencesIndex !== -1 && content.includes('Fuentes consultadas')) {
    mainContent = content.substring(0, referencesIndex);
  }
  
  // Limpiar marcadores de proceso
  mainContent = mainContent
    .replace(/Iniciando búsqueda profunda\.\.\./g, '')
    .replace(/\[SEARCHING\][^\n]*/g, '')
    .replace(/\[FOUND\][^\n]*/g, '')
    .replace(/\[ANALYZING\][^\n]*/g, '')
    .replace(/\[SYNTHESIZING\][^\n]*/g, '')
    .trim();
  
  const mainHtml = mainContent ? formatMessage(mainContent) : '';
  
  return { 
    hasSearchStart, 
    hasFound, 
    hasAnalyzing, 
    hasSynthesizing,
    sources, 
    mainHtml,
    isComplete: sources.length > 0 && mainHtml.length > 0
  };
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 mb-8 px-4">
      {messages.map((message, index) => {
        const hasDeepThink = message.role === 'assistant' && (
          message.content.includes('[LOADING]') ||
          message.content.includes('[STEP-') ||
          message.content.includes('[COMPLETE]')
        );
        
        const hasDeepSearch = message.role === 'assistant' && (
          message.content.includes('[SEARCHING]') ||
          message.content.includes('Iniciando búsqueda profunda') ||
          message.content.includes('[FOUND]') ||
          message.content.includes('Fuentes consultadas')
        );
        
        const deep = hasDeepThink ? parseDeepThink(message.content) : null;
        const deepSearch = hasDeepSearch ? parseDeepSearch(message.content) : null;

        return (
          <div
            key={index}
            className={`flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center
                      ${
                        message.role === 'assistant'
                          ? 'bg-gradient-to-br from-[#AAFF00]/20 to-[#88dd00]/10 border-2 border-[#AAFF00]/30 shadow-[0_4px_16px_rgba(170,255,0,0.2)]'
                          : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-2 border-gray-700/40 shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                      }`}
            >
              {message.role === 'assistant' ? (
                <Bot size={20} className="text-[#AAFF00]" />
              ) : (
                <User size={20} className="text-gray-300" />
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 space-y-2">
              {/* Role Label */}
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {message.role === 'assistant' ? 'Macrobat AI' : 'Tú'}
              </div>

              {/* Imágenes adjuntas (solo para mensajes del usuario) */}
              {message.role === 'user' && message.images && message.images.length > 0 && (
                <div className={`flex flex-wrap gap-2 mb-3 ${
                  message.images.length === 1 ? 'max-w-[200px]' : 'max-w-full'
                }`}>
                  {message.images.map((img, idx) => (
                    <div key={idx} className="relative group w-[80px] h-[80px] flex-shrink-0">
                      <div className="absolute top-1 left-1 z-10 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {idx + 1}
                      </div>
                      <img
                        src={img}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-700/50 hover:border-[#AAFF00]/70 hover:scale-105 transition-all cursor-pointer"
                        onClick={() => window.open(img, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Archivos adjuntos (solo para mensajes del usuario) */}
              {message.role === 'user' && message.files && message.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {message.files.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-2 px-3 py-2 bg-gray-800/60 border border-gray-700/50 rounded-lg text-xs"
                    >
                      <FileText className="w-4 h-4 text-[#AAFF00]" />
                      <span className="text-gray-300 truncate max-w-[150px]">{file.name}</span>
                      <span className="text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Message Text */}
              <div
                className={`relative p-4 rounded-2xl
                        ${
                          message.role === 'assistant'
                            ? 'bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/30 shadow-[0_4px_16px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.03)]'
                            : 'bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/50 shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
                        }`}
              >
                {/* Si el mensaje está vacío y es del asistente, mostrar typing indicator */}
                {message.role === 'assistant' && !message.content ? (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#AAFF00] animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1s' }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#AAFF00] animate-bounce" style={{ animationDelay: '150ms', animationDuration: '1s' }}></span>
                      <span className="w-2 h-2 rounded-full bg-[#AAFF00] animate-bounce" style={{ animationDelay: '300ms', animationDuration: '1s' }}></span>
                    </div>
                    <span className="ml-2 text-xs text-gray-500 font-medium animate-pulse">
                      Writing...
                    </span>
                  </div>
                ) : null}
                
                {/* Contenido del mensaje */}
                {message.content && (
                  <>
                    {/* Top highlight */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-t-2xl"></div>

                    {/* Deep Search Animations */}
                    {hasDeepSearch && deepSearch ? (
                  <div className="space-y-4">
                    {/* Search Status */}
                    {deepSearch.hasSearchStart && !deepSearch.isComplete && (
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#AAFF00]/5 border border-[#AAFF00]/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="relative">
                          <Search className="h-5 w-5 text-[#AAFF00] animate-pulse" />
                          <div className="absolute inset-0 animate-ping">
                            <Search className="h-5 w-5 text-[#AAFF00] opacity-75" />
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#AAFF00]">Búsqueda Profunda Activada</div>
                          <div className="text-xs text-gray-400">Explorando la web en busca de información actualizada...</div>
                        </div>
                      </div>
                    )}

                    {/* Search Steps */}
                    <div className="space-y-2">
                      {deepSearch.hasSearchStart && (
                        <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2 duration-300">
                          <div className="h-2 w-2 rounded-full bg-[#AAFF00] animate-pulse"></div>
                          <span className="text-gray-300">Conectando con Google Search...</span>
                          <CheckCircle className="h-4 w-4 text-[#AAFF00] ml-auto" />
                        </div>
                      )}
                      {deepSearch.hasFound && (
                        <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2 duration-300 delay-100">
                          <div className="h-2 w-2 rounded-full bg-[#AAFF00] animate-pulse"></div>
                          <span className="text-gray-300">Fuentes encontradas y verificadas</span>
                          <CheckCircle className="h-4 w-4 text-[#AAFF00] ml-auto" />
                        </div>
                      )}
                      {deepSearch.hasAnalyzing && (
                        <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2 duration-300 delay-200">
                          <div className="h-2 w-2 rounded-full bg-[#AAFF00] animate-pulse"></div>
                          <span className="text-gray-300">Analizando contenido con IA...</span>
                          {deepSearch.isComplete ? (
                            <CheckCircle className="h-4 w-4 text-[#AAFF00] ml-auto" />
                          ) : (
                            <Loader2 className="h-4 w-4 text-[#AAFF00] animate-spin ml-auto" />
                          )}
                        </div>
                      )}
                      {deepSearch.hasSynthesizing && (
                        <div className="flex items-center gap-2 text-sm animate-in fade-in slide-in-from-left-2 duration-300 delay-300">
                          <div className="h-2 w-2 rounded-full bg-[#AAFF00] animate-pulse"></div>
                          <span className="text-gray-300">Sintetizando información...</span>
                          {deepSearch.isComplete ? (
                            <CheckCircle className="h-4 w-4 text-[#AAFF00] ml-auto" />
                          ) : (
                            <Loader2 className="h-4 w-4 text-[#AAFF00] animate-spin ml-auto" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sources Grid - Solo si hay fuentes */}
                    {deepSearch.sources.length > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-[#AAFF00]" />
                          <span className="text-sm font-semibold text-[#AAFF00]">Fuentes Consultadas</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {deepSearch.sources.map((source, idx) => (
                            <a
                              key={idx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center gap-3 p-3 rounded-xl bg-gray-800/40 border border-gray-700/50 hover:border-[#AAFF00]/50 hover:bg-gray-800/60 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                              style={{ animationDelay: `${idx * 100}ms` }}
                            >
                              {/* Favicon */}
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 border border-gray-600/30 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-300">
                                <img 
                                  src={getFaviconUrl(source.url)} 
                                  alt="" 
                                  className="w-5 h-5"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                                <Globe className="h-4 w-4 text-gray-500 hidden" />
                              </div>
                              
                              {/* Source Info */}
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-200 truncate group-hover:text-[#AAFF00] transition-colors">
                                  {source.title}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {getDomainFromUrl(source.url)}
                                </div>
                              </div>
                              
                              {/* Index Badge */}
                              <div className="flex-shrink-0 w-6 h-6 rounded-md bg-[#AAFF00]/10 border border-[#AAFF00]/30 flex items-center justify-center">
                                <span className="text-xs font-bold text-[#AAFF00]">{source.index}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Answer */}
                    {deepSearch.mainHtml && (
                      <div className="mt-4 pt-4 border-t border-gray-700/30">
                        <div 
                          className="text-gray-200 text-sm sm:text-base leading-relaxed prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: deepSearch.mainHtml }}
                        />
                      </div>
                    )}
                  </div>
                ) : hasDeepThink && deep ? (
                  // DeepThink Animations
                  <div className="space-y-3">
                    {/* Loading */}
                    {deep.loading && !deep.complete && (
                      <div className="flex items-center gap-2 text-sm text-gray-300 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Loader2 className="h-4 w-4 text-[#AAFF00] animate-spin" />
                        <span>Iniciando Deep Think... Cargando análisis...</span>
                      </div>
                    )}

                    {/* Steps */}
                    {deep.steps.length > 0 && (
                      <div className="mt-1 space-y-2">
                        {deep.steps.map((step) => (
                          <div key={step.number} className="flex items-start gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {step.done ? (
                              <CheckCircle className="h-4 w-4 text-[#AAFF00] mt-0.5" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border border-[#AAFF00]/40 mt-0.5"></div>
                            )}
                            <div className="text-sm">
                              <span className="text-[#AAFF00] font-semibold mr-1">Paso {step.number}:</span>
                              <span className="text-gray-200">{step.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Complete */}
                    {deep.complete && (
                      <div className="flex items-center gap-2 text-sm text-gray-300 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <CheckCircle className="h-4 w-4 text-[#AAFF00]" />
                        <span>Deep Think finalizado! Ahora, la respuesta...</span>
                      </div>
                    )}

                    {/* Answer */}
                    {deep.answerHtml && (
                      <div 
                        className="text-gray-200 text-sm sm:text-base leading-relaxed prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: deep.answerHtml }}
                      />
                    )}
                  </div>
                ) : message.content ? (
                  // Texto normal
                  <div 
                    className="text-gray-200 text-sm sm:text-base leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                ) : null}
                  </>
                )}

                {/* Timestamp if available */}
                {message.timestamp && (
                  <div className="mt-2 text-xs text-gray-600">
                    {new Date(message.timestamp).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatMessages;
