#!/bin/bash

# Script de verificación pre-despliegue

echo "🔍 Verificando proyecto Macrobat AI para Vercel..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# Verificar archivos esenciales
echo "📁 Verificando archivos esenciales..."

FILES=(
    "package.json"
    "vite.config.ts"
    "vercel.json"
    "requirements.txt"
    "api/index.py"
    "backend/main.py"
    ".env.production"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file encontrado"
    else
        echo -e "${RED}✗${NC} $file NO encontrado"
        ERRORS=$((ERRORS + 1))
    fi
done

echo ""

# Verificar Git
echo "📦 Verificando Git..."
if [ -d ".git" ]; then
    echo -e "${GREEN}✓${NC} Repositorio Git inicializado"
    
    # Verificar si hay cambios sin commit
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}⚠${NC} Hay cambios sin commit"
        echo "   Ejecuta: git add . && git commit -m 'tu mensaje'"
    else
        echo -e "${GREEN}✓${NC} No hay cambios pendientes"
    fi
    
    # Verificar remote
    if git remote get-url origin >/dev/null 2>&1; then
        REMOTE=$(git remote get-url origin)
        echo -e "${GREEN}✓${NC} Remote configurado: $REMOTE"
    else
        echo -e "${YELLOW}⚠${NC} Remote NO configurado"
        echo "   Ejecuta: git remote add origin https://github.com/TU-USUARIO/macrobat-ai.git"
    fi
else
    echo -e "${RED}✗${NC} Git NO inicializado"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Verificar Node.js y npm
echo "🟢 Verificando Node.js..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js instalado: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js NO instalado"
    ERRORS=$((ERRORS + 1))
fi

if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm -v)
    echo -e "${GREEN}✓${NC} npm instalado: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm NO instalado"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Verificar Python
echo "🐍 Verificando Python..."
if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python instalado: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python3 NO instalado"
    ERRORS=$((ERRORS + 1))
fi

echo ""

# Verificar node_modules
echo "📦 Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules instalado"
else
    echo -e "${YELLOW}⚠${NC} node_modules NO encontrado"
    echo "   Ejecuta: npm install"
fi

echo ""

# Verificar build local
echo "🏗️  Probando build local..."
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Build exitoso"
    rm -rf dist
else
    echo -e "${RED}✗${NC} Build falló"
    echo "   Ejecuta: npm run build (para ver el error)"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "═══════════════════════════════════════════════════════════"

# Resumen
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ ¡Todo listo para desplegar en Vercel!${NC}"
    echo ""
    echo "📋 Siguiente paso:"
    echo "   1. Sube a GitHub: git push origin main"
    echo "   2. Despliega en Vercel: https://vercel.com"
    echo ""
    echo "📖 Lee la guía: VERCEL_100_GRATIS.md"
else
    echo -e "${RED}❌ Se encontraron $ERRORS error(es)${NC}"
    echo ""
    echo "Por favor corrige los errores antes de desplegar."
fi

echo "═══════════════════════════════════════════════════════════"
