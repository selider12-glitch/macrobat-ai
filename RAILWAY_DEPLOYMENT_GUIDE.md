# 🚀 Guía Completa de Despliegue en Railway + Vercel

## 📋 Lo que vamos a hacer:

1. **Backend** → Railway (Python/FastAPI) ☁️
2. **Frontend** → Vercel (React/Vite) 🌐
3. **Base de Datos de API** → Variables de entorno 🔐

---

## 🎯 Parte 1: Desplegar Backend en Railway

### Paso 1: Crear cuenta en Railway
1. Ve a https://railway.app
2. Haz clic en "Login" → "Login with GitHub"
3. Autoriza Railway a acceder a tu GitHub

### Paso 2: Crear nuevo proyecto
1. En Railway, haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Si no has conectado tu repo:
   - Haz clic en "Configure GitHub App"
   - Selecciona tu repositorio de Macrobat AI
   - Autoriza Railway
4. Selecciona tu repositorio

### Paso 3: Configurar el Backend
1. Railway detectará automáticamente que es Python
2. Haz clic en el proyecto creado
3. Ve a "Settings" → "General"
4. En "Root Directory" escribe: `backend`
5. Haz clic en "Save"

### Paso 4: Configurar Variables de Entorno
1. Ve a la pestaña "Variables"
2. Añade estas variables (haz clic en "+ New Variable"):

```
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
GOOGLE_SEARCH_API_KEY=tu_api_key_de_google_aqui
GOOGLE_SEARCH_ENGINE_ID=tu_search_engine_id_aqui
CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app
PORT=8000
```

**⚠️ IMPORTANTE:** Reemplaza los valores con tus APIs reales.

### Paso 5: Obtener la URL del Backend
1. Ve a "Settings" → "Networking"
2. Haz clic en "Generate Domain"
3. **Copia la URL** que aparece (algo como: `macrobat-backend.railway.app`)
4. **Guarda esta URL** - la necesitarás para el frontend

### Paso 6: Deploy automático
Railway desplegará automáticamente. Verás los logs en la pestaña "Deployments".

**✅ Backend completado cuando veas: "Application startup complete"**

---

## 🎨 Parte 2: Desplegar Frontend en Vercel

### Paso 1: Crear cuenta en Vercel
1. Ve a https://vercel.com
2. Haz clic en "Sign Up"
3. Selecciona "Continue with GitHub"
4. Autoriza Vercel

### Paso 2: Crear variable de entorno
1. Crea un archivo `.env.production` en la raíz del proyecto:

```bash
# En tu terminal local:
cd "/Users/francismejia/macrobat-ai project"
```

2. Crea el archivo con tu editor o con este comando:

```bash
echo "VITE_API_BASE_URL=https://tu-backend.railway.app" > .env.production
```

**⚠️ IMPORTANTE:** Reemplaza `tu-backend.railway.app` con la URL real de Railway del Paso 5.

### Paso 3: Actualizar vercel.json
Actualiza el archivo `vercel.json` con la URL correcta del backend:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://tu-backend.railway.app/:path*"
    }
  ]
}
```

### Paso 4: Hacer commit de los cambios
```bash
git add .
git commit -m "Configurar despliegue en Railway y Vercel"
git push origin main
```

### Paso 5: Importar proyecto en Vercel
1. En Vercel, haz clic en "Add New..." → "Project"
2. Selecciona "Import Git Repository"
3. Busca y selecciona tu repositorio de Macrobat AI
4. Haz clic en "Import"

### Paso 6: Configurar el proyecto
1. **Framework Preset:** Vite
2. **Root Directory:** `.` (raíz)
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### Paso 7: Variables de entorno en Vercel
1. Expande "Environment Variables"
2. Añade:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://tu-backend.railway.app` (URL de Railway)
3. Marca "Production", "Preview" y "Development"
4. Haz clic en "Add"

### Paso 8: Deploy
1. Haz clic en "Deploy"
2. Espera 2-3 minutos
3. **✅ Verás "Congratulations!"** cuando termine

### Paso 9: Obtener tu URL pública
Tu aplicación estará en: `https://tu-app.vercel.app`

---

## 🔧 Parte 3: Conectar Frontend con Backend

### Actualizar CORS en Railway
1. Ve a tu proyecto en Railway
2. Ve a "Variables"
3. Encuentra `CORS_ALLOWED_ORIGINS`
4. Añade tu URL de Vercel:

```
CORS_ALLOWED_ORIGINS=https://tu-app.vercel.app,https://*.vercel.app
```

5. Railway se redesplegará automáticamente

---

## ✅ Verificar que Todo Funciona

### 1. Probar el Backend
```bash
curl https://tu-backend.railway.app/health
```

Deberías ver:
```json
{"status": "ok", "timestamp": "..."}
```

### 2. Probar el Frontend
1. Abre `https://tu-app.vercel.app` en tu navegador
2. Intenta enviar un mensaje al chat
3. **✅ Debería funcionar perfectamente**

---

## 🎉 Compartir con Amigos

**Tu aplicación ahora está en la nube!** Solo comparte:

```
🔗 https://tu-app.vercel.app
```

**Ventajas:**
- ✅ Funciona 24/7
- ✅ No necesitas tu computadora encendida
- ✅ URL permanente
- ✅ SSL/HTTPS automático
- ✅ Gratis para uso personal

---

## 🔄 Actualizaciones Futuras

Para actualizar tu app:

```bash
# Haz cambios en tu código
git add .
git commit -m "Descripción de cambios"
git push origin main
```

**Railway y Vercel se actualizarán automáticamente** 🚀

---

## 🆘 Solución de Problemas

### Error: "Cannot connect to backend"
1. Verifica que Railway esté ejecutándose (verde en dashboard)
2. Revisa que `VITE_API_BASE_URL` tenga la URL correcta
3. Verifica CORS en Railway incluya tu dominio de Vercel

### Error: "Build failed" en Vercel
1. Verifica que `package.json` tenga el script `build`
2. Asegúrate de que `npm run build` funcione localmente
3. Revisa los logs en Vercel para ver el error específico

### Error: "Application failed to respond" en Railway
1. Verifica que `requirements.txt` esté completo
2. Revisa que `GEMINI_API_KEY` esté configurado
3. Ve a "Deployments" → "View Logs" para ver el error

### El chat no responde
1. Verifica que `GEMINI_API_KEY` sea válida
2. Prueba la API directamente:
```bash
curl -X POST https://tu-backend.railway.app/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hola", "mode": "chat"}'
```

---

## 💰 Costos

- **Railway:** $5/mes de crédito GRATIS (suficiente para tu proyecto)
- **Vercel:** 100% GRATIS para proyectos personales
- **Total:** **GRATIS** 🎉

---

## 📞 Soporte

Si algo no funciona:
1. Revisa los logs en Railway y Vercel
2. Verifica que todas las variables de entorno estén configuradas
3. Asegúrate de que las URLs estén correctas (sin `/` al final)

**¡Listo! Tu aplicación está en la nube y lista para compartir!** 🚀
