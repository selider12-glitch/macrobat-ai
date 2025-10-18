# 🌐 Cómo Compartir Macrobat AI con tus Amigos

## 📝 Problema
Tu chat de IA funciona en tu computadora, pero tus amigos no pueden usarlo porque el backend está en tu máquina local.

## ✅ Solución: 2 Túneles de Cloudflare

### 🎯 Qué necesitas hacer (5 minutos):

1. **Abrir 4 terminales** en VS Code
2. **Ejecutar 4 comandos** (uno en cada terminal)
3. **Copiar 2 URLs** y compartir una con tus amigos

---

## 🚀 Pasos para Compartir

### **Paso 1: Terminal 1 - Backend**
```bash
cd "/Users/francismejia/macrobat-ai project/backend"
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### **Paso 2: Terminal 2 - Túnel del Backend**
```bash
cloudflared tunnel --url http://localhost:8000
```

**IMPORTANTE:** Verás algo como:
```
https://abc-def-ghi.trycloudflare.com
```

**📋 COPIA ESA URL** (la del backend)

### **Paso 3: Configurar el Frontend**
Abre el archivo `.env.local` y reemplaza `TU-URL-BACKEND` con la URL que copiaste:

```env
VITE_API_BASE_URL=https://abc-def-ghi.trycloudflare.com
```

### **Paso 4: Terminal 3 - Frontend**
```bash
cd "/Users/francismejia/macrobat-ai project"
npm run dev
```

### **Paso 5: Terminal 4 - Túnel del Frontend**
```bash
cloudflared tunnel --url http://localhost:5174
```

Verás algo como:
```
https://xyz-uvw-rst.trycloudflare.com
```

**🎉 COMPARTE ESTA URL CON TUS AMIGOS**

---

## 🎮 Para Usar la Aplicación

### **Tú (local):**
Abre: `http://localhost:5174`

### **Tus Amigos (internet):**
Abren: `https://xyz-uvw-rst.trycloudflare.com`

---

## ⚠️ Importante

1. **Tu computadora debe estar encendida** con los 4 terminales ejecutándose
2. **Las URLs de Cloudflare cambian** cada vez que cierras el túnel
3. Si reinicias, debes:
   - Crear nuevos túneles
   - Actualizar `.env.local` con la nueva URL del backend
   - Compartir la nueva URL del frontend con tus amigos

---

## 🆘 Solución de Problemas

### "No se puede conectar al backend"
1. Verifica que los 4 terminales estén ejecutándose
2. Revisa que `.env.local` tenga la URL correcta del backend
3. Reinicia el terminal del frontend (Ctrl+C y vuelve a ejecutar `npm run dev`)

### "La página no carga"
1. Verifica que el túnel del frontend esté activo
2. Intenta con una ventana de incógnito

---

## 💡 Alternativa: URLs Permanentes (Gratis)

Si quieres una URL que no cambie y que funcione 24/7:

### **Frontend:** Vercel (gratis)
```bash
npm install -g vercel
vercel deploy
```

### **Backend:** Railway o Render (gratis)
1. Crea cuenta en https://railway.app
2. Conecta tu repositorio
3. Despliega el backend

Te ayudo a configurar esto si lo prefieres 😊

---

## 📞 Necesitas Ayuda?

Si algo no funciona, avísame y revisamos juntos qué puede estar pasando.
