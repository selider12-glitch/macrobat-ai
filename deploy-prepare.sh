#!/bin/bash

# Script para desplegar Macrobat AI en Railway + Vercel

echo "🚀 Preparando despliegue de Macrobat AI..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: Ejecuta este script desde la raíz del proyecto"
    exit 1
fi

# Verificar Git
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositorio Git..."
    git init
    git add .
    git commit -m "Initial commit - Macrobat AI"
else
    echo "✅ Repositorio Git encontrado"
fi

# Verificar cambios pendientes
if [[ -n $(git status -s) ]]; then
    echo "📝 Haciendo commit de los cambios..."
    git add .
    git commit -m "Configuración para despliegue en Railway y Vercel"
fi

echo ""
echo "✅ ¡Proyecto preparado para despliegue!"
echo ""
echo "📋 Siguientes pasos:"
echo ""
echo "1️⃣  Subir a GitHub:"
echo "    git remote add origin https://github.com/TU-USUARIO/TU-REPO.git"
echo "    git branch -M main"
echo "    git push -u origin main"
echo ""
echo "2️⃣  Desplegar Backend en Railway:"
echo "    - Ve a https://railway.app"
echo "    - New Project → Deploy from GitHub repo"
echo "    - Selecciona tu repositorio"
echo "    - Root Directory: backend"
echo "    - Añade las variables de entorno (GEMINI_API_KEY, etc.)"
echo ""
echo "3️⃣  Desplegar Frontend en Vercel:"
echo "    - Ve a https://vercel.com"
echo "    - New Project → Import Git Repository"
echo "    - Selecciona tu repositorio"
echo "    - Añade VITE_API_BASE_URL con la URL de Railway"
echo ""
echo "📖 Guía completa en: RAILWAY_DEPLOYMENT_GUIDE.md"
echo ""
