# 🎯 PASO A PASO - Desplegar Macrobat AI

## ✅ YA HICIMOS:
- [x] Inicializar Git
- [x] Crear archivos de configuración para Railway
- [x] Crear archivos de configuración para Vercel
- [x] Primer commit

---

## 🚀 AHORA SIGUE (15 minutos en total):

### PASO 1: Subir a GitHub (3 minutos)

#### 1.1 Crear repositorio en GitHub
1. Ve a https://github.com/new
2. **Nombre del repositorio:** `macrobat-ai` (o el que quieras)
3. **Privacidad:** Público o Privado (como prefieras)
4. **NO marques:** "Add a README file" ni nada más
5. Click en **"Create repository"**

#### 1.2 Conectar y subir tu código
Copia los comandos que GitHub te muestra (o usa estos):

```bash
cd "/Users/francismejia/macrobat-ai project"
git remote add origin https://github.com/TU-USUARIO/macrobat-ai.git
git branch -M main
git push -u origin main
```

⚠️ **Reemplaza `TU-USUARIO` con tu usuario de GitHub!**

---

### PASO 2: Desplegar Backend en Railway (5 minutos)

#### 2.1 Crear cuenta y proyecto
1. Ve a https://railway.app
2. Click en **"Login"** → **"Login with GitHub"**
3. Autoriza Railway
4. Click en **"New Project"**
5. Selecciona **"Deploy from GitHub repo"**
6. Si pide permisos, autoriza Railway a ver tus repos
7. Selecciona **`macrobat-ai`** (tu repositorio)

#### 2.2 Configurar directorio del backend
1. Railway empezará a construir automáticamente
2. Espera a que falle (es normal, falta configuración)
3. Click en tu proyecto
4. Click en **"Settings"** (⚙️)
5. Busca **"Root Directory"**
6. Escribe: `backend`
7. Click en **"Redeploy"** o espera a que se redespliegue automáticamente

#### 2.3 Configurar Variables de Entorno
1. Click en la pestaña **"Variables"** (🔐)
2. Click en **"+ New Variable"** y añade:

```
GEMINI_API_KEY
```
Valor: `tu_api_key_de_gemini` (la que tienes en tu `.env` local)

3. Repite para estas variables:

```
GOOGLE_SEARCH_API_KEY
GOOGLE_SEARCH_ENGINE_ID
```

4. Añade esta también:
```
PORT
```
Valor: `8000`

5. **Guarda todo**

#### 2.4 Obtener URL del Backend
1. Ve a **"Settings"** → **"Networking"**
2. Click en **"Generate Domain"**
3. Verás algo como: `macrobat-backend.up.railway.app`
4. **📋 COPIA ESTA URL** - la necesitarás en el siguiente paso

**✅ Verifica:** Ve a esa URL + `/health` (ejemplo: `https://tu-backend.railway.app/health`)

Deberías ver: `{"status":"ok","timestamp":"..."}`

---

### PASO 3: Configurar y Desplegar Frontend en Vercel (5 minutos)

#### 3.1 Actualizar configuración del frontend

Ejecuta estos comandos en tu terminal:

```bash
cd "/Users/francismejia/macrobat-ai project"

# Actualizar .env.production con la URL de Railway
echo "VITE_API_BASE_URL=https://TU-BACKEND.railway.app" > .env.production

# Actualizar vercel.json
```

**⚠️ IMPORTANTE:** Reemplaza `TU-BACKEND.railway.app` con la URL que copiaste en el paso 2.4

Ejemplo:
```bash
echo "VITE_API_BASE_URL=https://macrobat-backend.up.railway.app" > .env.production
```

#### 3.2 Actualizar vercel.json
Abre el archivo `vercel.json` y cambia:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://TU-BACKEND.railway.app/:path*"
    }
  ]
}
```

Reemplaza `TU-BACKEND.railway.app` con tu URL real.

#### 3.3 Hacer commit de los cambios
```bash
git add .env.production vercel.json
git commit -m "Configurar URL del backend de Railway"
git push
```

#### 3.4 Desplegar en Vercel
1. Ve a https://vercel.com
2. Click en **"Sign Up"** o **"Login"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza Vercel
5. Click en **"Add New..."** → **"Project"**
6. Click en **"Import Git Repository"**
7. Busca y selecciona **`macrobat-ai`**
8. Click en **"Import"**

#### 3.5 Configurar el proyecto en Vercel
En la página de configuración:

- **Framework Preset:** Vite ✅
- **Root Directory:** `.` (déjalo como está)
- **Build Command:** `npm run build` ✅
- **Output Directory:** `dist` ✅

#### 3.6 Añadir variables de entorno
1. Expande **"Environment Variables"**
2. Añade:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** `https://tu-backend.railway.app` (la URL de Railway)
3. Marca: **Production**, **Preview**, y **Development**
4. Click en **"Add"**

#### 3.7 Deploy!
1. Click en **"Deploy"**
2. Espera 2-3 minutos ☕
3. **✅ Verás "Congratulations!"**

---

### PASO 4: Actualizar CORS en Railway (2 minutos)

Tu frontend ya está desplegado, pero necesita permiso para hablar con el backend:

1. Vercel te mostrará tu URL, algo como: `https://macrobat-ai-xxx.vercel.app`
2. **📋 Copia esa URL**
3. Ve a Railway → Tu proyecto → **"Variables"**
4. Click en **"+ New Variable"**
5. **Name:** `CORS_ALLOWED_ORIGINS`
6. **Value:** `https://tu-app.vercel.app,https://*.vercel.app`
7. Railway se redesplegará automáticamente (espera 1-2 minutos)

---

## 🎉 ¡TERMINADO!

### Probar que todo funcione:

1. **Abrir tu app:** `https://tu-app.vercel.app`
2. **Enviar un mensaje a la IA**
3. **✅ Debería funcionar perfectamente!**

---

## 📱 Compartir con Amigos

**Tu URL pública:** `https://tu-app.vercel.app`

Solo comparte esa URL. Funcionará para todos, 24/7, sin que tu computadora esté encendida.

---

## 🆘 Si algo no funciona:

### Error: "Cannot connect to backend"
```bash
# Verifica que el backend esté corriendo
curl https://tu-backend.railway.app/health
```

Si no responde, revisa los logs en Railway.

### El chat no responde
1. Ve a Railway → Tu proyecto → **"Deployments"** → **"View Logs"**
2. Busca errores relacionados con `GEMINI_API_KEY`

### Error de CORS
1. Verifica que en Railway → **"Variables"** → `CORS_ALLOWED_ORIGINS` tenga tu dominio de Vercel
2. Espera 2 minutos a que se redespliegue

---

## 💰 Costos:
- **Railway:** $5/mes GRATIS (más que suficiente)
- **Vercel:** 100% GRATIS
- **Total:** **$0 al mes** 🎉

---

## 🔄 Actualizaciones futuras:

Cada vez que hagas cambios:

```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

**Railway y Vercel se actualizarán automáticamente!** 🚀
