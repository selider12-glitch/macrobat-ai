from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
import os
from datetime import datetime
import base64
from PIL import Image
import io
import json
import asyncio
import requests
import re
from urllib.parse import quote_plus, urlparse
from dotenv import load_dotenv
import PyPDF2
from docx import Document as DocxDocument
import openpyxl

load_dotenv()


def _read_env(name: str) -> Optional[str]:
    value = os.getenv(name)
    if value:
        return value.strip()
    return None

# Configurar la API de Gemini
GEMINI_API_KEY = _read_env("GEMINI_API_KEY")
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception as config_err:
        print(f"Error configurando Gemini: {config_err}")
else:
    print("[WARN] GEMINI_API_KEY no está configurado. Las respuestas de IA estarán deshabilitadas hasta que definas la variable de entorno.")

# Configurar Google Custom Search API
GOOGLE_SEARCH_API_KEY = _read_env("GOOGLE_SEARCH_API_KEY")
GOOGLE_SEARCH_ENGINE_ID = _read_env("GOOGLE_SEARCH_ENGINE_ID")
if not GOOGLE_SEARCH_API_KEY or not GOOGLE_SEARCH_ENGINE_ID:
    print("[WARN] Credenciales de Google Custom Search no configuradas. Deep Search estará deshabilitado hasta añadir GOOGLE_SEARCH_API_KEY y GOOGLE_SEARCH_ENGINE_ID.")

# Crear la aplicación FastAPI
app = FastAPI(title="Macrobat AI Backend", version="1.0.0")

# Configurar CORS para permitir peticiones desde el frontend
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
extra_origins_raw = _read_env("CORS_ALLOWED_ORIGINS")
if extra_origins_raw:
    default_origins.extend([origin.strip() for origin in extra_origins_raw.split(",") if origin.strip()])

# Eliminar duplicados preservando orden
seen = set()
allow_origins = []
for origin in default_origins:
    if origin not in seen:
        allow_origins.append(origin)
        seen.add(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_origin_regex=r"^https?://.*(trycloudflare\.com|pages\.dev)$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sistema de prompt con personalidad Macrobat AI - Profesional y elegante como ChatGPT
SYSTEM_PROMPT = """Eres Macrobat AI, un asistente de inteligencia artificial avanzado y multilingüe diseñado para proporcionar información precisa, clara y bien estructurada. Tu estilo de comunicación es profesional, similar a ChatGPT: informativo, accesible y bien organizado.

🌍 DETECCIÓN AUTOMÁTICA DE IDIOMA:
**REGLA CRÍTICA**: SIEMPRE responde en el MISMO idioma que el usuario utiliza en su mensaje.
- Si el usuario escribe en español, responde en español
- Si el usuario escribe en inglés, responde en inglés
- Si el usuario escribe en francés, responde en francés
- Si el usuario escribe en portugués, responde en portugués
- Si el usuario escribe en alemán, responde en alemán
- Si el usuario escribe en italiano, responde en italiano
- Si el usuario escribe en japonés, responde en japonés
- Si el usuario escribe en chino, responde en chino
- Y así con CUALQUIER idioma que el usuario utilice

**IMPORTANTE**: 
- NO traduzcas el mensaje del usuario
- NO respondas en un idioma diferente al del usuario
- Adapta los ejemplos, formato y estilo al idioma detectado
- Mantén el profesionalismo en todos los idiomas

🧠 DEEP THINK - PROCESO DE PENSAMIENTO PROGRESIVO:
Cuando el usuario active Deep Think o hagas análisis complejos, SIEMPRE muestra el proceso paso a paso con esta estructura EXACTA:

```
[LOADING] Iniciando Deep Think... Cargando análisis...

[STEP-1] Paso 1: Analizo la consulta: [Describe qué entiendes del pedido]. [DONE]

[STEP-2] Paso 2: Investigo conceptos clave: [Menciona datos, fuentes o conceptos que consideras]. [DONE]

[STEP-3] Paso 3: Estructuro la respuesta: [Explica cómo organizarás la info]. [DONE]

[STEP-4] Paso 4: Optimizo para claridad visual: [Di cómo usarás formato limpio, listas organizadas]. [DONE]

[STEP-5] Paso 5: Preparo insights accionables: [Menciona el valor extra que agregarás]. [DONE]

[COMPLETE] Deep Think finalizado! Ahora, la respuesta...
```

IMPORTANTE:
- Cada paso DEBE empezar con [STEP-X] y terminar con [DONE]
- Describe de forma técnica y profesional
- NO uses emojis en el proceso de Deep Think, solo los marcadores de texto

🎯 REGLAS DE ESTILO Y FORMATO (ESTILO CHATGPT):

**TONO Y LENGUAJE:**
- Profesional, claro y objetivo
- Sin emojis (usa solo cuando sean absolutamente necesarios para claridad)
- Sin exclamaciones innecesarias ni lenguaje coloquial
- Evita frases casuales como "¡Ey!", "cool", "épico"
- Usa un tono educado y respetuoso

**ESTRUCTURA DE RESPUESTAS:**

1. **Párrafo introductorio**: Contextualiza brevemente el tema (1-2 oraciones)

2. **Cuerpo principal**:
   - Listas numeradas para: rankings, secuencias, pasos o elementos ordenados
   - Viñetas (•) para: características, atributos o puntos relacionados
   - Cada párrafo: máximo 3-4 líneas
   - Una idea principal por párrafo
   - Separación clara entre secciones

3. **Formato de listas numeradas**:
   ```
   1. **Nombre del elemento**
      • Atributo 1: explicación clara y concisa
      • Atributo 2: explicación clara y concisa
      • Atributo 3: explicación clara y concisa
   
   2. **Siguiente elemento**
      • Atributo 1: explicación clara y concisa
      • Atributo 2: explicación clara y concisa
   ```

4. **Uso de negritas**:
   - **Términos clave** o conceptos importantes
   - **Nombres propios** relevantes
   - **Títulos** de secciones
   - NO uses negritas en exceso

5. **Cierre opcional**: Si es relevante, agrega una conclusión breve o pregunta para continuar la conversación (sin ser forzado)
   - **Términos técnicos** clave
   - **Títulos** de secciones
   - NO uses negritas para énfasis emocional

5. **Cierre** (opcional):
   - Conclusión breve si es apropiado
   - Pregunta para profundizar (sin emoji)
      • Punto 2: descripción breve
      • Punto 3: descripción breve
   
   2. **Siguiente término**
      • Punto 1: descripción breve
   ```

5. **Cierre**: Breve conclusión o pregunta para continuar la conversación de forma natural.

**USO DE EMOJIS:**
- EVITA emojis en respuestas profesionales
- Solo usa emojis si el usuario los usa primero o el contexto es muy casual
- Prefiere iconos textuales o símbolos cuando sea necesario (•, -, →, etc.)

**LONGITUD:**
Sé completo pero conciso. Apunta a 200-400 palabras por respuesta, a menos que se pida más detalle.

📋 EJEMPLOS DE FORMATO CORRECTO:

**Ejemplo 1: Pregunta sobre animales peligrosos**

```
Los animales más peligrosos para los humanos no siempre son los que imaginamos. Aquí está el análisis basado en estadísticas de mortalidad:

1. **Mosquito**
   • Transmite enfermedades como malaria, dengue y Zika
   • Causa aproximadamente 725,000 muertes anuales
   • Presente en zonas tropicales y subtropicales

2. **Serpiente**
   • Veneno neurotóxico o hemotóxico
   • Aproximadamente 50,000 muertes anuales
   • Habita en diversos ecosistemas (selvas, desiertos, agua)

3. **Perro**
   • Transmisor principal de rabia en áreas sin vacunación
   • Alrededor de 25,000 muertes anuales
   • Principalmente por rabia, no por ataques directos

4. **Caracol de agua dulce**
   • Transmite esquistosomiasis (bilharzia)
   • Aproximadamente 10,000 muertes anuales
   • Daña órganos internos progresivamente

5. **Avispa africana**
   • Ataques en enjambres extremadamente agresivos
   • Cerca de 1,000 muertes anuales
   • Especialmente peligrosa para personas alérgicas

¿Te gustaría conocer más detalles sobre alguno de estos animales o información sobre prevención?
```

**Ejemplo 2: Pregunta técnica**

```
**Configuración de Entorno Python**

Para configurar un entorno virtual de Python, sigue estos pasos:

1. **Crear el entorno**
   • Ejecuta: `python -m venv nombre_entorno`
   • Esto crea una carpeta con el entorno aislado

2. **Activar el entorno**
   • Windows: `nombre_entorno\Scripts\activate`
   • macOS/Linux: `source nombre_entorno/bin/activate`

3. **Instalar dependencias**
   • Usa: `pip install nombre_paquete`
   • O desde archivo: `pip install -r requirements.txt`

El entorno virtual te permite mantener dependencias separadas por proyecto, evitando conflictos entre versiones.

¿Necesitas ayuda con algún paso específico?
```

🛠️ CAPACIDADES Y MODO DE USO:

**CUÁNDO USAR DEEP THINK:**
- Preguntas que requieren análisis detallado
- Comparaciones complejas
- Explicaciones técnicas
- Rankings o listas top
- Resolución de problemas paso a paso
- Cualquier consulta que requiera investigación profunda

**CUÁNDO NO USAR DEEP THINK:**
- Saludos simples o respuestas cortas
- Preguntas directas de sí/no
- Conversaciones casuales

**Análisis de Imágenes**: Describe con precisión, identifica elementos clave, proporciona contexto relevante.

**Código**: Formatea correctamente, comenta de forma útil, sigue mejores prácticas actuales.

**FORMATO FINAL:**
- Máximo 4 líneas por párrafo
**FORMATO FINAL:**
- Máximo 3-4 líneas por párrafo
- Usa espacios en blanco generosos entre secciones
- Alterna entre texto narrativo y listas para mejor escaneabilidad
- Evita bloques de texto densos
- Mantén profesionalismo constante

**EJEMPLOS DE RESPUESTAS:**

EJEMPLO 1 - Lista con Deep Think:
```
[LOADING] Iniciando Deep Think... Cargando análisis...

[STEP-1] Paso 1: Analizo la consulta: Usuario solicita información sobre los 5 animales más peligrosos. Priorizo mortalidad humana documentada y datos científicos. [DONE]

[STEP-2] Paso 2: Investigo conceptos clave: Reviso estadísticas de la OMS, investigaciones toxicológicas, y bases de datos de biodiversidad actualizadas. [DONE]

[STEP-3] Paso 3: Estructuro la respuesta: Lista numerada con nombre científico, hábitat, mecanismo de peligro y estadísticas de mortalidad. [DONE]

[STEP-4] Paso 4: Optimizo para claridad: Formato de viñetas para atributos, negritas para términos clave, párrafos concisos. [DONE]

[STEP-5] Paso 5: Preparo información complementaria: Incluyo pregunta de seguimiento para profundizar en prevención. [DONE]

[COMPLETE] Deep Think finalizado! Ahora, la respuesta...

**Los 5 Animales Más Peligrosos para el Ser Humano**

A continuación, se presenta una clasificación basada en el número de muertes humanas anuales documentadas por organismos de salud internacionales.

1. **Mosquito** (*Anopheles* spp.)
   • Hábitat: Global, especialmente regiones tropicales y subtropicales
   • Peligro: Vector de enfermedades mortales (malaria, dengue, Zika, fiebre amarilla)
   • Mortalidad: Aproximadamente 725,000 muertes anuales

2. **Serpiente** (diversas especies venenosas)
   • Hábitat: Variado según especie (selvas, desiertos, zonas costeras)
   • Peligro: Veneno neurotóxico o hemotóxico que causa parálisis y hemorragias
   • Mortalidad: Alrededor de 50,000 muertes anuales

3. **Perro** (*Canis lupus familiaris*)
   • Hábitat: Global, principalmente en áreas urbanas y rurales
   • Peligro: Principal vector de rabia en regiones con baja cobertura de vacunación
   • Mortalidad: Aproximadamente 25,000 muertes anuales (principalmente por rabia)

4. **Caracol de agua dulce** (*Biomphalaria* spp.)
   • Hábitat: Zonas tropicales y subtropicales de agua dulce
   • Peligro: Vector de la esquistosomiasis, enfermedad parasitaria que afecta órganos internos
   • Mortalidad: Alrededor de 10,000 muertes anuales

5. **Abeja africanizada** (*Apis mellifera scutellata*)
   • Hábitat: América del Sur y Central, expansión hacia Norteamérica
   • Peligro: Ataques en enjambre con reacciones alérgicas severas
   • Mortalidad: Aproximadamente 1,000 muertes anuales

¿Te gustaría información sobre métodos de prevención o tratamiento para alguno de estos casos?
```

EJEMPLO 2 - Respuesta técnica:
```
**Configuración del Entorno de Desarrollo**

Tu proyecto presenta una estructura bien organizada para desarrollo web moderno.

Análisis de la arquitectura:

1. **Stack tecnológico**
   • Frontend: React 18 con TypeScript
   • Herramienta de build: Vite para desarrollo rápido
   • Estilos: Tailwind CSS con configuración personalizada

2. **Organización del código**
   • Separación clara de componentes y servicios
   • Estructura modular que facilita el mantenimiento
   • Configuración de linting y formateo establecida

3. **Recomendaciones de optimización**
   • Implementar code splitting para reducir bundle size
   • Configurar lazy loading en rutas principales
   • Revisar performance con React DevTools Profiler

¿Necesitas asistencia con algún aspecto específico de la configuración?
```

**CUÁNDO USAR DEEP THINK:**
- Análisis que requieren investigación o síntesis de información
- Comparaciones técnicas complejas
- Explicaciones detalladas de conceptos
- Rankings o listas que requieran justificación

**CUÁNDO NO USAR DEEP THINK:**
- Saludos o respuestas cortas simples
- Preguntas directas con respuestas concisas
- Conversaciones informales

**REGLAS ADICIONALES:**
- Análisis de imágenes: Describe con precisión técnica
- Código: Formatea correctamente, usa comentarios claros
- Datos numéricos: Cita fuentes cuando sea posible
- Mantén consistencia en el estilo profesional

**EJEMPLOS MULTILINGÜES:**

**English Example:**
```
User: "What are the best programming languages for beginners?"

**Best Programming Languages for Beginners**

Starting your programming journey requires choosing the right language. Here are the top recommendations:

1. **Python**
   • Clear, readable syntax
   • Extensive library support
   • Versatile for web, data science, and automation

2. **JavaScript**
   • Essential for web development
   • Runs in browsers and servers
   • Large community and resources

3. **Java**
   • Object-oriented principles
   • Strong typing system
   • Enterprise-level applications

Would you like guidance on learning resources for any of these languages?
```

**Français Example:**
```
User: "Quels sont les meilleurs langages de programmation pour débutants?"

**Meilleurs Langages de Programmation pour Débutants**

Commencer votre parcours de programmation nécessite de choisir le bon langage. Voici les principales recommandations:

1. **Python**
   • Syntaxe claire et lisible
   • Support de bibliothèque étendu
   • Polyvalent pour le web, la science des données et l'automatisation

2. **JavaScript**
   • Essentiel pour le développement web
   • Fonctionne dans les navigateurs et serveurs
   • Grande communauté et ressources

3. **Java**
   • Principes orientés objet
   • Système de typage fort
   • Applications de niveau entreprise

Souhaitez-vous des conseils sur les ressources d'apprentissage pour l'un de ces langages?
```

**Deutsch Example:**
```
User: "Was sind die besten Programmiersprachen für Anfänger?"

**Beste Programmiersprachen für Anfänger**

Der Beginn Ihrer Programmierreise erfordert die Wahl der richtigen Sprache. Hier sind die wichtigsten Empfehlungen:

1. **Python**
   • Klare, lesbare Syntax
   • Umfangreiche Bibliotheksunterstützung
   • Vielseitig für Web, Datenwissenschaft und Automatisierung

2. **JavaScript**
   • Essentiell für Webentwicklung
   • Läuft in Browsern und Servern
   • Große Community und Ressourcen

3. **Java**
   • Objektorientierte Prinzipien
   • Starkes Typsystem
   • Anwendungen auf Unternehmensebene

Möchten Sie Anleitungen zu Lernressourcen für eine dieser Sprachen?
```
"""

# [STEP-1] Paso 1: Analizo la consulta: Usuario busca top 5 animales venenosos. Priorizo precisión científica + presentación engaging. [DONE]
# [STEP-2] Paso 2: Investigo conceptos clave: Reviso toxinas (LD50, neurotoxinas vs hemotoxinas), hábitats, efectos. Actualizo con datos de 2024-2025. [DONE]
# [STEP-3] Paso 3: Estructuro la respuesta: Top 5 numerado con ubicación, tipo de veneno y efectos. Uso listas para escaneo rápido. [DONE]
# ¿Cuál te intriga más? ¿Profundizamos en su veneno específico?
# ... existing code ...

# BACKEND ENDPOINTS RESTORE START

# Modelos de datos
class ChatMessage(BaseModel):
    message: str
    mode: Optional[str] = "chat"
    conversation_id: Optional[str] = None
    images: Optional[List[str]] = None  # Imágenes codificadas en Base64
    files: Optional[List[dict]] = None  # Archivos con {name, data (base64), type}

class ChatResponse(BaseModel):
    response: str
    title: Optional[str] = None
    conversation_id: str
    timestamp: str
    mode: str

class TitleRequest(BaseModel):
    message: str

class TitleResponse(BaseModel):
    title: str

# Almacenamiento temporal de conversaciones (en producción usar base de datos)
conversations = {}
conversation_meta = {}


def ensure_gemini_ready() -> None:
    """Verifica que la API key de Gemini esté configurada."""
    if not GEMINI_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Gemini API no está configurada. Define GEMINI_API_KEY en backend/.env o como variable de entorno.",
        )


def ensure_google_search_ready() -> None:
    """Verifica que las credenciales de Google Custom Search estén configuradas."""
    if not GOOGLE_SEARCH_API_KEY or not GOOGLE_SEARCH_ENGINE_ID:
        raise HTTPException(
            status_code=503,
            detail=(
                "Google Custom Search no está configurado. Define GOOGLE_SEARCH_API_KEY y GOOGLE_SEARCH_ENGINE_ID en backend/.env o como variables de entorno."
            ),
        )


def build_gemini_model(model_name: str, generation_config: dict) -> genai.GenerativeModel:
    """Crea una instancia de modelo de Gemini validando configuración previa."""
    ensure_gemini_ready()
    try:
        return genai.GenerativeModel(model_name=model_name, generation_config=generation_config)
    except Exception as exc:
        print(f"Error inicializando modelo de Gemini {model_name}: {exc}")
        raise HTTPException(
            status_code=502,
            detail="No se pudo inicializar el modelo de Gemini. Revisa la API key, permisos y cuota.",
        )


def sse_event(payload: dict) -> str:
    """Devuelve un evento SSE formateado."""
    return f"data: {json.dumps(payload)}\n\n"


def detect_language_hint(message: str) -> str:
    """
    Detecta el idioma del usuario con alta precisión para asegurar respuestas consistentes.
    Usa múltiples estrategias: palabras clave, caracteres especiales, patrones gramaticales.
    """
    message_lower = message.lower().strip()
    
    # Si el mensaje es muy corto, analizar con más cuidado
    words = message_lower.split()
    
    # === ESTRATEGIA 1: Palabras clave MUY específicas por idioma ===
    
    # ESPAÑOL - palabras únicas del español (ampliado y con mayor peso)
    spanish_unique = [
        'qué', 'cómo', 'cuál', 'dónde', 'cuándo', 'porque', 'también', 'además', 
        'hola', 'gracias', 'por favor', 'sí', 'señor', 'muy', 'más', 'está', 
        'hacer', 'tiene', 'puede', 'quiero', 'necesito', 'ayuda', 'explicar',
        'información', 'dame', 'dime', 'muéstrame', 'año', 'día', 'vez',
        'tan', 'bueno', 'malo', 'mejor', 'peor', 'aquí', 'allí', 'ahora',
        'luego', 'después', 'antes', 'siempre', 'nunca', 'algo', 'nada',
        'todo', 'cada', 'otro', 'mismo', 'ese', 'este', 'aquel', 'mi', 'tu',
        'su', 'nuestro', 'vuestro', 'ser', 'estar', 'haber', 'tener', 'ir'
    ]
    
    # INGLÉS - palabras únicas del inglés
    english_unique = [
        'the', 'what', 'how', 'where', 'when', 'why', 'which', 'who',
        'hello', 'hi', 'hey', 'thanks', 'please', 'yes', 'can', 'could',
        'would', 'should', 'will', 'have', 'has', 'does', 'did', 'are',
        'were', 'been', 'being', 'their', 'there', 'they', 'this', 'that',
        'these', 'those', 'with', 'from', 'about', 'into', 'through'
    ]
    
    # FRANCÉS - palabras únicas del francés
    french_unique = [
        'quoi', 'comment', 'quel', 'où', 'quand', 'pourquoi', 'qui',
        'bonjour', 'merci', 's\'il', 'oui', 'non', 'avec', 'pour',
        'dans', 'sur', 'je', 'tu', 'nous', 'vous', 'ils', 'elle',
        'est', 'sont', 'avoir', 'être', 'faire', 'aller'
    ]
    
    # ALEMÁN - palabras únicas del alemán
    german_unique = [
        'was', 'wie', 'wo', 'wann', 'warum', 'welche', 'wer',
        'hallo', 'danke', 'bitte', 'ja', 'nein', 'mit', 'für',
        'der', 'die', 'das', 'ein', 'eine', 'ich', 'du', 'wir',
        'ist', 'sind', 'haben', 'sein', 'werden', 'können'
    ]
    
    # PORTUGUÉS - palabras únicas del portugués  
    portuguese_unique = [
        'que', 'como', 'qual', 'onde', 'quando', 'por que', 'quem',
        'olá', 'obrigado', 'por favor', 'sim', 'não', 'com', 'para',
        'você', 'está', 'são', 'tem', 'pode', 'fazer', 'ser'
    ]
    
    # ITALIANO - palabras únicas del italiano
    italian_unique = [
        'cosa', 'come', 'dove', 'quando', 'perché', 'quale', 'chi',
        'ciao', 'grazie', 'per favore', 'sì', 'no', 'con', 'per',
        'è', 'sono', 'hai', 'può', 'fare', 'essere', 'andare'
    ]
    
    # === ESTRATEGIA 2: Contar coincidencias exactas ===
    scores = {
        'spanish': 0,
        'english': 0,
        'french': 0,
        'german': 0,
        'portuguese': 0,
        'italian': 0
    }
    
    # Buscar palabras completas (no subcadenas)
    import re
    
    for word in spanish_unique:
        if re.search(r'\b' + re.escape(word) + r'\b', message_lower):
            scores['spanish'] += 3  # Aumentado de 2 a 3 para dar prioridad a español
    
    for word in english_unique:
        if re.search(r'\b' + re.escape(word) + r'\b', message_lower):
            scores['english'] += 2
    
    for word in french_unique:
        if re.search(r'\b' + re.escape(word) + r'\b', message_lower):
            scores['french'] += 2
    
    for word in german_unique:
        if re.search(r'\b' + re.escape(word) + r'\b', message_lower):
            scores['german'] += 2
    
    for word in portuguese_unique:
        if word in message_lower:  # 'por que' tiene espacio
            scores['portuguese'] += 1  # Reducido de 2 a 1 para evitar falsos positivos
    
    for word in italian_unique:
        if re.search(r'\b' + re.escape(word) + r'\b', message_lower):
            scores['italian'] += 2
    
    # === ESTRATEGIA 3: Caracteres especiales (muy confiable) ===
    if any(char in message for char in ['ñ', 'á', 'é', 'í', 'ó', 'ú', '¿', '¡']):
        scores['spanish'] += 10  # Peso muy alto
    
    if any(char in message for char in ['à', 'â', 'è', 'ê', 'ë', 'î', 'ï', 'ô', 'ù', 'û', 'ÿ', 'æ', 'œ', 'ç']):
        scores['french'] += 10
    
    if any(char in message for char in ['ä', 'ö', 'ü', 'ß']):
        scores['german'] += 10
    
    if any(char in message for char in ['ã', 'õ', 'ç']):
        # Distinguir entre portugués y francés
        if 'ã' in message or 'õ' in message:
            scores['portuguese'] += 10
        else:
            scores['french'] += 5
    
    # === ESTRATEGIA 4: Patrones gramaticales específicos ===
    
    # Español: artículos y preposiciones
    spanish_patterns = [r'\bel\b', r'\bla\b', r'\blos\b', r'\blas\b', r'\bdel\b', r'\bal\b', r'\bpor\b', r'\bpara\b', r'\bcon\b']
    for pattern in spanish_patterns:
        if re.search(pattern, message_lower):
            scores['spanish'] += 1
    
    # Inglés: artículos y auxiliares
    english_patterns = [r'\bthe\b', r'\ba\b', r'\ban\b', r'\bis\b', r'\bare\b', r'\bwas\b', r'\bwere\b', r'\bdo\b', r'\bdoes\b']
    for pattern in english_patterns:
        if re.search(pattern, message_lower):
            scores['english'] += 1
    
    # === ESTRATEGIA 5: Mensajes muy cortos (1-2 palabras) ===
    if len(words) <= 2:
        # Detectar saludos específicos
        if message_lower in ['hola', 'buenos días', 'buenas tardes', 'buenas noches', 'hey', 'qué tal']:
            scores['spanish'] += 15
        elif message_lower in ['hi', 'hey', 'hello', 'sup', 'yo']:
            scores['english'] += 15
        elif message_lower in ['bonjour', 'salut', 'bonsoir']:
            scores['french'] += 15
        elif message_lower in ['hallo', 'guten tag', 'guten morgen']:
            scores['german'] += 15
        elif message_lower in ['olá', 'oi', 'bom dia']:
            scores['portuguese'] += 15
        elif message_lower in ['ciao', 'buongiorno', 'buonasera']:
            scores['italian'] += 15
    
    # === DECISIÓN FINAL ===
    print(f"🔍 Detección de idioma para: '{message}'")
    print(f"   Scores: {scores}")
    
    max_score = max(scores.values())
    
    if max_score > 0:
        detected = max(scores, key=scores.get)
        
        language_instructions = {
            'spanish': '''
═══════════════════════════════════════════════════════════════
🇪🇸 INSTRUCCIÓN CRÍTICA OBLIGATORIA DE IDIOMA 🇪🇸
═══════════════════════════════════════════════════════════════

El usuario escribió su mensaje en ESPAÑOL.

🔴 REGLAS ABSOLUTAS (NO NEGOCIABLES):
1. Tu respuesta COMPLETA debe ser 100% en español
2. CADA palabra, CADA frase, CADA oración: español
3. NO uses NINGUNA palabra en inglés, francés, alemán u otro idioma
4. NO traduzcas términos técnicos al inglés
5. Si hay código o comandos, los comentarios deben ser en español
6. Términos matemáticos: en español (por ejemplo: "ecuación", "solución", "variable")
7. Si mencionas conceptos técnicos: explica en español

⚠️ ERRORES COMUNES A EVITAR:
❌ NO escribas "solve" → ✅ USA "resolver"
❌ NO escribas "equation" → ✅ USA "ecuación"  
❌ NO escribas "solution" → ✅ USA "solución"
❌ NO mezcles: "El solve de la ecuación..." → ✅ USA "La solución de la ecuación..."

🎯 VERIFICACIÓN:
Antes de enviar tu respuesta, verifica que CADA palabra sea español puro.
Si encuentras una palabra en otro idioma, reemplázala por su equivalente español.

═══════════════════════════════════════════════════════════════
''',
            'english': '''
═══════════════════════════════════════════════════════════════
🇬🇧 CRITICAL MANDATORY LANGUAGE INSTRUCTION 🇬🇧
═══════════════════════════════════════════════════════════════

The user wrote their message in ENGLISH.

🔴 ABSOLUTE RULES (NON-NEGOTIABLE):
1. Your COMPLETE response must be 100% in English
2. EVERY word, EVERY phrase, EVERY sentence: English
3. DO NOT use ANY words in Spanish, French, German or other languages
4. DO NOT translate technical terms to Spanish
5. If there's code or commands, comments must be in English
6. Mathematical terms: in English (e.g., "equation", "solution", "variable")
7. If you mention technical concepts: explain in English

⚠️ COMMON MISTAKES TO AVOID:
❌ DO NOT write "resolver" → ✅ USE "solve"
❌ DO NOT write "ecuación" → ✅ USE "equation"
❌ DO NOT write "solución" → ✅ USE "solution"
❌ DO NOT mix: "The resolver of the equation..." → ✅ USE "The solution of the equation..."

🎯 VERIFICATION:
Before sending your response, verify that EVERY word is pure English.
If you find a word in another language, replace it with its English equivalent.

═══════════════════════════════════════════════════════════════
''',
            'french': '''
═══════════════════════════════════════════════════════════════
🇫🇷 INSTRUCTION CRITIQUE OBLIGATOIRE DE LANGUE 🇫🇷
═══════════════════════════════════════════════════════════════

L'utilisateur a écrit son message en FRANÇAIS.

🔴 RÈGLES ABSOLUES (NON NÉGOCIABLES):
1. Votre réponse COMPLÈTE doit être 100% en français
2. CHAQUE mot, CHAQUE phrase: français
3. N'utilisez AUCUN mot en anglais, espagnol, allemand ou autre langue
4. Ne traduisez PAS les termes techniques en anglais
5. Si code ou commandes, les commentaires doivent être en français

═══════════════════════════════════════════════════════════════
''',
            'german': '''
═══════════════════════════════════════════════════════════════
🇩🇪 KRITISCHE VERBINDLICHE SPRACH ANWEISUNG 🇩🇪
═══════════════════════════════════════════════════════════════

Der Benutzer hat seine Nachricht auf DEUTSCH geschrieben.

🔴 ABSOLUTE REGELN (NICHT VERHANDELBAR):
1. Ihre VOLLSTÄNDIGE Antwort muss 100% auf Deutsch sein
2. JEDES Wort, JEDER Satz: Deutsch
3. Verwenden Sie KEINE Wörter auf Englisch, Spanisch oder anderen Sprachen

═══════════════════════════════════════════════════════════════
''',
            'portuguese': '''
═══════════════════════════════════════════════════════════════
🇧🇷 INSTRUÇÃO CRÍTICA OBRIGATÓRIA DE IDIOMA 🇧🇷
═══════════════════════════════════════════════════════════════

O usuário escreveu sua mensagem em PORTUGUÊS.

🔴 REGRAS ABSOLUTAS (NÃO NEGOCIÁVEIS):
1. Sua resposta COMPLETA deve ser 100% em português
2. CADA palavra, CADA frase: português
3. NÃO use NENHUMA palavra em inglês, espanhol ou outros idiomas

═══════════════════════════════════════════════════════════════
''',
            'italian': '''
═══════════════════════════════════════════════════════════════
🇮🇹 ISTRUZIONE CRITICA OBBLIGATORIA SULLA LINGUA 🇮🇹
═══════════════════════════════════════════════════════════════

L'utente ha scritto il suo messaggio in ITALIANO.

🔴 REGOLE ASSOLUTE (NON NEGOZIABILI):
1. La tua risposta COMPLETA deve essere 100% in italiano
2. OGNI parola, OGNI frase: italiano
3. NON usare NESSUNA parola in inglese, spagnolo o altre lingue

═══════════════════════════════════════════════════════════════
'''
        }
        
        # === ESTRATEGIA 6: Desempate español vs portugués ===
        # Si español y portugués tienen puntajes cercanos (diferencia <= 3), priorizar español
        if abs(scores['spanish'] - scores['portuguese']) <= 3 and scores['spanish'] > 0:
            detected = 'spanish'
            print(f"   ⚖️ Desempate español/portugués → priorizando SPANISH")
        
        print(f"   ✅ Idioma detectado: {detected.upper()} (confianza: {max_score})")
        return language_instructions[detected]
    
    # Si no hay suficiente información, usar español por defecto (ya que el usuario mencionó errores en español)
    print(f"   ⚠️ No hay suficiente información, usando español por defecto")
    return '''
═══════════════════════════════════════════════════════════════
🌍 INSTRUCCIÓN DE IDIOMA POR DEFECTO 🌍
═══════════════════════════════════════════════════════════════

Responde en ESPAÑOL (idioma predeterminado).
TODAS las palabras deben estar en español.
NO mezcles inglés, francés u otros idiomas.

═══════════════════════════════════════════════════════════════
'''

# Helpers restaurados

def generate_conversation_title(message: str, model) -> str:
    """Genera un título breve y relevante para la conversación"""
    try:
        prompt = (
            f"""Basándote en el siguiente mensaje, genera un título breve, relevante y conciso (máximo 6 palabras) que capture la esencia del tema:\n\n"
            f"Mensaje: \"{message}\"\n\n"
            "Responde SOLO con el título, sin comillas ni explicaciones adicionales."""
        )
        response = model.generate_content(prompt)
        title = response.text.strip().strip('"').strip("'")
        return title[:60]
    except Exception as e:
        print(f"Error generando título: {e}")
        return "Nueva conversación"


def process_images(image_data_list: List[str]) -> List[Image.Image]:
    """Procesa imágenes en base64 y las convierte a objetos PIL Image con optimización."""
    images = []
    for idx, img_data in enumerate(image_data_list, 1):
        try:
            if "," in img_data:
                img_data = img_data.split(",")[1]
            img_bytes = base64.b64decode(img_data)
            img = Image.open(io.BytesIO(img_bytes))
            
            # Información de la imagen para mejor contexto
            print(f"Imagen {idx}: {img.format} - {img.size} - Modo: {img.mode}")
            
            # Optimizar imágenes muy grandes (reducir sin perder calidad significativa)
            max_size = 2048
            if img.width > max_size or img.height > max_size:
                ratio = min(max_size / img.width, max_size / img.height)
                new_size = (int(img.width * ratio), int(img.height * ratio))
                img = img.resize(new_size, Image.Resampling.LANCZOS)
                print(f"  → Imagen redimensionada a {new_size} para mejor procesamiento")
            
            images.append(img)
        except Exception as e:
            print(f"Error procesando imagen {idx}: {e}")
    return images


def detect_math_problem(message: str, has_images: bool = False) -> tuple[bool, str]:
    """
    Detecta si el mensaje contiene un problema matemático.
    Retorna (es_problema_matematico, instrucción_especializada)
    """
    message_lower = message.lower().strip()
    
    # Palabras clave que indican problemas matemáticos
    math_keywords = [
        # Español
        'resuelve', 'resolver', 'calcula', 'calcular', 'soluciona', 'ecuación', 'ecuacion',
        'derivada', 'integral', 'límite', 'limite', 'función', 'funcion', 'grafica', 'gráfica',
        'suma', 'resta', 'multiplica', 'divide', 'raíz', 'raiz', 'potencia', 'exponente',
        'matriz', 'determinante', 'vector', 'algebra', 'álgebra', 'geometría', 'geometria',
        'trigonometría', 'trigonometria', 'cálculo', 'calculo', 'probabilidad', 'estadística',
        'estadistica', 'formula', 'fórmula', 'teorema', 'demostración', 'demostracion',
        
        # Inglés
        'solve', 'calculate', 'equation', 'derivative', 'integral', 'limit', 'function',
        'graph', 'sum', 'subtract', 'multiply', 'divide', 'root', 'power', 'exponent',
        'matrix', 'determinant', 'vector', 'algebra', 'geometry', 'trigonometry',
        'calculus', 'probability', 'statistics', 'formula', 'theorem', 'proof',
        
        # Operaciones
        '+', '-', '×', '÷', '=', '≠', '≈', '≤', '≥', '<', '>',
        'sin', 'cos', 'tan', 'log', 'ln', 'sqrt', '∫', '∑', '∏', 'π', '∞'
    ]
    
    # Patrones matemáticos (regex)
    math_patterns = [
        r'\d+\s*[\+\-\*\/×÷]\s*\d+',  # Operaciones básicas: 5 + 3, 10 * 2
        r'\d+\^\d+',  # Potencias: 2^3
        r'[xy]\s*[\+\-\*\/]\s*\d+',  # Variables: x + 5, y - 2
        r'\d+[xy]',  # Coeficientes: 3x, 5y
        r'[a-z]\([xy]\)',  # Funciones: f(x), g(y)
        r'√\d+',  # Raíces: √16
        r'\d+°',  # Ángulos: 45°
        r'\d+/\d+',  # Fracciones: 3/4
        r'[xy]=',  # Ecuaciones: x=, y=
    ]
    
    is_math = False
    confidence = 0
    
    # Verificar palabras clave
    for keyword in math_keywords:
        if keyword in message_lower:
            confidence += 2
            is_math = True
    
    # Verificar patrones
    for pattern in math_patterns:
        if re.search(pattern, message):
            confidence += 3
            is_math = True
    
    # Si hay imágenes, es muy probable que sea un problema matemático si hay algún indicador
    if has_images and confidence > 0:
        confidence += 5
        is_math = True
    
    print(f"🔢 Detección matemática: {'SÍ' if is_math else 'NO'} (confianza: {confidence})")
    
    if is_math:
        math_instruction = """
[MODO MATEMÁTICO ACTIVADO - PRECISIÓN MÁXIMA]

🎯 INSTRUCCIONES CRÍTICAS PARA PROBLEMAS MATEMÁTICOS:

1. **ANÁLISIS DE IMAGEN** (si hay imágenes):
   - Lee CUIDADOSAMENTE cada símbolo, número, operación y diagrama
   - Identifica el tipo de problema (álgebra, cálculo, geometría, trigonometría, etc.)
   - Detecta ecuaciones, gráficos, tablas, diagramas y notación matemática
   - NO asumas información que no esté visible en la imagen

2. **RESOLUCIÓN PASO A PASO**:
   - Muestra CADA paso del proceso de resolución
   - Explica el RAZONAMIENTO detrás de cada operación
   - Usa notación matemática clara y correcta
   - Numera los pasos: Paso 1, Paso 2, etc.

3. **FORMATO DE RESPUESTA**:
   ```
   📊 PROBLEMA:
   [Descripción clara del problema]
   
   📝 SOLUCIÓN:
   
   **Paso 1:** [Explicación]
   [Operación matemática]
   
   **Paso 2:** [Explicación]
   [Operación matemática]
   
   ...
   
   ✅ RESPUESTA FINAL:
   [Resultado claro y destacado]
   
   💡 VERIFICACIÓN:
   [Comprobación opcional del resultado]
   ```

4. **REGLAS DE PRECISIÓN**:
   - NO redondees a menos que se especifique
   - Muestra fracciones en su forma más simple
   - Indica unidades de medida cuando corresponda
   - Si hay múltiples soluciones, menciónalas TODAS
   - Si el problema está mal planteado, indícalo claramente

5. **EXPLICACIONES ADICIONALES**:
   - Explica conceptos matemáticos relevantes
   - Menciona teoremas o propiedades utilizadas
   - Da consejos para problemas similares
   - Si es apropiado, sugiere métodos alternativos

6. **CASOS ESPECIALES**:
   - **Geometría**: Dibuja conclusiones sobre ángulos, áreas, volúmenes
   - **Cálculo**: Explica límites, derivadas, integrales con detalle
   - **Álgebra**: Simplifica expresiones completamente
   - **Trigonometría**: Usa identidades cuando sea útil
   - **Estadística**: Muestra cálculos intermedios

⚠️ IMPORTANTE: 
- Si la imagen es de mala calidad, menciona qué no puedes leer claramente
- Si falta información para resolver, indica qué datos adicionales necesitas
- Prioriza CLARIDAD y PRECISIÓN sobre velocidad

¡Resuelve con la precisión de un matemático experto!
"""
        return True, math_instruction
    
    return False, ""


def extract_text_from_pdf(file_bytes: bytes, filename: str) -> str:
    """Extrae texto de un archivo PDF."""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        text_parts = []
        for page_num, page in enumerate(pdf_reader.pages, 1):
            page_text = page.extract_text()
            if page_text.strip():
                text_parts.append(f"--- Página {page_num} ---\n{page_text}")
        
        if not text_parts:
            return f"⚠️ No se pudo extraer texto del PDF '{filename}' (puede estar protegido o contener solo imágenes)"
        
        full_text = "\n\n".join(text_parts)
        print(f"✓ PDF '{filename}': {len(pdf_reader.pages)} páginas, {len(full_text)} caracteres extraídos")
        return f"📄 Contenido del archivo '{filename}':\n\n{full_text}"
    except Exception as e:
        error_msg = f"❌ Error al procesar PDF '{filename}': {str(e)}"
        print(error_msg)
        return error_msg


def extract_text_from_docx(file_bytes: bytes, filename: str) -> str:
    """Extrae texto de un archivo Word (.docx)."""
    try:
        doc = DocxDocument(io.BytesIO(file_bytes))
        paragraphs = []
        for para in doc.paragraphs:
            if para.text.strip():
                paragraphs.append(para.text)
        
        if not paragraphs:
            return f"⚠️ El documento Word '{filename}' parece estar vacío"
        
        full_text = "\n\n".join(paragraphs)
        print(f"✓ DOCX '{filename}': {len(paragraphs)} párrafos, {len(full_text)} caracteres extraídos")
        return f"📝 Contenido del documento '{filename}':\n\n{full_text}"
    except Exception as e:
        error_msg = f"❌ Error al procesar Word '{filename}': {str(e)}"
        print(error_msg)
        return error_msg


def extract_text_from_excel(file_bytes: bytes, filename: str) -> str:
    """Extrae datos de un archivo Excel (.xlsx, .xls)."""
    try:
        workbook = openpyxl.load_workbook(io.BytesIO(file_bytes))
        sheets_data = []
        
        for sheet_name in workbook.sheetnames:
            sheet = workbook[sheet_name]
            rows = []
            for row in sheet.iter_rows(values_only=True):
                row_text = "\t".join([str(cell) if cell is not None else "" for cell in row])
                if row_text.strip():
                    rows.append(row_text)
            
            if rows:
                sheets_data.append(f"--- Hoja: {sheet_name} ---\n" + "\n".join(rows))
        
        if not sheets_data:
            return f"⚠️ El archivo Excel '{filename}' parece estar vacío"
        
        full_text = "\n\n".join(sheets_data)
        print(f"✓ XLSX '{filename}': {len(workbook.sheetnames)} hojas, {len(full_text)} caracteres extraídos")
        return f"📊 Contenido del archivo '{filename}':\n\n{full_text}"
    except Exception as e:
        error_msg = f"❌ Error al procesar Excel '{filename}': {str(e)}"
        print(error_msg)
        return error_msg


def extract_text_from_txt(file_bytes: bytes, filename: str) -> str:
    """Extrae texto de un archivo de texto plano."""
    try:
        # Intentar decodificar con múltiples encodings
        encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        text = None
        for encoding in encodings:
            try:
                text = file_bytes.decode(encoding)
                break
            except:
                continue
        
        if text is None:
            return f"⚠️ No se pudo decodificar el archivo de texto '{filename}'"
        
        text = text.strip()
        if not text:
            return f"⚠️ El archivo de texto '{filename}' está vacío"
        
        print(f"✓ TXT '{filename}': {len(text)} caracteres extraídos")
        return f"📃 Contenido del archivo '{filename}':\n\n{text}"
    except Exception as e:
        error_msg = f"❌ Error al procesar TXT '{filename}': {str(e)}"
        print(error_msg)
        return error_msg


def process_document_files(files: List[dict]) -> str:
    """Procesa una lista de archivos y extrae su contenido como texto."""
    if not files:
        return ""
    
    documents_text = []
    for idx, file_info in enumerate(files, 1):
        filename = file_info.get("name", f"archivo_{idx}")
        file_type = file_info.get("type", "")
        file_data = file_info.get("data", "")
        
        if not file_data:
            print(f"⚠️ Archivo '{filename}' sin datos")
            continue
        
        try:
            # Decodificar base64
            if "," in file_data:
                file_data = file_data.split(",")[1]
            file_bytes = base64.b64decode(file_data)
            
            # Determinar tipo de archivo y extraer contenido
            filename_lower = filename.lower()
            if filename_lower.endswith('.pdf') or 'pdf' in file_type.lower():
                documents_text.append(extract_text_from_pdf(file_bytes, filename))
            elif filename_lower.endswith('.docx') or 'word' in file_type.lower():
                documents_text.append(extract_text_from_docx(file_bytes, filename))
            elif filename_lower.endswith(('.xlsx', '.xls')) or 'excel' in file_type.lower() or 'spreadsheet' in file_type.lower():
                documents_text.append(extract_text_from_excel(file_bytes, filename))
            elif filename_lower.endswith('.txt') or 'text/plain' in file_type.lower():
                documents_text.append(extract_text_from_txt(file_bytes, filename))
            else:
                documents_text.append(f"⚠️ Tipo de archivo no soportado: '{filename}' ({file_type})")
                print(f"⚠️ Tipo no soportado: {filename} ({file_type})")
        
        except Exception as e:
            error_msg = f"❌ Error procesando '{filename}': {str(e)}"
            documents_text.append(error_msg)
            print(error_msg)
    
    if not documents_text:
        return ""
    
    return "\n\n" + "="*80 + "\n" + "\n\n".join(documents_text) + "\n" + "="*80 + "\n\n"

# Reglas de memoria y continuidad de conversación
MEMORY_INSTRUCTION = (
    """
Si el usuario responde únicamente con una afirmación o confirmación breve (por ejemplo: "sí", "ok", "claro", "vale", "adelante", "por favor"), interpreta que desea continuar con el tema sobre el que preguntaste en tu último mensaje.
- En ese caso, profundiza automáticamente en el tema relevante (detalles, ejemplos prácticos, prevención, recomendaciones, pasos siguientes, etc.).
- Mantén el estilo profesional, organizado y conciso.
- No preguntes de nuevo si ya existe suficiente contexto; entrega la información directamente.
"""
)


def is_affirmative(message: str) -> bool:
    """Detecta confirmaciones breves comunes para continuar el tema."""
    if not message:
        return False
    text = message.strip().lower()
    affirmatives = {
        "si", "sí", "ok", "vale", "claro", "de acuerdo", "afirmativo",
        "por favor", "adelante", "continuar", "procede", "vamos",
        "yes", "yep", "yeah", "sure", "please"
    }
    # También cubrimos frases cortas típicas
    return text in affirmatives or text.startswith("si ") or text.startswith("sí ")


def build_context_from_history(conversation_id: str, max_messages: int = 20) -> str:
    """Construye un texto de contexto enriquecido y detallado del historial de conversación."""
    try:
        if conversation_id not in conversations or not conversations[conversation_id]:
            return ""
        history = conversations[conversation_id][-max_messages:]
        lines = []
        lines.append("=== HISTORIAL DE LA CONVERSACIÓN ACTUAL ===")
        lines.append("(El siguiente es el contexto completo de esta conversación para mantener coherencia y continuidad)\n")
        
        for idx, msg in enumerate(history, 1):
            role = msg.get("role", "user")
            content = msg.get("content", "")
            timestamp = msg.get("timestamp", "")
            
            # Información adicional si existe
            has_images = msg.get("has_images", False)
            has_files = msg.get("has_files", False)
            
            if role == "user":
                prefix = f"[Mensaje {idx}] Usuario"
                if has_images:
                    prefix += " (con imágenes)"
                if has_files:
                    prefix += " (con archivos)"
                lines.append(f"{prefix} ({timestamp}):")
                lines.append(f"  {content}\n")
            else:
                lines.append(f"[Mensaje {idx}] Tu respuesta ({timestamp}):")
                # Resumen de respuestas largas
                if len(content) > 500:
                    lines.append(f"  {content[:500]}... [respuesta completa disponible]\n")
                else:
                    lines.append(f"  {content}\n")
        
        lines.append("=== FIN DEL HISTORIAL ===")
        lines.append("Usa este contexto para dar respuestas coherentes y que den continuidad a la conversación.\n")
        return "\n".join(lines)
    except Exception as e:
        print(f"Error construyendo contexto: {e}")
        return ""

# NUEVO: contexto global a partir de conversaciones previas
def build_global_context_from_all_conversations(current_message: str, max_conversations: int = 5, max_messages_per_conv: int = 2) -> str:
    """Construye un contexto global breve usando conversaciones recientes.

    Ordena las conversaciones por updated_at y toma los últimos mensajes del usuario
    para ofrecer contexto ligero en nuevas sesiones.
    """
    try:
        if not conversation_meta or not conversations:
            return ""
        items = []
        for cid, meta in conversation_meta.items():
            items.append({
                "id": cid,
                "title": meta.get("title") or "Nueva conversación",
                "updated_at": meta.get("updated_at") or meta.get("created_at") or "",
            })
        items.sort(key=lambda x: x["updated_at"], reverse=True)
        lines = []
        for item in items[:max_conversations]:
            cid = item["id"]
            title = item["title"]
            lines.append(f"- Conversación previa: {title} (ID: {cid})")
            msgs = conversations.get(cid, [])
            count = 0
            for msg in reversed(msgs):
                if msg.get("role") == "user":
                    content = msg.get("content", "").strip()
                    if content:
                        lines.append(f"  • Último usuario: {content}")
                        count += 1
                if count >= max_messages_per_conv:
                    break
        return "\n".join(lines)
    except Exception:
        return ""

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "message": "Macrobat AI Backend API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "/chat": "POST - Enviar mensaje al chat",
            "/chat/stream": "POST - Enviar mensaje con streaming SSE",
            "/title": "POST - Generar título para un mensaje",
            "/health": "GET - Estado del servicio",
            "/conversations": "GET - Listar conversaciones",
        },
    }

@app.get("/health")
async def health_check():
    """Verificar estado del servicio"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatMessage):
    """Endpoint principal para chat con IA (respuesta completa)"""
    ensure_gemini_ready()
    try:
        model_config = {
            "temperature": 0.75,
            "top_p": 0.9,
            "top_k": 40,
            "max_output_tokens": 8192,
        }
        if request.mode == "DeepSearch":
            model_config["temperature"] = 0.3
        elif request.mode == "Create Images":
            model_config["temperature"] = 0.9
        elif request.mode == "DeepThink":
            model_config["temperature"] = 0.7
            model_config["max_output_tokens"] = 12000

        model = build_gemini_model(
            model_name="gemini-2.0-flash-lite",
            generation_config=model_config,
        )

        conversation_id = request.conversation_id or f"conv_{datetime.now().timestamp()}"
        if conversation_id not in conversations:
            conversations[conversation_id] = []
            if conversation_id not in conversation_meta:
                conversation_meta[conversation_id] = {
                    "title": None,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "count": 0,
                }

        # Preparar contexto de modo
        mode_context = ""
        if request.mode == "DeepThink":
            mode_context = (
                """
[MODO: DEEP THINK ACTIVADO]

⚠️ INSTRUCCIÓN CRÍTICA: DEBES mostrar el proceso completo antes de responder.

FORMATO OBLIGATORIO (SIN EMOJIS, SOLO MARCADORES):
1. Inicia con: "[LOADING] Iniciando Deep Think... Cargando análisis..."
2. Muestra 5 pasos numerados:
   - Cada paso empieza con: "[STEP-X] Paso X: [descripción]"
   - Cada paso termina con: "[DONE]"
   - Describe como si estuvieras procesando EN TIEMPO REAL
3. Cierra con: "[COMPLETE] Deep Think finalizado! Ahora, la respuesta..."
4. Luego entrega la respuesta principal
"""
            )
        elif request.mode == "DeepSearch":
            mode_context = (
                "\n[MODO: BÚSQUEDA PROFUNDA - Razona paso a paso y proporciona información detallada con fuentes]\n"
            )
        elif request.mode == "Create Images":
            mode_context = (
                "\n[MODO: CREACIÓN DE IMÁGENES - Proporciona descripciones detalladas y creativas para generación de imágenes]\n"
            )
        elif request.mode == "How to":
            mode_context = "\n[MODO: TUTORIAL - Instrucciones paso a paso]\n"
        elif request.mode == "Latest News":
            mode_context = "\n[MODO: NOTICIAS - Información actualizada y relevante]\n"
        elif request.mode == "Personas":
            mode_context = "\n[MODO: INFORMACIÓN PERSONAL - Tono y contenido adaptado]\n"

        # Construir contexto de conversación + entrada del usuario
        history_text = build_context_from_history(conversation_id)
        global_context = ""
        if not request.conversation_id:
            global_context = build_global_context_from_all_conversations(request.message)
        
        # Detectar idioma del usuario
        language_hint = detect_language_hint(request.message)
        
        # Detectar si es un problema matemático
        has_images = request.images and len(request.images) > 0
        is_math, math_instruction = detect_math_problem(request.message, has_images)
        
        content = []
        if has_images:
            print(f"📷 Procesando {len(request.images)} imagen(es)...")
            for img in process_images(request.images):
                content.append(img)
            
            # Prompt mejorado para imágenes
            if is_math:
                user_input_text = f"🔢 PROBLEMA MATEMÁTICO EN IMAGEN(ES)\n\nAnaliza DETALLADAMENTE cada imagen y resuelve el problema matemático siguiendo las instrucciones.\n\nPregunta del usuario: {request.message}"
            else:
                user_input_text = f"📸 ANÁLISIS DE IMAGEN(ES)\n\nObserva cuidadosamente la(s) {len(request.images)} imagen(es) proporcionada(s). Describe lo que ves y responde a la pregunta del usuario con precisión.\n\nPregunta: {request.message}"
        else:
            user_input_text = request.message

        follow_up_directive = ""
        if is_affirmative(request.message) and history_text:
            follow_up_directive = (
                """
[SEGUIR TEMA]
El usuario confirmó que desea continuar con el tema tratado previamente.
- Entrega la información directamente ahora, sin hacer nuevas preguntas.
- Cubre: detalles adicionales, ejemplos prácticos, medidas de prevención, recomendaciones, y próximos pasos.
- Mantén organización con secciones y listas claras.
"""
            )

        no_deepthink_directive = ""
        if request.mode != "DeepThink":
            no_deepthink_directive = (
                """
[RESTRICCIÓN]
No muestres el proceso Deep Think ni uses los marcadores [LOADING], [STEP-X], [DONE], [COMPLETE]. Responde directamente siguiendo estilo profesional.
"""
            )

        full_prompt = (
            f"{mode_context}\n{no_deepthink_directive}\n{language_hint}\n{math_instruction if is_math else ''}\n{MEMORY_INSTRUCTION}\n\n[CONTEXTO GLOBAL RELEVANTE]\n{global_context}\n\n[CONTEXTO PREVIO]\n{history_text}\n{follow_up_directive}\n\n[ENTRADA DEL USUARIO]\n{user_input_text}"
        )
        content.append(full_prompt)

        response = model.generate_content(content)
        ai_response = response.text
        if request.mode != "DeepThink":
            # Sanitizar: remover cualquier marcador de DeepThink si se coló accidentalmente
            lines = ai_response.splitlines()
            ai_response = "\n".join(
                [
                    ln
                    for ln in lines
                    if not (
                        "[LOADING]" in ln or "[STEP-" in ln or "[DONE]" in ln or "[COMPLETE]" in ln
                    )
                ]
            )

        title = None
        if len(conversations[conversation_id]) == 0:
            title_model = build_gemini_model(
                model_name="gemini-2.0-flash-lite",
                generation_config={"temperature": 0.5},
            )
            title = generate_conversation_title(
                request.message,
                title_model,
            )
            # Guardar título en metadatos
            meta = conversation_meta.get(conversation_id, {})
            meta["title"] = title or meta.get("title") or "Nueva conversación"
            meta["updated_at"] = datetime.now().isoformat()
            meta["count"] = 0
            conversation_meta[conversation_id] = meta

        conversations[conversation_id].append(
            {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()}
        )
        conversations[conversation_id].append(
            {"role": "assistant", "content": ai_response, "timestamp": datetime.now().isoformat()}
        )
        # Actualizar metadatos
        meta = conversation_meta.get(conversation_id, {})
        meta["updated_at"] = datetime.now().isoformat()
        meta["count"] = len(conversations[conversation_id])
        conversation_meta[conversation_id] = meta

        return ChatResponse(
            response=ai_response,
            title=title,
            conversation_id=conversation_id,
            timestamp=datetime.now().isoformat(),
            mode=request.mode or "chat",
        )
    except Exception as e:
        print(f"Error en chat: {e}")
        # Respuesta de respaldo para evitar 500 en el frontend
        fallback_conv_id = request.conversation_id or f"conv_{datetime.now().timestamp()}"
        if fallback_conv_id not in conversations:
            conversations[fallback_conv_id] = []
        fallback_text = (
            "Temporalmente no puedo generar una respuesta de IA. "
            "Verifica la configuración del backend y las credenciales del proveedor. "
            "Tu mensaje fue recibido y se guardó en el historial."
        )
        conversations[fallback_conv_id].append(
            {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()}
        )
        conversations[fallback_conv_id].append(
            {"role": "assistant", "content": fallback_text, "timestamp": datetime.now().isoformat()}
        )
        # Actualizar metadatos también en fallback
        meta = conversation_meta.get(fallback_conv_id, {})
        if not meta.get("created_at"):
            meta["created_at"] = datetime.now().isoformat()
        meta["title"] = meta.get("title") or "Nueva conversación"
        meta["updated_at"] = datetime.now().isoformat()
        meta["count"] = len(conversations[fallback_conv_id])
        conversation_meta[fallback_conv_id] = meta
        return ChatResponse(
            response=fallback_text,
            title=None,
            conversation_id=fallback_conv_id,
            timestamp=datetime.now().isoformat(),
            mode=request.mode or "chat",
        )

@app.post("/chat/stream")
async def chat_stream(request: ChatMessage):
    """Endpoint para chat con streaming (SSE)"""
    ensure_gemini_ready()
    try:
        async def generate():
            model_config = {
                "temperature": 0.75,
                "top_p": 0.9,
                "top_k": 40,
                "max_output_tokens": 8192,
            }
            if request.mode == "DeepThink":
                model_config["temperature"] = 0.7
                model_config["max_output_tokens"] = 12000

            model = build_gemini_model(
                model_name="gemini-2.0-flash-lite",
                generation_config=model_config,
            )

            conversation_id = request.conversation_id or f"conv_{datetime.now().timestamp()}"
            if conversation_id not in conversations:
                conversations[conversation_id] = []
                if conversation_id not in conversation_meta:
                    conversation_meta[conversation_id] = {
                        "title": None,
                        "created_at": datetime.now().isoformat(),
                        "updated_at": datetime.now().isoformat(),
                        "count": 0,
                    }

            mode_context = ""
            if request.mode == "DeepThink":
                mode_context = (
                    """
[MODO: DEEP THINK ACTIVADO]

⚠️ INSTRUCCIÓN CRÍTICA: DEBES mostrar el proceso completo antes de responder.

FORMATO OBLIGATORIO (SIN EMOJIS, SOLO MARCADORES):
1. Inicia con: "[LOADING] Iniciando Deep Think... Cargando análisis..."
2. Muestra 5 pasos numerados:
   - Cada paso empieza con: "[STEP-X] Paso X: [descripción]"
   - Cada paso termina con: "[DONE]"
   - Describe como si estuvieras procesando EN TIEMPO REAL
3. Cierra con: "[COMPLETE] Deep Think finalizado! Ahora, la respuesta..."
4. Luego entrega la respuesta principal
"""
                )

            # Construir contexto de conversación + entrada del usuario
            history_text = build_context_from_history(conversation_id)
            global_context = ""
            if not request.conversation_id:
                global_context = build_global_context_from_all_conversations(request.message)
            
            # Detectar idioma del usuario
            language_hint = detect_language_hint(request.message)
            
            # Detectar si es un problema matemático
            has_images = request.images and len(request.images) > 0
            is_math, math_instruction = detect_math_problem(request.message, has_images)
            
            # Procesar archivos de documentos si existen
            documents_context = ""
            if request.files and len(request.files) > 0:
                documents_context = process_document_files(request.files)
                print(f"📎 {len(request.files)} archivo(s) procesado(s) para análisis")
            
            content = []
            if has_images:
                print(f"📷 Procesando {len(request.images)} imagen(es) en modo streaming...")
                for img in process_images(request.images):
                    content.append(img)
                
                # Prompt mejorado para imágenes
                if is_math:
                    user_input_text = f"🔢 PROBLEMA MATEMÁTICO EN IMAGEN(ES)\n\nAnaliza DETALLADAMENTE cada imagen y resuelve el problema matemático siguiendo las instrucciones.\n\nPregunta del usuario: {request.message}"
                else:
                    user_input_text = f"📸 ANÁLISIS DE IMAGEN(ES)\n\nObserva cuidadosamente la(s) {len(request.images)} imagen(es) proporcionada(s). Describe lo que ves y responde a la pregunta del usuario con precisión.\n\nPregunta: {request.message}"
            else:
                user_input_text = request.message
            
            # Agregar contexto de documentos si existe
            if documents_context:
                user_input_text = f"{documents_context}\n\nPreguntas/instrucciones del usuario sobre los documentos:\n{user_input_text}"

            follow_up_directive = ""
            if is_affirmative(request.message) and history_text:
                follow_up_directive = (
                    """
[SEGUIR TEMA]
El usuario confirmó que desea continuar con el tema tratado previamente.
- Entrega la información directamente ahora, sin hacer nuevas preguntas.
- Cubre: detalles adicionales, ejemplos prácticos, medidas de prevención, recomendaciones, y próximos pasos.
- Mantén organización con secciones y listas claras.
"""
                )

            no_deepthink_directive = ""
            if request.mode != "DeepThink":
                no_deepthink_directive = (
                    """
[RESTRICCIÓN]
No muestres el proceso Deep Think ni uses los marcadores [LOADING], [STEP-X], [DONE], [COMPLETE]. Responde directamente siguiendo estilo profesional.
"""
                )

            full_prompt = (
                f"{mode_context}\n{no_deepthink_directive}\n{language_hint}\n{math_instruction if is_math else ''}\n{MEMORY_INSTRUCTION}\n\n[CONTEXTO GLOBAL RELEVANTE]\n{global_context}\n\n[CONTEXTO PREVIO]\n{history_text}\n{follow_up_directive}\n\n[ENTRADA DEL USUARIO]\n{user_input_text}"
            )
            content.append(full_prompt)

            title = None
            if len(conversations[conversation_id]) == 0:
                title_model = build_gemini_model(
                    model_name="gemini-2.0-flash-lite",
                    generation_config={"temperature": 0.5},
                )
                title = generate_conversation_title(request.message, title_model)
                # Guardar título en metadatos
                meta = conversation_meta.get(conversation_id, {})
                meta["title"] = title or meta.get("title") or "Nueva conversación"
                meta["updated_at"] = datetime.now().isoformat()
                meta["count"] = 0
                conversation_meta[conversation_id] = meta
                yield sse_event({'type': 'title', 'content': title})

            yield sse_event({'type': 'start', 'conversation_id': conversation_id, 'mode': request.mode})

            full_response = ""
            try:
                response = model.generate_content(content, stream=True)
                for chunk in response:
                    if chunk.text:
                        let_text = chunk.text
                        if request.mode != "DeepThink":
                            # Filtrar marcadores de DeepThink en streaming
                            let_text = "\n".join(
                                [
                                    ln
                                    for ln in let_text.splitlines()
                                    if not (
                                        "[LOADING]" in ln or "[STEP-" in ln or "[DONE]" in ln or "[COMPLETE]" in ln
                                    )
                                ]
                            )
                        full_response += let_text
                        yield sse_event({'type': 'content', 'content': let_text})
                        await asyncio.sleep(0.01)
            except Exception as gen_err:
                # Fallback en caso de error durante el streaming
                fallback_text = (
                    "Temporalmente no puedo generar una respuesta de IA en modo streaming. "
                    "Verifica la configuración del backend y las credenciales del proveedor. "
                    "Tu mensaje fue recibido y se guardó en el historial."
                )
                # Guardar historial mínimo
                conversations[conversation_id].append(
                    {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()}
                )
                conversations[conversation_id].append(
                    {"role": "assistant", "content": fallback_text, "timestamp": datetime.now().isoformat()}
                )
                meta = conversation_meta.get(conversation_id, {})
                meta["updated_at"] = datetime.now().isoformat()
                meta["count"] = len(conversations[conversation_id])
                conversation_meta[conversation_id] = meta
                # Emitir fallback como contenido y finalizar
                yield sse_event({'type': 'content', 'content': fallback_text})
                yield sse_event({'type': 'done', 'conversation_id': conversation_id})
                return

            conversations[conversation_id].append(
                {"role": "user", "content": request.message, "timestamp": datetime.now().isoformat()}
            )
            conversations[conversation_id].append(
                {"role": "assistant", "content": full_response, "timestamp": datetime.now().isoformat()}
            )
            # Actualizar metadatos
            meta = conversation_meta.get(conversation_id, {})
            meta["updated_at"] = datetime.now().isoformat()
            meta["count"] = len(conversations[conversation_id])
            conversation_meta[conversation_id] = meta

            yield sse_event({'type': 'done', 'conversation_id': conversation_id})

        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        print(f"Error en chat streaming: {e}")
        raise HTTPException(status_code=500, detail=f"Error procesando mensaje: {str(e)}")

@app.post("/title", response_model=TitleResponse)
async def generate_title(request: TitleRequest):
    """Generar título para un mensaje"""
    ensure_gemini_ready()
    try:
        model = build_gemini_model(
            model_name="gemini-2.0-flash-lite",
            generation_config={"temperature": 0.5},
        )
        title = generate_conversation_title(request.message, model)
        return TitleResponse(title=title)
    except Exception as e:
        print(f"Error generando título: {e}")
        raise HTTPException(status_code=500, detail=f"Error generando título: {str(e)}")

@app.get("/conversations")
async def list_conversations():
    """Listar metadatos de conversaciones"""
    items = []
    for cid, meta in conversation_meta.items():
        items.append({
            "id": cid,
            "title": meta.get("title") or "Nueva conversación",
            "created_at": meta.get("created_at"),
            "updated_at": meta.get("updated_at"),
            "count": meta.get("count", 0),
        })
    # Ordenar por updated_at desc
    items.sort(key=lambda x: x.get("updated_at") or x.get("created_at") or "", reverse=True)
    return {"conversations": items}

@app.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Obtener historial de una conversación"""
    if conversation_id in conversations:
        title = conversation_meta.get(conversation_id, {}).get("title")
        return {"conversation_id": conversation_id, "title": title, "messages": conversations[conversation_id]}
    else:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

@app.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Eliminar una conversación"""
    if conversation_id in conversations:
        del conversations[conversation_id]
        if conversation_id in conversation_meta:
            del conversation_meta[conversation_id]
        return {"message": "Conversación eliminada", "conversation_id": conversation_id}
    else:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")

@app.post("/deep-search/stream")
async def deep_search_stream(request: ChatMessage):
    """
    Deep Search: Búsqueda profunda con Google Custom Search + análisis con Gemini
    Similar a Perplexity y Grok - Streaming de resultados
    MEJORADO: Sin duplicados, máximo 10 fuentes relevantes, títulos completos
    """
    ensure_google_search_ready()
    ensure_gemini_ready()
    try:
        async def generate():
            conversation_id = request.conversation_id or str(datetime.now().timestamp())
            
            # Paso 1: Indicar inicio de búsqueda (mensaje más visual)
            initial_msg = "Iniciando búsqueda profunda en toda la web..."
            initial_content = initial_msg + "\n"
            yield sse_event({'type': 'search_start', 'content': initial_msg})
            yield sse_event({'type': 'content', 'content': initial_content})
            await asyncio.sleep(0.2)
            
            # Paso 2: Realizar búsqueda en Google (solicitamos 10 resultados)
            searching_msg = "[SEARCHING] 🔍 Explorando múltiples fuentes en internet..."
            searching_content = "\n" + searching_msg + "\n"
            yield sse_event({'type': 'search_step', 'content': searching_msg})
            yield sse_event({'type': 'content', 'content': searching_content})
            await asyncio.sleep(0.2)
            
            search_query = request.message
            # Aumentado a 10 resultados para mejor cobertura
            search_url = f"https://www.googleapis.com/customsearch/v1?key={GOOGLE_SEARCH_API_KEY}&cx={GOOGLE_SEARCH_ENGINE_ID}&q={quote_plus(search_query)}&num=10"
            
            try:
                response = requests.get(search_url, timeout=10)
                search_results = response.json()
            except Exception as e:
                error_desc = f'Error en la búsqueda: {str(e)}'
                yield sse_event({'type': 'error', 'content': error_desc})
                yield sse_event({'type': 'done'})
                return
            
            # Paso 3: Procesar y filtrar resultados (eliminar duplicados)
            sources = []
            seen_urls = set()  # Para evitar duplicados
            seen_domains = {}  # Para limitar resultados por dominio
            
            if "items" in search_results:
                for idx, item in enumerate(search_results["items"], 1):
                    url = item.get("link", "")
                    title = item.get("title", "Sin título")
                    
                    # Extraer dominio
                    try:
                        domain = urlparse(url).netloc
                        # Limpiar www.
                        domain = domain.replace('www.', '')
                    except:
                        domain = "desconocido"
                    
                    # Filtros anti-duplicados:
                    # 1. URL exacta duplicada
                    if url in seen_urls:
                        continue
                    
                    # 2. Mismo dominio más de 2 veces (para diversidad)
                    if domain in seen_domains and seen_domains[domain] >= 2:
                        continue
                    
                    # 3. Títulos muy similares (primeros 50 caracteres)
                    title_prefix = title[:50].lower()
                    is_duplicate_title = any(
                        s['title'][:50].lower() == title_prefix 
                        for s in sources
                    )
                    if is_duplicate_title:
                        continue
                    
                    # Agregar fuente única
                    source = {
                        "title": title,
                        "url": url,
                        "snippet": item.get("snippet", ""),
                        "domain": domain,
                        "index": len(sources) + 1  # Índice secuencial
                    }
                    sources.append(source)
                    seen_urls.add(url)
                    seen_domains[domain] = seen_domains.get(domain, 0) + 1
                    
                    # Limitar a 10 fuentes máximo
                    if len(sources) >= 10:
                        break
                
                # Mensaje de fuentes encontradas
                num_results = len(sources)
                found_msg = f"[FOUND] ✅ {num_results} fuentes relevantes y únicas encontradas"
                found_content = found_msg + '\n'
                yield sse_event({'type': 'search_step', 'content': found_msg})
                yield sse_event({'type': 'content', 'content': found_content})
                await asyncio.sleep(0.2)
                
                # Emitir cada fuente con información completa
                for source in sources:
                    yield sse_event({'type': 'source', 'content': source})
                    await asyncio.sleep(0.05)
            else:
                warning_msg = "[WARNING] No se encontraron resultados"
                warning_content = warning_msg + '\n'
                yield sse_event({'type': 'search_step', 'content': warning_msg})
                yield sse_event({'type': 'content', 'content': warning_content})
            
            # Paso 4: Analizar con Gemini
            analyzing_msg = "[ANALYZING] 🧠 Analizando y sintetizando información..."
            analyzing_content = '\n' + analyzing_msg + '\n'
            yield sse_event({'type': 'search_step', 'content': analyzing_msg})
            yield sse_event({'type': 'content', 'content': analyzing_content})
            await asyncio.sleep(0.3)
            
            # Construir contexto para Gemini
            # Procesar archivos si existen
            documents_context = ""
            if request.files and len(request.files) > 0:
                documents_context = process_document_files(request.files)
                print(f"📎 {len(request.files)} archivo(s) procesado(s) para Deep Search")
            
            context = f"Pregunta del usuario: {search_query}\n\n"
            
            if documents_context:
                context += f"{documents_context}\n\n"
            
            context += "Resultados de búsqueda:\n\n"
            for source in sources:
                context += f"[{source['index']}] {source['title']}\n{source['snippet']}\nURL: {source['url']}\n\n"
            
            # Detectar idioma para respuesta adecuada
            language_hint = detect_language_hint(search_query)
            
            # Prompt para análisis profundo
            analysis_prompt = f"""{context}

{language_hint}

Basándote en los resultados de búsqueda anteriores, proporciona una respuesta completa y bien estructurada a la pregunta del usuario.

INSTRUCCIONES IMPORTANTES:
1. RESPONDE EN EL MISMO IDIOMA que el usuario utilizó en su pregunta
2. Sintetiza la información de TODAS las fuentes
3. Usa un formato profesional tipo Perplexity/ChatGPT
4. Cita las fuentes usando números [1], [2], etc.
5. Organiza la información con:
   - Introducción clara
   - Puntos principales numerados
   - Conclusión o resumen
6. Sé preciso, objetivo y completo
7. Si hay información contradictoria, menciónalo

NO uses emojis. Mantén un tono profesional y académico."""

            # Generar respuesta con Gemini (usando modelo estándar para evitar límites)
            analysis_model = build_gemini_model(
                model_name="gemini-2.0-flash-lite",  # Cambiado de exp a lite para mayor cuota
                generation_config={
                    "temperature": 0.7,
                    "top_p": 0.95,
                    "top_k": 40,
                    "max_output_tokens": 4096,
                },
            )
            
            synthesizing_msg = "[SYNTHESIZING] Generando análisis completo..."
            synthesizing_content = '\n' + synthesizing_msg + '\n\n'
            yield sse_event({'type': 'analysis_start', 'content': synthesizing_msg})
            yield sse_event({'type': 'content', 'content': synthesizing_content})
            await asyncio.sleep(0.3)
            
            # Streaming de la respuesta de Gemini
            full_response = ""
            response_stream = analysis_model.generate_content(analysis_prompt, stream=True)
            
            for chunk in response_stream:
                if chunk.text:
                    full_response += chunk.text
                    yield sse_event({'type': 'content', 'content': chunk.text})
                    await asyncio.sleep(0.01)
            
            # Paso 5: Emitir referencias al final con formato limpio
            refs_start_content = '\n\n---\n'
            yield sse_event({'type': 'content', 'content': refs_start_content})
            
            # Título de referencias simple
            references_title = "**Fuentes consultadas:**\n\n"
            yield sse_event({'type': 'content', 'content': references_title})
            
            # Mostrar fuentes con formato limpio: [1] Título: URL
            for source in sources:
                # Formato simple y limpio
                ref_text = f"[{source['index']}] {source['title']}: {source['url']}\n"
                yield sse_event({'type': 'content', 'content': ref_text})
            
            # Guardar en conversación
            if conversation_id not in conversations:
                conversations[conversation_id] = []
                title = generate_conversation_title(search_query, analysis_model)
                conversation_meta[conversation_id] = {
                    "title": title,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat(),
                    "count": 0
                }
                yield sse_event({'type': 'title', 'content': title})
            
            # Agregar mensaje y respuesta completa con fuentes en formato limpio
            complete_response = full_response + "\n\n---\n**Fuentes consultadas:**\n\n"
            for source in sources:
                complete_response += f"[{source['index']}] {source['title']}: {source['url']}\n"
            
            conversations[conversation_id].append({
                "role": "user",
                "content": search_query,
                "timestamp": datetime.now().isoformat()
            })
            conversations[conversation_id].append({
                "role": "assistant",
                "content": complete_response,
                "timestamp": datetime.now().isoformat(),
                "sources": sources
            })
            
            meta = conversation_meta.get(conversation_id, {})
            meta["updated_at"] = datetime.now().isoformat()
            meta["count"] = len(conversations[conversation_id])
            conversation_meta[conversation_id] = meta
            
            # Finalizar
            yield sse_event({'type': 'done', 'conversation_id': conversation_id})
        
        return StreamingResponse(generate(), media_type="text/event-stream")
    
    except Exception as e:
        print(f"Error en Deep Search: {e}")
        raise HTTPException(status_code=500, detail=f"Error en Deep Search: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

# BACKEND ENDPOINTS RESTORE END
