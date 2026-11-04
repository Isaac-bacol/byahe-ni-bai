import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'admin-route-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/admin' || req.url === '/admin/' || req.url?.startsWith('/admin?')) {
            req.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
  server: {
    watch: {
      ignored: ['**/flutter/**', '**/mobile/**'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        admin: resolve(import.meta.dirname, 'admin.html'),
        mapbox: resolve(import.meta.dirname, 'mapbox.html'),
      },
    },
  },
})
