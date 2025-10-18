import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    // Permitir acceso desde túneles de Cloudflare
    allowedHosts: [
      '.trycloudflare.com',
      'quantum-written-example-cartridges.trycloudflare.com',
    ],
    // Proxy para el backend - redirige /api/* a localhost:8000
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
