// API Service para comunicarse con el backend de Macrobat AI

const resolveBaseURL = () => {
  const envBaseURL = import.meta.env.VITE_API_BASE_URL;
  if (envBaseURL) {
    return envBaseURL.trim().replace(/\/*$/, '');
  }

  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    // Si estamos en localhost, usar puerto específico
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:8000`;
    }
    // Si estamos en Cloudflare o dominio público, usar proxy /api
    return `/api`;
  }

  return 'http://localhost:8000';
};

const API_BASE_URL = resolveBaseURL();

export interface ChatMessage {
  message: string;
  mode?: string;
  conversation_id?: string;
  images?: string[];
  files?: Array<{ name: string; type: string; data: string; size: number }>;
}

export interface ChatResponse {
  response: string;
  title?: string;
  conversation_id: string;
  timestamp: string;
  mode: string;
}

export interface StreamChunk {
  type: 'title' | 'start' | 'content' | 'done';
  content?: string;
  conversation_id?: string;
  mode?: string;
}

export interface DeepSearchChunk {
  type: 'search_start' | 'search_step' | 'source' | 'analysis_start' | 'content' | 'references_start' | 'references_title' | 'reference' | 'title' | 'done' | 'error';
  content?: string | any;
  conversation_id?: string;
}

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
  index: number;
}

export interface TitleRequest {
  message: string;
}

export interface TitleResponse {
  title: string;
}

// Conversaciones
export interface ConversationMeta {
  id: string;
  title: string;
  created_at?: string;
  updated_at?: string;
  count?: number;
}

export interface ListConversationsResponse {
  conversations: ConversationMeta[];
}

class MacrobatAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Enviar un mensaje al chat con streaming (para Deep Think)
   */
  async sendMessageStream(
    data: ChatMessage,
    onChunk: (chunk: StreamChunk) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/chat/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No se pudo obtener el reader del stream');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Procesar todas las líneas completas
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const chunk: StreamChunk = JSON.parse(jsonStr);
              onChunk(chunk);
            } catch (e) {
              console.error('Error parseando chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error en sendMessageStream:', error);
      throw error;
    }
  }

  /**
   * Enviar un mensaje al chat (sin streaming, para compatibilidad)
   */
  async sendMessage(data: ChatMessage): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Generar título para un mensaje
   */
  async generateTitle(message: string): Promise<TitleResponse> {
    try {
      const response = await fetch(`${this.baseURL}/title`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error generating title:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de conversación
   */
  async getConversation(conversationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/conversations/${conversationId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting conversation:', error);
      throw error;
    }
  }

  /**
   * Listar conversaciones
   */
  async listConversations(): Promise<ListConversationsResponse> {
    try {
      const response = await fetch(`${this.baseURL}/conversations`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result as ListConversationsResponse;
    } catch (error) {
      console.error('Error listing conversations:', error);
      throw error;
    }
  }

  /**
   * Eliminar conversación
   */
  async deleteConversation(conversationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/conversations/${conversationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      throw error;
    }
  }

  /**
   * Verificar estado del servicio
   */
  async healthCheck(): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/health`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }

  /**
   * Convertir archivo de imagen a base64
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Deep Search - Búsqueda profunda con Google Custom Search + análisis IA
   */
  async deepSearchStream(
    data: ChatMessage,
    onChunk: (chunk: DeepSearchChunk) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/deep-search/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No se pudo obtener el reader del stream');
      }

      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Procesar todas las líneas completas
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const chunk: DeepSearchChunk = JSON.parse(jsonStr);
              onChunk(chunk);
            } catch (e) {
              console.error('Error parseando chunk de Deep Search:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error en deepSearchStream:', error);
      throw error;
    }
  }
}

// Exportar instancia singleton
export const macrobatAPI = new MacrobatAPI();

export default MacrobatAPI;
