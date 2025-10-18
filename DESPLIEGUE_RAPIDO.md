# 🚀 Despliegue Rápido - 3 Pasos

## ✅ Archivos creados:
- `backend/railway.json` - Configuración de Railway
- `backend/Procfile` - Comando de inicio
- `vercel.json` - Configuración de Vercel  
- `.env.production` - Variables de producción
- `RAILWAY_DEPLOYMENT_GUIDE.md` - Guía completa

## 🎯 Resumen Rápido:

### 1. Subir a GitHub (si no lo has hecho)

```bash
# Inicializar Git (si es necesario)
git init
git add .
git commit -m "Macrobat AI - Listo para despliegue"

# Crear repositorio en GitHub y subirlo
git remote add origin https://github.com/TU-USUARIO/macrobat-ai.git
git branch -M main
git push -u origin main
```

### 2. Backend en Railway (5 minutos)

1. Ve a https://railway.app → Login with GitHub
2. "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repo de Macrobat AI
4. **Settings → Root Directory:** `backend`
5. **Variables:** Añade `GEMINI_API_KEY`, `GOOGLE_SEARCH_API_KEY`, etc.
6. **Settings → Generate Domain** → Copia la URL (ej: `https://macrobat-backend.railway.app`)

### 3. Frontend en Vercel (3 minutos)

1. Actualiza `.env.production` con la URL de Railway:
```bash
VITE_API_BASE_URL=https://tu-backend.railway.app
```

2. Haz commit:
```bash
git add .env.production
git commit -m "Configurar URL del backend"
git push
```

3. Ve a https://vercel.com → "New Project"
4. Importa tu repo de GitHub
5. **Environment Variables:** 
   - `VITE_API_BASE_URL` = `https://tu-backend.railway.app`
6. Click "Deploy"

## 🎉 ¡Listo!

Tu app estará en: `https://tu-proyecto.vercel.app`

Comparte esa URL con tus amigos. **Funciona 24/7 sin necesidad de que tu computadora esté encendida.**

---

## 📖 ¿Necesitas más detalles?

Lee la guía completa: `RAILWAY_DEPLOYMENT_GUIDE.md`

## ⚠️ Importante:

- Railway te da **$5 gratis al mes** (suficiente para este proyecto)
- Vercel es **100% gratis** para proyectos personales
- Ambos servicios se actualizan automáticamente cuando haces `git push`

## 🆘 Problemas?

1. **Backend no despliega:** Verifica que `backend/requirements.txt` esté completo
2. **Frontend no conecta:** Verifica que `VITE_API_BASE_URL` sea correcta (sin `/` al final)
3. **CORS errors:** Añade tu dominio de Vercel en Railway → Variables → `CORS_ALLOWED_ORIGINS`
