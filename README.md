# 🤖 Macrobat AI - Asistente de IA Avanzado

<div align="center">
  
  **Plataforma de IA de última generación con interfaz moderna y backend potente**
  
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
  [![Python](https://img.shields.io/badge/Python-3.9+-green.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-teal.svg)](https://fastapi.tiangolo.com/)
  [![Gemini](https://img.shields.io/badge/Gemini-2.0-orange.svg)](https://ai.google.dev/)
</div>

---

## ✨ Características Principales

### 🎨 **Frontend Moderno (React + TypeScript + Vite)**
- ✅ **Diseño 3D Neomórfico Ultra Minimalista**
- ✅ **Sidebar Colapsable** con navegación intuitiva
- ✅ **5 Modos de Operación**:
  - 🔍 **DeepSearch**: Búsqueda profunda con razonamiento paso a paso
  - 🎨 **Create Images**: Descripciones creativas para generación de imágenes
  - 📚 **How to**: Tutoriales paso a paso
  - 📰 **Latest News**: Información actualizada
  - 👥 **Personas**: Respuestas personalizadas

### Tipografía
- **Fuente**: Inter (sans-serif moderna)
- **Jerarquía clara**: Logo destacado, textos secundarios discretos

### Diseño Minimalista
- Uso extensivo de espacio negativo
- Elementos simples con bordes redondeados
- Sin sombras ni decoraciones innecesarias

### Componentes Interactivos
- Botones con hover effects sutiles
- Transiciones suaves
- Diseño centrado y equilibrado

## 📦 Instalación y Uso

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de producción
npm run preview
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/
│   ├── Header.tsx          # Navegación superior
│   ├── Logo.tsx            # Logo de Grok
│   ├── SearchBar.tsx       # Barra de búsqueda principal
│   ├── NavigationButtons.tsx # Botones de navegación
│   └── Footer.tsx          # Footer con enlaces legales
├── App.tsx                 # Componente principal
├── main.tsx               # Punto de entrada
└── index.css              # Estilos globales con Tailwind
```

## 🌟 Características Implementadas

- ✅ **Header fijo** con icono de sidebar animado
- ✅ **Logo de Macrobat AI** con efectos hover y glow naranja/amarillo
- ✅ **Campo de búsqueda inteligente**:
  - Botón de micrófono por defecto (hover naranja)
  - Botón de enviar naranja brillante al escribir
  - Borde con efecto glow naranja al hacer focus
- ✅ **Botones de navegación** con gradientes de color cálidos:
  - DeepSearch (naranja/amarillo)
  - Create Images (ámbar/naranja)
  - How to (amarillo/ámbar)
  - Latest News (naranja/rojo)
  - Personas (rojo/naranja)
- ✅ **Selector de modo Expert** con dropdown animado y tema naranja
- ✅ **Botón "Sign in"** con gradiente naranja a amarillo
- ✅ **Footer con enlaces legales**
- ✅ **Diseño completamente responsivo**
- ✅ **Animaciones avanzadas**:
  - Fade-in y slide-in en todos los elementos
  - Efectos hover con scale y glow
  - Transiciones suaves (300-700ms)
  - Orbes de gradiente animados en naranja/amarillo en el fondo
- ✅ **Efectos visuales modernos**:
  - Backdrop blur en header
  - Gradientes dinámicos en tema naranja/amarillo
  - Sombras con color naranja
  - Bordes con transparencia
  - Drop shadow en el logo

## 🎯 Accesibilidad

- Labels ARIA para botones
- Alto contraste de colores
- Navegación por teclado
- Diseño semántico
- Efectos visuales optimizados para rendimiento

## 🎨 Efectos Visuales Avanzados

### Gradientes de Fondo:
- **6 orbes animados** con gradientes complejos de naranja/amarillo
- Efectos pulse asíncronos para dinamismo
- Blur extremo (3xl) para efecto atmosférico
- Combinación de colores: naranja, amarillo, ámbar y rojo

### Botones de Navegación:
- **Gradientes vibrantes** de 3 colores en cada botón
- **Efecto shimmer** (brillo deslizante) al pasar el cursor
- **Iconos animados** con rotación y scale
- **Bordes brillantes** con gradientes animados
- **Glow effect** (resplandor) con blur en hover
- **Glass effect** (efecto cristal) con overlay translúcido
- Sombras con color específico para cada botón

### SearchBar:
- **Doble glow** exterior al hacer focus
- **Borde animado** con gradiente pulsante
- **Efecto shimmer** continuo cuando está activo
- **Botón de enviar** con:
  - Gradiente de 3 colores (naranja → amarillo)
  - Animación pulse en el fondo
  - Shimmer al hover
  - Rotación del icono (45°)
  - Sombra XL con color

### Header:
- **Backdrop blur XL** para efecto de cristal esmerilado
- **Línea gradiente** sutil en el borde inferior
- **Shimmer effect** en todos los iconos
- **Rotación animada** del icono de settings (90°)
- Botón Sign in con gradiente y shimmer

### Efectos Globales:
- **Transiciones suaves** de 300-1000ms
- **Hover scales** de 110-125%
- **Active states** con scale down (95%)
- **Drop shadows** en todos los iconos
- **Border animations** con gradientes
- **Backdrop filters** para profundidad

## 📱 Responsive Design

El diseño se adapta perfectamente a diferentes tamaños de pantalla:
- Desktop
- Tablet
- Mobile

---

Desarrollado con ❤️ usando React + Vite + Tailwind CSS

  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
