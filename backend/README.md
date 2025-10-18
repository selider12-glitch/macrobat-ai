# Macrobat AI Backend

Backend profesional en Python con FastAPI que integra la API de Gemini 2.0 Flash.

## 🚀 Características

- ✅ **Chat con IA avanzado** usando Gemini 2.0 Flash
- ✅ **Análisis de imágenes** con modelos multimodales
- ✅ **Generación automática de títulos** para conversaciones
- ✅ **Múltiples modos de operación**:
  - DeepSearch: Búsqueda profunda con razonamiento paso a paso
  - Create Images: Descripciones creativas para generación de imágenes
  - How to: Tutoriales paso a paso
  - Latest News: Información actualizada
  - Personas: Respuestas personalizadas
- ✅ **Historial de conversaciones**
- ✅ **Procesamiento de múltiples imágenes**
- ✅ **CORS configurado** para frontend

## 📋 Requisitos

- Python 3.9 o superior
- pip (gestor de paquetes de Python)

## 🛠️ Instalación

1. **Navegar a la carpeta backend**:
```bash
cd backend
```

2. **Crear entorno virtual** (recomendado):
```bash
python3 -m venv venv
source venv/bin/activate  # En macOS/Linux
# o
venv\Scripts\activate  # En Windows
```

3. **Instalar dependencias**:
```bash
pip install -r requirements.txt
```

4. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Edita .env y agrega tus claves reales de Gemini y Google Custom Search
```

## 🎯 Uso

1. **Iniciar el servidor**:
```bash
python main.py
```

O con uvicorn directamente:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

2. **El servidor estará disponible en**: `http://localhost:8000`

3. **Documentación interactiva**: `http://localhost:8000/docs`

## 📡 Endpoints

### `GET /`
Información general del API

### `GET /health`
Estado del servicio

### `POST /chat`
Enviar mensaje al chat

**Request Body**:
```json
{
  "message": "¿Qué es la inteligencia artificial?",
  "mode": "DeepSearch",
  "conversation_id": "optional-id",
  "images": ["base64-encoded-image"]
}
```

**Response**:
```json
{
  "response": "La inteligencia artificial es...",
  "title": "Introducción a la IA",
  "conversation_id": "conv_123",
  "timestamp": "2025-10-18T...",
  "mode": "DeepSearch"
}
```

### `POST /title`
Generar título para un mensaje

**Request Body**:
```json
{
  "message": "¿Cómo funciona la fotosíntesis?"
}
```

**Response**:
```json
{
  "title": "Proceso de la Fotosíntesis"
}
```

### `GET /conversations/{conversation_id}`
Obtener historial de una conversación

### `DELETE /conversations/{conversation_id}`
Eliminar una conversación

## 🧠 Sistema de Prompts

El backend incluye un sistema de prompts ultra completo que:

1. **Búsqueda Web**: Proporciona información actualizada con fuentes
2. **Razonamiento Profundo**: Explica paso a paso el proceso de pensamiento
3. **Resolución Académica**: Ayuda con problemas escolares de todas las materias
4. **Análisis de Imágenes**: Describe y analiza contenido visual
5. **Generación de Títulos**: Crea títulos relevantes automáticamente

## 🔒 Seguridad

- Las claves sensibles se leen desde variables de entorno (.env no se debe commitear)
- `GEMINI_API_KEY` es obligatoria para habilitar respuestas de IA
- `GOOGLE_SEARCH_API_KEY` y `GOOGLE_SEARCH_ENGINE_ID` son necesarias para Deep Search
- CORS configurado para localhost:5173 y localhost:5174

## 🌐 Integración con Frontend

El backend está configurado para comunicarse con el frontend React en:
- `http://localhost:5173`
- `http://localhost:5174`

## 📝 Notas

- El historial se guarda en memoria (usar base de datos en producción)
- Soporta múltiples imágenes en una sola consulta
- Modelo: `gemini-2.0-flash-exp`
- Temperatura ajustable según el modo

## 🐛 Debugging

Para ver logs detallados, ejecuta:
```bash
uvicorn main:app --reload --log-level debug
```

## 📚 Documentación Adicional

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Uvicorn](https://www.uvicorn.org/)
