import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { resolve } from 'path'
import { createFallbackFuelPriceFeed, fetchAndParseFuelPricePh } from './src/lib/fuelPriceParser.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'admin-route-rewrite',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/fuelprice') {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            try {
              const data = await fetchAndParseFuelPricePh();
              res.end(JSON.stringify(data));
            } catch (err) {
              console.warn('[vite /api/fuelprice] Using fallback feed:', err);
              res.end(JSON.stringify(createFallbackFuelPriceFeed()));
            }
            return;
          }
          if (req.url === '/admin' || req.url === '/admin/' || req.url?.startsWith('/admin?')) {
            req.url = '/admin.html';
          }
          next();
        });
      },
    },
  ],
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
