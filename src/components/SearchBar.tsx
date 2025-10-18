import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Search, Image, HelpCircle, Newspaper, Users, Paperclip, X, FileText, Loader2, Brain } from 'lucide-react';
import { macrobatAPI } from '../services/api';

interface SearchBarProps {
  selectedMode: string;
  onMessageSent?: (
    userMessage: string, 
    aiResponse: string, 
    title?: string, 
    convId?: string, 
    images?: string[],
    files?: Array<{ name: string; type: string; data: string; size: number }>
  ) => void;
  conversationId?: string;
  onError?: (message: string, type?: 'success' | 'info' | 'warning') => void;
  examplePrompt?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ selectedMode, onMessageSent, conversationId: initialConversationId, onError, examplePrompt }) => {
  const [inputValue, setInputValue] = useState('');
  
  // Cuando se recibe un prompt de ejemplo, establecerlo en el input
  useEffect(() => {
    if (examplePrompt) {
      setInputValue(examplePrompt);
      // Auto-enviar después de un pequeño delay
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.requestSubmit();
        }
      }, 100);
    }
  }, [examplePrompt]);
  const [isFocused, setIsFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deepThinkMode, setDeepThinkMode] = useState(false);
  const [deepSearchMode, setDeepSearchMode] = useState(false);
  const [attachedImages, setAttachedImages] = useState<{ file: File; preview: string }[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; type: string; data: string; size: number }[]>([]);
  const [conversationId, setConversationId] = useState<string>(initialConversationId || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConversationId(initialConversationId || '');
  }, [initialConversationId]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (trimmedInput && !isSending) {
      setIsSending(true);

      const userMessage = trimmedInput;
      const optimisticConversationId = conversationId || undefined;
      let hasOptimisticUpdate = false;

      // Convertir imágenes a base64 ANTES de limpiar el estado
      const imageBase64Array: string[] = [];
      for (const img of attachedImages) {
        const base64 = await macrobatAPI.fileToBase64(img.file);
        imageBase64Array.push(base64);
      }

      // Los archivos documentos ya están en base64
      const filesArray = attachedFiles.length > 0 ? attachedFiles : undefined;

      const ensureOptimisticMessage = () => {
        if (!onMessageSent || hasOptimisticUpdate) return;
        onMessageSent(userMessage, '', undefined, optimisticConversationId, imageBase64Array, filesArray);
        hasOptimisticUpdate = true;
      };

      setInputValue('');

      // Determinar el modo: si Deep Search está activo, usarlo; sino si Deep Think está activo, usarlo; sino usar selectedMode
      const messageMode = deepSearchMode ? 'DeepSearch' : (deepThinkMode ? 'DeepThink' : (selectedMode || 'chat'));
      
      try {
        ensureOptimisticMessage();

        // Si Deep Search está activo, usar búsqueda profunda
        if (deepSearchMode) {
          let fullResponse = '';
          let titleReceived = '';
          let convIdReceived = conversationId;

          await macrobatAPI.deepSearchStream(
            {
              message: userMessage,
              mode: messageMode,
              conversation_id: conversationId || undefined,
              files: filesArray,
            },
            (chunk) => {
              if (chunk.type === 'title' && chunk.content) {
                titleReceived = chunk.content as string;
              } else if (chunk.type === 'content' && chunk.content) {
                fullResponse += chunk.content as string;
                // Actualizar la UI en tiempo real
                if (onMessageSent) {
                  onMessageSent(
                    userMessage,
                    fullResponse,
                    titleReceived || undefined,
                    convIdReceived,
                    imageBase64Array,
                    filesArray
                  );
                }
              } else if (chunk.type === 'source') {
                // Las fuentes se mostrarán en el componente de visualización
                console.log('Fuente encontrada:', chunk.content);
              } else if (chunk.type === 'search_step' || chunk.type === 'search_start' || chunk.type === 'analysis_start') {
                // Actualizar estado de búsqueda en tiempo real
                const stepContent = chunk.content as string;
                fullResponse += stepContent + '\n';
                if (onMessageSent) {
                  onMessageSent(
                    userMessage,
                    fullResponse,
                    titleReceived || undefined,
                    convIdReceived,
                    imageBase64Array,
                    filesArray
                  );
                }
              } else if (chunk.type === 'references_start' || chunk.type === 'references_title' || chunk.type === 'reference') {
                // Agregar referencias al final
                const refContent = chunk.content as string;
                fullResponse += '\n' + refContent;
                if (onMessageSent) {
                  onMessageSent(
                    userMessage,
                    fullResponse,
                    titleReceived || undefined,
                    convIdReceived,
                    imageBase64Array,
                    filesArray
                  );
                }
              } else if (chunk.type === 'done') {
                console.log('Deep Search completado');
                if (chunk.conversation_id) {
                  convIdReceived = chunk.conversation_id;
                  setConversationId(chunk.conversation_id);
                  if (onMessageSent) {
                    onMessageSent(
                      userMessage,
                      fullResponse,
                      titleReceived || undefined,
                      convIdReceived,
                      imageBase64Array,
                      filesArray
                    );
                  }
                }
              }
            }
          );

          // Limpiar el input
          setInputValue('');
          setAttachedImages([]);
          setAttachedFiles([]);
          setDeepSearchMode(false);
          
        } else if (deepThinkMode) {
          // Si Deep Think está activo, usar streaming
          let fullResponse = '';
          let titleReceived = '';
          let convIdReceived = conversationId;

          await macrobatAPI.sendMessageStream(
            {
              message: userMessage,
              mode: messageMode,
              conversation_id: conversationId || undefined,
              images: imageBase64Array.length > 0 ? imageBase64Array : undefined,
              files: filesArray,
            },
            (chunk) => {
              if (chunk.type === 'title' && chunk.content) {
                titleReceived = chunk.content;
              } else if (chunk.type === 'start' && chunk.conversation_id) {
                convIdReceived = chunk.conversation_id;
                setConversationId(chunk.conversation_id);
              } else if (chunk.type === 'content' && chunk.content) {
                fullResponse += chunk.content;
                // Actualizar la UI en tiempo real
                if (onMessageSent) {
                  onMessageSent(
                    userMessage,
                    fullResponse,
                    titleReceived || undefined,
                    convIdReceived,
                    imageBase64Array,
                    filesArray
                  );
                }
              } else if (chunk.type === 'done') {
                console.log('Streaming completado');
              }
            }
          );

          // Limpiar el input y las imágenes
          setInputValue('');
          setAttachedImages([]);
          setAttachedFiles([]);
          setDeepThinkMode(false);
          
        } else {
          // Usar el método normal sin streaming
          const response = await macrobatAPI.sendMessage({
            message: userMessage,
            mode: messageMode,
            conversation_id: conversationId || undefined,
            images: imageBase64Array.length > 0 ? imageBase64Array : undefined,
            files: filesArray,
          });

          console.log('Respuesta de la IA:', response);
          
          // Guardar el ID de conversación
          if (response.conversation_id) {
            setConversationId(response.conversation_id);
          }

          // Notificar al componente padre con el mensaje, respuesta y título
          if (onMessageSent) {
            onMessageSent(
              userMessage,
              response.response,
              response.title,
              response.conversation_id,
              imageBase64Array,
              filesArray
            );
          }

          // Limpiar el input y las imágenes
          setInputValue('');
          setAttachedImages([]);
          setAttachedFiles([]);
        }
        
      } catch (error) {
        console.error('Error enviando mensaje:', error);
        if (onMessageSent) {
          ensureOptimisticMessage();
          onMessageSent(
            userMessage,
            'No se pudo enviar la respuesta. Revisa el backend e inténtalo nuevamente.',
            undefined,
            optimisticConversationId,
            imageBase64Array,
            filesArray
          );
        }
        if (onError) {
          onError('Error al enviar el mensaje. Asegúrate de que el backend esté corriendo en http://localhost:8000', 'warning');
        }
        // Desactivar modos especiales si ocurre un error
        setDeepThinkMode(false);
        setDeepSearchMode(false);
      } finally {
        setIsSending(false);
      }
    }
  };

  // Función para manejar el reconocimiento de voz
  const handleVoiceInput = () => {
    // Verificar si el navegador soporta Web Speech API
    if (!('webkitSpeechRecognition' in window)) {
      if (onError) {
        onError('Tu navegador no soporta reconocimiento de voz. Prueba con Chrome.', 'info');
      }
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES'; // Español
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Función para manejar la selección de archivos de IMÁGENES (máximo 5)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const MAX_IMAGES = 5;
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

    // Verificar si ya hay imágenes adjuntas
    const currentCount = attachedImages.length;
    const availableSlots = MAX_IMAGES - currentCount;

    if (availableSlots <= 0) {
      onError?.(`Ya tienes el máximo de ${MAX_IMAGES} imágenes adjuntas. Elimina alguna para agregar más.`, 'warning');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const filesToProcess = Array.from(files).slice(0, availableSlots);
    const newImages: { file: File; preview: string }[] = [];
    let processedCount = 0;

    filesToProcess.forEach((file) => {
      // Verificar que sea una imagen
      if (!file.type.startsWith('image/')) {
        onError?.(`"${file.name}" no es una imagen válida`, 'warning');
        processedCount++;
        return;
      }

      // Verificar tamaño
      if (file.size > MAX_SIZE_BYTES) {
        onError?.(`"${file.name}" excede el límite de ${MAX_SIZE_MB}MB`, 'warning');
        processedCount++;
        return;
      }

      // Procesar imagen
      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          file,
          preview: reader.result as string
        });
        processedCount++;

        // Cuando todas las imágenes están procesadas
        if (processedCount === filesToProcess.length) {
          if (newImages.length > 0) {
            setAttachedImages(prev => {
              const updated = [...prev, ...newImages];
              // Asegurar que no exceda el límite
              return updated.slice(0, MAX_IMAGES);
            });
            
            // Notificación de éxito
            const remaining = MAX_IMAGES - (currentCount + newImages.length);
            if (newImages.length === 1) {
              onError?.(`Imagen adjuntada. Puedes agregar ${remaining} más.`, 'success');
            } else {
              onError?.(`${newImages.length} imágenes adjuntadas. Puedes agregar ${remaining} más.`, 'success');
            }
          }
        }
      };
      reader.onerror = () => {
        onError?.(`Error al cargar "${file.name}"`, 'warning');
        processedCount++;
      };
      reader.readAsDataURL(file);
    });

    // Notificar si se alcanzó el límite
    if (files.length > availableSlots) {
      onError?.(`Solo se pueden adjuntar ${availableSlots} imágenes más (límite: ${MAX_IMAGES} total)`, 'info');
    }

    // Resetear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    const MAX_IMAGES = 5;
    if (attachedImages.length >= MAX_IMAGES) {
      onError?.(`Ya tienes el máximo de ${MAX_IMAGES} imágenes. Elimina alguna primero.`, 'warning');
      return;
    }
    fileInputRef.current?.click();
  };

  // Función para eliminar una imagen adjunta
  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Función para manejar documentos (PDF, Word, Excel, TXT)
  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles: typeof attachedFiles = [];
    
    for (const file of Array.from(files)) {
      // Verificar tamaño (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        onError?.(`El archivo "${file.name}" excede el límite de 10MB`, 'warning');
        continue;
      }

      // Verificar tipo
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
      ];

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx?|xlsx?|txt)$/i)) {
        onError?.(`Tipo de archivo no soportado: "${file.name}"`, 'warning');
        continue;
      }

      try {
        const reader = new FileReader();
        const base64Data = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newFiles.push({
          name: file.name,
          type: file.type,
          data: base64Data,
          size: file.size,
        });
      } catch (error) {
        console.error(`Error procesando "${file.name}":`, error);
        onError?.(`Error procesando "${file.name}"`, 'warning');
      }
    }

    if (newFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...newFiles]);
      onError?.(`${newFiles.length} archivo(s) adjuntado(s)`, 'success');
    }

    // Resetear input
    if (docInputRef.current) {
      docInputRef.current.value = '';
    }
  };

  const triggerDocInput = () => {
    docInputRef.current?.click();
  };

  const removeDocument = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext || '')) return '📝';
    if (['xls', 'xlsx'].includes(ext || '')) return '📊';
    if (ext === 'txt') return '📃';
    return '📎';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Detectar si el texto es muy largo (más de 500 caracteres)
  const isTextLong = inputValue.length > 500;

  // Colores según el modo seleccionado
  const getModeColors = () => {
    switch (selectedMode) {
      case 'DeepSearch':
        return {
          border: 'border-[#AAFF00]/70',
          shadow: 'shadow-[0_12px_32px_rgba(170,255,0,0.25),0_0_20px_rgba(170,255,0,0.15),inset_0_1px_0_rgba(170,255,0,0.1)]',
          hover: 'hover:border-[#AAFF00]/50',
        };
      case 'Create Images':
        return {
          border: 'border-[#AAFF00]/70',
          shadow: 'shadow-[0_12px_32px_rgba(170,255,0,0.25),0_0_20px_rgba(170,255,0,0.15),inset_0_1px_0_rgba(170,255,0,0.1)]',
          hover: 'hover:border-[#AAFF00]/50',
        };
      case 'How to':
        return {
          border: 'border-[#AAFF00]/70',
          shadow: 'shadow-[0_12px_32px_rgba(170,255,0,0.25),0_0_20px_rgba(170,255,0,0.15),inset_0_1px_0_rgba(170,255,0,0.1)]',
          hover: 'hover:border-[#AAFF00]/50',
        };
      case 'Latest News':
        return {
          border: 'border-[#AAFF00]/70',
          shadow: 'shadow-[0_12px_32px_rgba(170,255,0,0.25),0_0_20px_rgba(170,255,0,0.15),inset_0_1px_0_rgba(170,255,0,0.1)]',
          hover: 'hover:border-[#AAFF00]/50',
        };
      case 'Personas':
        return {
          border: 'border-[#AAFF00]/70',
          shadow: 'shadow-[0_12px_32px_rgba(170,255,0,0.25),0_0_20px_rgba(170,255,0,0.15),inset_0_1px_0_rgba(170,255,0,0.1)]',
          hover: 'hover:border-[#AAFF00]/50',
        };
      default:
        return {
          border: 'border-gray-700/50',
          shadow: 'shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]',
          hover: 'hover:border-[#AAFF00]/30',
        };
    }
  };

  const colors = getModeColors();

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Preview de imágenes adjuntas - Estilo ChatGPT */}
        {attachedImages.length > 0 && (
          <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Contador de imágenes */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs text-gray-400 font-medium">
                {attachedImages.length} {attachedImages.length === 1 ? 'imagen' : 'imágenes'} adjuntada{attachedImages.length === 1 ? '' : 's'} (máx. 5)
              </span>
              {attachedImages.length >= 5 && (
                <span className="text-xs text-yellow-500 font-medium animate-pulse">
                  Límite alcanzado
                </span>
              )}
            </div>
            
            {/* Grid de imágenes */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {attachedImages.map((img, index) => (
                <div
                  key={index}
                  className="relative group/img rounded-xl overflow-hidden
                           bg-gradient-to-b from-gray-800/90 to-gray-900/90
                           border-2 border-gray-700/50
                           shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                           hover:border-[#AAFF00]/40
                           hover:shadow-[0_6px_16px_rgba(170,255,0,0.2)]
                           transition-all duration-300
                           aspect-square"
                >
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Número de imagen */}
                  <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                    <span className="text-[10px] text-white font-bold">{index + 1}</span>
                  </div>
                  
                  {/* Overlay con nombre del archivo */}
                  <div className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 
                                transition-opacity duration-200 flex flex-col items-center justify-center p-2">
                    <span className="text-[10px] text-white text-center truncate max-w-full mb-1">
                      {img.file.name}
                    </span>
                    <span className="text-[9px] text-gray-300">
                      {(img.file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  
                  {/* Botón para eliminar */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 rounded-lg
                             bg-red-500/90 hover:bg-red-500
                             backdrop-blur-sm
                             opacity-0 group-hover/img:opacity-100
                             transition-all duration-200
                             hover:scale-110
                             shadow-lg"
                    aria-label="Eliminar imagen"
                  >
                    <X size={12} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview de documentos adjuntos */}
        {attachedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            {attachedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 rounded-xl
                         bg-gradient-to-b from-gray-800/90 to-gray-900/90
                         border-2 border-gray-700/50
                         shadow-[0_4px_12px_rgba(0,0,0,0.4)]
                         hover:border-[#AAFF00]/30
                         transition-all duration-300 group/doc"
              >
                <span className="text-xl">{getFileIcon(file.name)}</span>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm text-gray-200 truncate max-w-[150px] font-medium">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="ml-2 p-1 rounded-lg
                           bg-red-500/80 hover:bg-red-500
                           opacity-0 group-hover/doc:opacity-100
                           transition-all duration-200
                           hover:scale-110"
                  aria-label="Remove document"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Preview de texto largo */}
        {isTextLong && (
          <div className="mb-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl
                          bg-gradient-to-b from-gray-800/90 to-gray-900/90
                          border-2 border-gray-700/50
                          shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
              <div className="p-1.5 sm:p-2 rounded-lg bg-blue-500/20">
                <FileText size={18} className="sm:w-5 sm:h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-white mb-1">Texto largo detectado</p>
                <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                  {inputValue.length} caracteres - Se enviará como archivo de texto
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Clear text"
              >
                <X size={16} className="text-gray-400 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          {/* Badge del modo seleccionado - aparece arriba del input */}
          {selectedMode && (
            <div className="absolute -top-12 left-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className={`
                inline-flex items-center gap-2.5 px-4 py-2 rounded-xl
                bg-gradient-to-br from-[#AAFF00]/15 to-[#88dd00]/10
                border-2 border-[#AAFF00]/30
                shadow-[0_8px_16px_rgba(170,255,0,0.25),inset_0_1px_0_rgba(170,255,0,0.2)]
                backdrop-blur-xl
                font-semibold text-sm
              `}>
                {/* Icono según el modo */}
                <span className="text-[#AAFF00]">
                  {selectedMode === 'DeepSearch' && <Search size={16} strokeWidth={2.5} />}
                  {selectedMode === 'Create Images' && <Image size={16} strokeWidth={2.5} />}
                  {selectedMode === 'How to' && <HelpCircle size={16} strokeWidth={2.5} />}
                  {selectedMode === 'Latest News' && <Newspaper size={16} strokeWidth={2.5} />}
                  {selectedMode === 'Personas' && <Users size={16} strokeWidth={2.5} />}
                </span>
                <span className="text-white">{selectedMode}</span>
              </div>
            </div>
          )}
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="What do you want to know?"
            className={`w-full px-4 sm:px-7 py-3.5 sm:py-5 pr-16 sm:pr-20 text-sm sm:text-base 
                       bg-gradient-to-b from-gray-800/80 to-gray-900/80
                       border-2 rounded-2xl 
                       text-white placeholder-gray-400 
                       focus:outline-none 
                       transition-all duration-300
                       ${selectedMode || isFocused || inputValue.trim()
                         ? `${colors.border} ${colors.shadow}` 
                         : 'border-gray-700/50 shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
                       }
                       ${colors.hover}
                       backdrop-blur-sm`}
          />
          
          {/* 3D top highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-2xl pointer-events-none"></div>
          
          <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 sm:gap-2">
            {/* Input oculto para archivos */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {/* Botón de Deep Search */}
            <button 
              type="button"
              onClick={() => {
                setDeepSearchMode(!deepSearchMode);
                if (!deepSearchMode) {
                  setDeepThinkMode(false); // Desactivar Deep Think si activamos Deep Search
                }
              }}
              className={`group/search relative p-2 sm:p-3
                       rounded-xl transition-all duration-300
                       hover:shadow-[0_4px_12px_rgba(170,255,0,0.3)]
                       hover:-translate-y-0.5
                       active:translate-y-0
                       ${deepSearchMode 
                         ? 'bg-gradient-to-b from-[#AAFF00]/20 to-[#88dd00]/10 border border-[#AAFF00]/40' 
                         : 'hover:bg-gradient-to-b hover:from-gray-700/60 hover:to-gray-800/60'
                       }`}
              aria-label="Deep Search Mode"
              title="Activar Deep Search (búsqueda profunda con IA)"
            >
              <Search 
                size={16} 
                className={`sm:w-[18px] sm:h-[18px] relative transition-all duration-300
                  ${deepSearchMode 
                    ? 'text-[#AAFF00] animate-pulse' 
                    : 'text-gray-400 group-hover/search:text-gray-200'
                  }`}
              />
              {deepSearchMode && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#AAFF00] rounded-full animate-ping"></div>
              )}
            </button>

            {/* Botón de Deep Think */}
            <button 
              type="button"
              onClick={() => {
                setDeepThinkMode(!deepThinkMode);
                if (!deepThinkMode) {
                  setDeepSearchMode(false); // Desactivar Deep Search si activamos Deep Think
                }
              }}
              className={`group/think relative p-2 sm:p-3
                       rounded-xl transition-all duration-300
                       hover:shadow-[0_4px_12px_rgba(170,255,0,0.3)]
                       hover:-translate-y-0.5
                       active:translate-y-0
                       ${deepThinkMode 
                         ? 'bg-gradient-to-b from-[#AAFF00]/20 to-[#88dd00]/10 border border-[#AAFF00]/40' 
                         : 'hover:bg-gradient-to-b hover:from-gray-700/60 hover:to-gray-800/60'
                       }`}
              aria-label="Deep Think Mode"
              title="Activar Deep Think (pensamiento profundo)"
            >
              <Brain 
                size={16} 
                className={`sm:w-[18px] sm:h-[18px] relative transition-all duration-300
                  ${deepThinkMode 
                    ? 'text-[#AAFF00] animate-pulse' 
                    : 'text-gray-400 group-hover/think:text-gray-200'
                  }`}
              />
              {deepThinkMode && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#AAFF00] rounded-full animate-ping"></div>
              )}
            </button>
            
            {/* Botón de adjuntar archivo */}
            <button 
              type="button"
              onClick={triggerFileInput}
              className="group/attach relative p-2 sm:p-3
                       hover:bg-gradient-to-b hover:from-gray-700/60 hover:to-gray-800/60
                       rounded-xl transition-all duration-300
                       hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                       hover:-translate-y-0.5
                       active:translate-y-0"
              aria-label="Attach image"
              title="Adjuntar imagen"
            >
              <Image size={16} className="sm:w-[18px] sm:h-[18px] relative text-gray-400 group-hover/attach:text-gray-200 transition-colors" />
            </button>

            {/* Input oculto para documentos */}
            <input
              ref={docInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/plain"
              multiple
              onChange={handleDocumentSelect}
              className="hidden"
            />

            {/* Botón de adjuntar documento */}
            <button 
              type="button"
              onClick={triggerDocInput}
              className="group/doc relative p-2 sm:p-3
                       hover:bg-gradient-to-b hover:from-gray-700/60 hover:to-gray-800/60
                       rounded-xl transition-all duration-300
                       hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                       hover:-translate-y-0.5
                       active:translate-y-0"
              aria-label="Attach document"
              title="Adjuntar documento (PDF, Word, Excel, TXT)"
            >
              <Paperclip size={16} className="sm:w-[18px] sm:h-[18px] relative text-gray-400 group-hover/doc:text-gray-200 transition-colors" />
            </button>

            {/* Botón de Micrófono o Enviar */}
            {inputValue.trim() ? (
              <button 
                type="submit"
                disabled={isSending}
                className={`group/send relative p-2 sm:p-3 
                         bg-gradient-to-b from-gray-700/90 to-gray-800/90
                         rounded-xl 
                         border border-gray-600/50
                         shadow-[0_4px_12px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
                         hover:shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]
                         hover:-translate-y-0.5
                         active:translate-y-0
                         transition-all duration-300
                         animate-in fade-in slide-in-from-right-2 duration-300
                         ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Send message"
              >
                {/* 3D top highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-xl"></div>
                
                {isSending ? (
                  <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] relative text-[#AAFF00] animate-spin" />
                ) : (
                  <Send size={16} className="sm:w-[18px] sm:h-[18px] relative text-gray-300 group-hover/send:text-white transition-colors" />
                )}
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleVoiceInput}
                className={`group/mic relative p-2 sm:p-3
                         hover:bg-gradient-to-b hover:from-gray-700/60 hover:to-gray-800/60
                         rounded-xl transition-all duration-300
                         hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                         hover:-translate-y-0.5
                         active:translate-y-0
                         ${isListening ? 'bg-red-500/20 animate-pulse' : ''}`}
                aria-label="Voice search"
              >
                <Mic size={16} className={`sm:w-[18px] sm:h-[18px] relative transition-colors ${isListening ? 'text-red-400' : 'text-gray-400 group-hover/mic:text-gray-200'}`} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
