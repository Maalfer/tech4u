import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Tech4U Academy',
        short_name: 'Tech4U',
        description: 'La academia interactiva de FP de Informática',
        theme_color: '#0D0D0D',
        background_color: '#0D0D0D',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/tech4u_logo.png', sizes: '192x192', type: 'image/png' },
          { src: '/tech4u_logo.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

        // CRITICAL: Force the new SW to activate immediately on deploy without waiting
        // for all browser tabs to close. Without this, the old SW stays in control
        // even after a new version is deployed — breaking OAuth and other fixes.
        skipWaiting: true,
        clientsClaim: true,

        // CRITICAL: Prevent the Service Worker from intercepting backend/API navigation.
        // Without this, the SW returns cached index.html for /oauth/google/login,
        // /auth/login, etc. — the browser never reaches Nginx and OAuth breaks.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [
          /^\/oauth\//,           // Google & Microsoft OAuth flows
          /^\/auth\//,            // Login, register, password reset
          /^\/api\//,             // API calls with /api/ prefix
          /^\/analytics\//,
          /^\/paypal\//,
          /^\/subscriptions\//,
          /^\/video_courses\//,
          /^\/tests\//,
          /^\/resources\//,
          /^\/users_admin\//,
          /^\/content_admin\//,
          /^\/announcements\//,
          /^\/coupons_admin\//,
          /^\/leaderboard\//,
          /^\/support\//,
          /^\/skill_labs\//,
          /^\/achievements\//,
          /^\/labs\//,
          /^\/teoria\//,
          /^\/sql_skills\//,
          /^\/battle\//,
          /^\/certificates\//,
          /^\/referrals\//,
          /^\/flashcard_spaced\//,
          /^\/search\//,
          /^\/dashboard\//,
          /^\/health$/,
          /^\/docs/,
          /^\/openapi\.json$/,
          /^\/redoc/,
          /^\/ws\//,
        ],

        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60*60*24*365 } }
          },
          {
            urlPattern: /\/api\/teoria\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-teoria-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60*60*24 } }
          },
          {
            urlPattern: /\/api\/tests\/questions.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-tests-cache', expiration: { maxEntries: 20, maxAgeSeconds: 60*60*6 } }
          },
          {
            urlPattern: /\/api\/flashcards\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-flashcards-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60*60*24 } }
          }
        ]
      }
    })
  ],
  build: {
    // No exponer el código fuente en producción
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['lucide-react', 'framer-motion', 'typewriter-effect'],
          'vendor-utils': ['axios', 'dompurify'],
          'vendor-phaser': ['phaser'],
          'vendor-terminal': ['xterm', 'xterm-addon-fit'],
          'vendor-editor': ['@uiw/react-md-editor'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    minify: 'esbuild',
  }
})
