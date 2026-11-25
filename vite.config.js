import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-dev-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';
          if (url.startsWith('/api/student-login')) {
            try {
              let body = '';
              req.on('data', chunk => { body += chunk; });
              req.on('end', async () => {
                try { req.body = body ? JSON.parse(body) : {}; } catch { req.body = {}; }
                const { default: handler } = await import('./api/student-login.js');
                res.status = function(code) { this.statusCode = code; return this; };
                res.json = function(data) {
                  this.setHeader('Content-Type', 'application/json');
                  this.end(JSON.stringify(data));
                  return this;
                };
                await handler(req, res);
              });
              return;
            } catch (err) {
              console.error('[vite-api] Student login error:', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message, code: 'DEV_SERVER_ERROR' }));
              return;
            }
          }
          next();
        });
      }
    },
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 2500000,
        globPatterns: ['**/*.{js,css,html,ico,svg,webmanifest}'],
        globIgnores: [
          '**/Trophy3D*',
          '**/jspdf*',
          '**/html2canvas*',
          '**/hindiQuizData*',
          '**/CartesianChart*',
          'images/**',
          'assets/img/**',
          '**/*.pdf',
          '**/*.mp4'
        ],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|gif|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'bytecore-images',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'ByteCore Computer Centre',
        short_name: 'ByteCore',
        description: 'Bareilly\'s premier IT lab for professional coding and IT courses.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait-primary',
        categories: ["education", "technology", "productivity"],
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "Student Portal",
            short_name: "Portal",
            description: "Access your student dashboard",
            url: "/student-portal",
            icons: [{ src: "logo.png", sizes: "192x192" }]
          },
          {
            name: "Take a Quiz",
            short_name: "Quizzes",
            description: "Practice your knowledge",
            url: "/quizzes",
            icons: [{ src: "logo.png", sizes: "192x192" }]
          }
        ]
      }
    })
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          ui: ['framer-motion', 'lucide-react', 'swiper']
        }
      }
    }
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },

})

