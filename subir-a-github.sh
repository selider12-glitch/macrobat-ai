#!/bin/bash

# Script para subir a GitHub de forma interactiva

echo "🚀 Subir Macrobat AI a GitHub"
echo ""

# Pedir usuario de GitHub
read -p "👤 Tu usuario de GitHub: " GITHUB_USER

if [ -z "$GITHUB_USER" ]; then
    echo "❌ Necesitas ingresar tu usuario de GitHub"
    exit 1
fi

# Pedir nombre del repositorio
read -p "📦 Nombre del repositorio (macrobat-ai): " REPO_NAME
REPO_NAME=${REPO_NAME:-macrobat-ai}

echo ""
echo "📋 Resumen:"
echo "   Usuario: $GITHUB_USER"
echo "   Repositorio: $REPO_NAME"
echo "   URL: https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""

read -p "¿Continuar? (s/n): " CONFIRM

if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
    echo "❌ Cancelado"
    exit 0
fi

echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Primero crea el repositorio en GitHub:"
echo "      https://github.com/new"
echo ""
echo "   2. Nombre del repositorio: $REPO_NAME"
echo "   3. NO marques 'Add a README file' ni nada más"
echo "   4. Click en 'Create repository'"
echo ""

read -p "¿Ya creaste el repositorio en GitHub? (s/n): " CREATED

if [ "$CREATED" != "s" ] && [ "$CREATED" != "S" ]; then
    echo ""
    echo "👉 Crea el repositorio primero y luego vuelve a ejecutar este script"
    echo "   Ir a: https://github.com/new"
    exit 0
fi

echo ""
echo "🚀 Subiendo a GitHub..."
echo ""

# Verificar si ya existe el remote
if git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  Remote 'origin' ya existe, actualizando URL..."
    git remote set-url origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
else
    git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"
fi

# Push
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ ¡Éxito! Proyecto subido a GitHub"
    echo ""
    echo "🔗 Ver tu repositorio:"
    echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
    echo ""
    echo "📋 Siguiente paso:"
    echo "   1. Ve a https://vercel.com"
    echo "   2. Import tu repositorio"
    echo "   3. Configura las variables de entorno"
    echo "   4. Deploy!"
    echo ""
    echo "📖 Lee la guía: VERCEL_100_GRATIS.md"
else
    echo ""
    echo "❌ Error al subir a GitHub"
    echo ""
    echo "Posibles causas:"
    echo "   1. El repositorio no existe en GitHub"
    echo "   2. No tienes permisos (autenticación)"
    echo "   3. El nombre de usuario es incorrecto"
    echo ""
    echo "💡 Para autenticación:"
    echo "   - Usa un Personal Access Token en lugar de tu contraseña"
    echo "   - Crear token: https://github.com/settings/tokens"
    echo "   - Permisos necesarios: 'repo'"
fi
