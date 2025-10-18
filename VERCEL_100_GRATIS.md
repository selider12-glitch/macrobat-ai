# 🆓 Desplegar Macrobat AI en Vercel - 100% GRATIS

## ✅ Lo que preparé:

- **Frontend + Backend en Vercel** (todo en un solo lugar)
- **Funciones Serverless Python** (FastAPI funciona automáticamente)
- **Configuración lista** para usar

---

## 🎯 PASO A PASO (10 minutos):

### PASO 1: Subir a GitHub (3 minutos)

#### 1.1 Crear repositorio en GitHub
1. Ve a https://github.com/new
2. **Nombre:** `macrobat-ai`
3. **Privacidad:** Público o Privado
4. **NO marques nada** (ni README, ni .gitignore)
5. Click **"Create repository"**

#### 1.2 Subir tu código
```bash
cd "/Users/francismejia/macrobat-ai project"
git remote add origin https://github.com/TU-USUARIO/macrobat-ai.git
git branch -M main
git push -u origin main
```

⚠️ **Reemplaza `TU-USUARIO` con tu usuario de GitHub**

---

### PASO 2: Desplegar en Vercel (7 minutos)

#### 2.1 Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Click en **"Sign Up"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza Vercel

#### 2.2 Importar proyecto
1. Click en **"Add New..."** → **"Project"**
2. Click en **"Import Git Repository"**
3. Busca y selecciona **`macrobat-ai`**
4. Click en **"Import"**

#### 2.3 Configurar el proyecto

**Framework Preset:** Vite

**Build & Development Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

#### 2.4 Variables de Entorno (IMPORTANTE)

Click en **"Environment Variables"** y añade:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_API_BASE_URL` | `/api` | Production, Preview, Development |
| `GEMINI_API_KEY` | `tu_api_key_aqui` | Production, Preview, Development |
| `GOOGLE_SEARCH_API_KEY` | `tu_search_key_aqui` | Production, Preview, Development |
| `GOOGLE_SEARCH_ENGINE_ID` | `tu_engine_id_aqui` | Production, Preview, Development |

⚠️ **IMPORTANTE:** Reemplaza con tus API keys reales.

**¿Dónde conseguir las API keys?**
- **GEMINI_API_KEY:** https://makersuite.google.com/app/apikey
- **GOOGLE_SEARCH_API_KEY:** https://console.cloud.google.com/apis/credentials
- **GOOGLE_SEARCH_ENGINE_ID:** https://programmablesearchengine.google.com/

#### 2.5 Deploy!
1. Click en **"Deploy"**
2. Espera 3-5 minutos ☕
3. **✅ "Congratulations!"**

---

## 🎉 ¡LISTO!

Tu aplicación estará en: `https://tu-proyecto.vercel.app`

**Características:**
- ✅ Frontend React funcionando
- ✅ Backend Python (FastAPI) como funciones serverless
- ✅ Chat con IA funcionando
- ✅ Deep Search funcionando
- ✅ Subida de archivos funcionando
- ✅ SSL/HTTPS automático
- ✅ **100% GRATIS**

---

## 🧪 Probar que funcione:

### 1. Abrir la app
```
https://tu-proyecto.vercel.app
```

### 2. Probar el backend
```bash
curl https://tu-proyecto.vercel.app/api/health
```

Deberías ver:
```json
{"status": "ok", "timestamp": "..."}
```

### 3. Probar el chat
1. Abre tu app en el navegador
2. Escribe un mensaje
3. **✅ La IA debería responder**

---

## 🔄 Actualizaciones Futuras

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

**Vercel se actualizará automáticamente en 2-3 minutos!** 🚀

---

## 📱 Compartir con Amigos

Solo comparte:
```
🔗 https://tu-proyecto.vercel.app
```

**Ventajas:**
- ✅ Funciona 24/7
- ✅ No necesitas tu computadora encendida
- ✅ URL permanente
- ✅ SSL automático
- ✅ CDN global (rápido en todo el mundo)
- ✅ **100% GRATIS**

---

## 💰 Límites del Plan Gratuito de Vercel:

| Recurso | Límite Gratuito | ¿Es suficiente? |
|---------|-----------------|-----------------|
| Despliegues | 100/día | ✅ Sí (más que suficiente) |
| Ancho de banda | 100 GB/mes | ✅ Sí (para proyectos personales) |
| Funciones Serverless | 100 GB-horas/mes | ✅ Sí |
| Ejecución de funciones | 10 segundos máx | ✅ Sí (FastAPI responde rápido) |
| Tamaño de función | 50 MB | ✅ Sí |
| Proyectos | Ilimitados | ✅ Sí |

**Conclusión:** Perfecto para proyectos personales y compartir con amigos. 🎉

---

## 🆘 Solución de Problemas

### Error: "Build failed"
**Causa:** Problema en `npm run build`

**Solución:**
```bash
# Probar el build localmente
npm run build

# Si hay error, revísalo y corrígelo
# Luego haz commit y push
git add .
git commit -m "Fix build"
git push
```

### Error: "Cannot connect to backend"
**Causa:** Variables de entorno mal configuradas

**Solución:**
1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
2. Verifica que `GEMINI_API_KEY` esté correcta
3. Verifica que `VITE_API_BASE_URL` sea `/api`
4. Click en **"Redeploy"**

### Error: "Function exceeded timeout"
**Causa:** La función tarda más de 10 segundos (límite de Vercel free)

**Solución:**
- Deep Search puede tardar mucho
- Considera usar Railway para el backend si necesitas más tiempo
- O actualiza a Vercel Pro ($20/mes con 60s timeout)

### El chat no responde
**Causa:** API key inválida o agotada

**Solución:**
1. Verifica tu API key de Gemini
2. Revisa los logs en Vercel → Tu proyecto → **Deployments** → Click en el deployment → **Functions**
3. Busca errores relacionados con la API

### Error: "CORS policy"
**Causa:** CORS no configurado correctamente

**Solución:**
Ya está configurado para aceptar todos los orígenes en Vercel. Si persiste:
1. Ve a `backend/main.py`
2. Verifica que CORS tenga `allow_origins=["*"]` o incluya tu dominio de Vercel

---

## 🔧 Arquitectura (Cómo funciona)

```
Usuario → https://tu-app.vercel.app
           │
           ├─→ Frontend (React/Vite) - /
           │   └─→ Archivos estáticos desde /dist
           │
           └─→ Backend (FastAPI) - /api/*
               └─→ Funciones serverless Python en /api
```

**¿Qué pasa cuando un usuario envía un mensaje?**

1. Frontend hace POST a `/api/chat`
2. Vercel ejecuta `api/index.py` (función serverless)
3. `api/index.py` importa tu `backend/main.py`
4. FastAPI procesa la petición
5. Llama a Gemini API
6. Retorna la respuesta
7. Frontend la muestra al usuario

**Todo esto en milisegundos!** ⚡

---

## 🎓 Comparación: Vercel vs Railway

| Característica | Vercel (100% gratis) | Railway ($5/mes gratis) |
|----------------|---------------------|------------------------|
| Despliegue | ✅ Automático | ✅ Automático |
| SSL | ✅ Incluido | ✅ Incluido |
| Timeout | ⚠️ 10s | ✅ 300s (5 min) |
| Tamaño función | ⚠️ 50 MB | ✅ Sin límite |
| Frontend | ✅ Incluido | ❌ Necesita otro servicio |
| Backend | ✅ Serverless | ✅ Contenedor completo |
| Bases de datos | ❌ No incluidas | ✅ Postgres/MySQL incluidas |
| Mejor para | Proyectos pequeños/medianos | Proyectos con mucho procesamiento |

**Recomendación:**
- **Vercel:** Perfecto para empezar y proyectos normales ✅
- **Railway:** Si necesitas más tiempo de ejecución o bases de datos

---

## 📊 Monitoreo y Analytics

### Ver logs en tiempo real:
1. Ve a tu proyecto en Vercel
2. Click en **"Deployments"**
3. Click en el deployment actual
4. Ve a **"Functions"**
5. Verás los logs de cada petición

### Ver métricas:
1. **Analytics** → Ver visitas, países, dispositivos
2. **Speed Insights** → Ver velocidad de carga
3. **Usage** → Ver consumo de recursos

**Todo incluido gratis!** 📈

---

## 🚀 Optimizaciones Futuras

### 1. Custom Domain (Opcional - Gratis)
```
Tu app: tu-proyecto.vercel.app
Con dominio: chat.tudominio.com
```

1. Compra un dominio (ej: Namecheap, ~$10/año)
2. Ve a Vercel → Settings → Domains
3. Añade tu dominio
4. Configura DNS según instrucciones

### 2. Analytics Avanzado
- Vercel incluye analytics básico gratis
- Para más detalle: Vercel Analytics ($10/mes)
- Alternativa gratis: Google Analytics

### 3. Preview Deployments
**Ya incluido gratis!**
- Cada push a una rama crea un preview
- Prueba cambios antes de producción
- URL única para cada preview

---

## ✅ Checklist Final

Antes de compartir con amigos, verifica:

- [ ] La app carga en `https://tu-proyecto.vercel.app`
- [ ] El chat responde a mensajes
- [ ] Las imágenes se pueden subir
- [ ] Los archivos PDF se procesan
- [ ] Deep Search funciona (si lo configuraste)
- [ ] La app funciona en móvil
- [ ] Los emojis y formato se ven bien

---

## 🎉 ¡Felicidades!

Tu aplicación de IA está en la nube, **100% gratis**, funcionando 24/7.

**Comparte con orgullo:** `https://tu-proyecto.vercel.app` 🚀

---

## 📞 ¿Necesitas Ayuda?

- **Documentación Vercel:** https://vercel.com/docs
- **Soporte Vercel:** https://vercel.com/support
- **Comunidad:** Discord de Vercel

**¡Disfruta tu app en la nube!** 🌟
