import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'logo.png'],
      workbox: {
        maximumFileSizeToCacheInBytes: 6000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg}'],
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

