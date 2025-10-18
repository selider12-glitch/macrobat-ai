# 🚀 Guía de Despliegue Público - Macrobat AI

## ✅ Estado Actual

- **Frontend:** Vite en puerto 5174 ✅
- **Backend:** FastAPI en puerto 8000 ✅  
- **Túnel:** Cloudflare Quick Tunnel ✅

## 📋 URL Pública Activa

```
https://alien-knowledge-newer-sin.trycloudflare.com
```

## 🔧 Configuración Aplicada

### 1. Proxy de Vite (`vite.config.ts`)
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
}
```

### 2. API Service (`src/services/api.ts`)
- **Localhost:** Usa `http://localhost:8000`
- **Cloudflare:** Usa `/api` (proxy automático)

### 3. CORS Backend (`backend/main.py`)
- Permite: `.trycloudflare.com`
- Permite: `pages.dev`
- Permite: Todos los métodos y headers

## 🧪 Para Probar Localmente

1. Abre: `http://localhost:5174`
2. Envía mensaje a la AI
3. Debe funcionar ✅

## 🌐 Para Probar Públicamente

1. Abre: `https://alien-knowledge-newer-sin.trycloudflare.com`
2. El frontend carga desde Cloudflare
3. Las peticiones `/api/*` se envían a través del proxy de Vite
4. Vite reenvía a `localhost:8000` (backend)

## ⚠️ Problema Actual

El túnel de Cloudflare NO puede acceder al proxy de Vite porque:
- Cloudflare → Frontend (puerto 5174) ✅
- Frontend → Proxy Vite `/api` → Backend (puerto 8000) ❌

**El proxy de Vite solo funciona en desarrollo local, NO a través de Cloudflare.**

## 💡 Solución

Necesitamos una de estas opciones:

### Opción 1: Nginx Reverse Proxy (Recomendado)
Instalar Nginx localmente para manejar ambos puertos

### Opción 2: Build de Producción
Hacer build del frontend y servir todo desde FastAPI

### Opción 3: Dos Túneles Cloudflare
- Túnel 1: Frontend
- Túnel 2: Backend (con dominio diferente)

## 🎯 Implementación Rápida: Opción 3

```bash
# Terminal 1: Frontend
cd "/Users/francismejia/macrobat-ai project"
npm run dev

# Terminal 2: Backend  
cd "/Users/francismejia/macrobat-ai project/backend"
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3: Túnel Frontend
cloudflared tunnel --url http://localhost:5174

# Terminal 4: Túnel Backend
cloudflared tunnel --url http://localhost:8000
```

Luego configurar frontend para usar la URL del backend de Cloudflare.
