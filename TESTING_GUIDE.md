# 🧪 Guía de Pruebas - Nuevas Funcionalidades

## 1. 🌍 Prueba de Detección de Idioma Mejorada

### Casos de Prueba en Español

#### Prueba 1: Frase simple
```
Input: "hola"
Esperado: Respuesta completamente en español
```

#### Prueba 2: Pregunta con acentos
```
Input: "¿Qué es Python?"
Esperado: Respuesta en español con vocabulario técnico en español
```

#### Prueba 3: Pregunta técnica
```
Input: "cómo funciona el machine learning"
Esperado: Explicación técnica en español
```

#### Prueba 4: Sin acentos
```
Input: "que es javascript"
Esperado: Respuesta en español (detecta por palabras clave)
```

### Casos de Prueba en Inglés

#### Prueba 1: Saludo
```
Input: "hi"
Esperado: Respuesta completamente en inglés
```

#### Prueba 2: Pregunta técnica
```
Input: "What is machine learning?"
Esperado: Technical explanation in English
```

#### Prueba 3: Frase con artículo
```
Input: "how does the internet work"
Esperado: Response in English
```

### Verificación en Consola

Cuando envíes un mensaje, verás en la terminal del backend:
```
🔍 Detección de idioma para: 'tu mensaje aquí'
   Scores: {'spanish': 14, 'english': 2, 'french': 0, ...}
   ✅ Idioma detectado: SPANISH (confianza: 14)
```

---

## 2. 📎 Prueba de Subida de Documentos

### Preparación

Crea archivos de prueba:

#### 1. Crear `test.txt`
```
Este es un archivo de prueba con información importante.
Python es un lenguaje de programación versátil.
Machine Learning es una rama de la inteligencia artificial.
```

#### 2. Crear documento Word (`test.docx`)
Contenido:
```
Título: Introducción a Python

Python es un lenguaje de programación interpretado.
Características principales:
- Fácil de aprender
- Sintaxis clara
- Gran comunidad
```

#### 3. Usar un PDF existente
Cualquier PDF con texto (no imágenes escaneadas).

### Proceso de Prueba

#### Paso 1: Abrir la aplicación
```
http://localhost:5173
```

#### Paso 2: Buscar el botón de documentos
- Hay dos botones Paperclip
- El **primero** es para imágenes 📷
- El **segundo** es para documentos 📎

#### Paso 3: Subir un archivo
1. Click en el segundo botón Paperclip
2. Selecciona `test.txt`
3. Verás el preview con:
   - Icono 📃
   - Nombre "test.txt"
   - Tamaño en KB

#### Paso 4: Enviar mensaje
```
"Resume el contenido del documento"
```

#### Paso 5: Verificar respuesta
La AI debería:
- ✅ Leer el contenido del archivo
- ✅ Responder en español (si tu mensaje está en español)
- ✅ Incluir información del documento

### Verificación en Backend

En la consola del backend verás:
```
📎 1 archivo(s) procesado(s) para análisis
📄 Extrayendo texto de PDF: test.pdf
   ✅ Extraídos 250 caracteres del PDF
```

---

## 3. 🧠 Prueba de Modos Especiales

### Deep Think
1. Click en el botón cerebro 🧠 (se pone verde)
2. Escribe: "¿Cómo puedo aprender programación desde cero?"
3. Verás el proceso paso a paso:
   ```
   [LOADING] Iniciando Deep Think...
   [STEP-1] Paso 1: Analizando requisitos...
   [DONE]
   [STEP-2] Paso 2: Evaluando opciones...
   ...
   [COMPLETE] Deep Think finalizado!
   ```

### Deep Search
1. Click en el botón lupa 🔍 (se pone verde)
2. Escribe: "últimas noticias sobre inteligencia artificial 2025"
3. Verás:
   - Búsqueda en Google
   - Fuentes encontradas con números [1], [2], etc.
   - Análisis con IA
   - Respuesta con referencias

---

## 4. 📊 Prueba Completa: Documento + Idioma

### Escenario: Analizar documento en español

#### Paso 1: Crear archivo
`analisis_python.txt`:
```
Python es uno de los lenguajes más populares.
Se usa en:
- Desarrollo web (Django, Flask)
- Ciencia de datos (Pandas, NumPy)
- Machine Learning (TensorFlow, PyTorch)
- Automatización de tareas

Ventajas:
- Sintaxis clara y legible
- Gran cantidad de librerías
- Comunidad activa
```

#### Paso 2: Subir y preguntar
1. Adjunta `analisis_python.txt`
2. Mensaje: "¿Cuáles son las principales aplicaciones de Python según el documento?"

#### Paso 3: Verificar
✅ La AI debe:
- Responder en español
- Citar las aplicaciones del documento
- Explicar con ejemplos
- Mantener consistencia en español

---

## 5. 🎨 Prueba de Múltiples Archivos

### Subir varios documentos

#### Archivos:
1. `proyecto.txt` - Descripción del proyecto
2. `requisitos.docx` - Lista de requisitos
3. `presupuesto.xlsx` - Tabla de costos

#### Mensaje:
```
"Analiza estos tres documentos y dame un resumen ejecutivo del proyecto"
```

#### Esperado:
- La AI lee los 3 archivos
- Cruza información entre ellos
- Genera resumen coherente
- Responde en tu idioma

---

## 6. 🔍 Debugging

### Si algo no funciona:

#### Backend no responde
```bash
# Ver logs del backend
# La terminal mostrará errores en tiempo real

# Reiniciar backend
lsof -ti:8000 | xargs kill -9
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Idioma incorrecto
```bash
# Busca en los logs del backend:
🔍 Detección de idioma para: 'tu mensaje'
   Scores: {...}
   
# Si el score es bajo, el mensaje podría ser ambiguo
# Usa palabras más específicas del idioma
```

#### Archivo no se procesa
```bash
# Verifica en logs del backend:
📎 X archivo(s) procesado(s)
📄 Extrayendo texto de...

# Si no aparece, revisa:
- Tamaño del archivo (<10MB)
- Formato soportado (PDF, DOCX, XLSX, TXT)
- Conexión backend-frontend
```

#### Frontend no carga
```bash
# Reiniciar frontend
cd ..
npm run dev

# Limpiar caché
rm -rf node_modules/.vite
npm run dev
```

---

## 7. 📋 Checklist de Funcionalidades

### Idioma
- [ ] Español detectado correctamente
- [ ] Inglés detectado correctamente
- [ ] Respuesta 100% en idioma correcto
- [ ] Sin mezcla de idiomas
- [ ] Logs visibles en consola

### Documentos
- [ ] Botón de adjuntar visible
- [ ] Preview de archivo aparece
- [ ] Icono correcto según tipo
- [ ] Tamaño mostrado correctamente
- [ ] Eliminar archivo funciona
- [ ] Backend procesa el archivo
- [ ] AI lee el contenido
- [ ] Respuesta incluye info del documento

### Modos Especiales
- [ ] Deep Think muestra pasos
- [ ] Deep Search busca en web
- [ ] DeepSearch muestra fuentes
- [ ] Cada modo funciona con documentos

### Integración
- [ ] Documentos + idioma detectado
- [ ] Múltiples archivos procesados
- [ ] Respuestas coherentes
- [ ] UI responsive en móvil

---

## 8. 🎯 Resultados Esperados

### ✅ Funcionamiento Correcto

#### Consola Backend:
```
🔍 Detección de idioma para: '¿qué es python?'
   Scores: {'spanish': 12, 'english': 0, ...}
   ✅ Idioma detectado: SPANISH (confianza: 12)
   
📎 1 archivo(s) procesado(s) para análisis
📃 Leyendo archivo TXT: test.txt
   ✅ Extraídos 150 caracteres del archivo TXT
```

#### UI Frontend:
- Preview de archivo con icono
- Mensaje enviado correctamente
- Respuesta en tiempo real (streaming)
- Idioma consistente en toda la respuesta

---

## 9. 📞 Soporte

Si encuentras problemas:

1. **Revisa logs** en ambas terminales
2. **Verifica archivos** de configuración (.env)
3. **Confirma dependencias** instaladas
4. **Prueba con ejemplos** simples primero

---

**¡Listo para probar! 🚀**

Empieza con las pruebas simples de idioma y luego avanza a documentos.
