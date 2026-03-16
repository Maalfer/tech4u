/**
 * Tech4U — Service Worker
 *
 * Strategy:
 *   • Immutable static assets (JS/CSS/fonts/images) → Cache-first (stale-while-revalidate)
 *   • HTML navigation requests            → Network-first with cache fallback
 *   • API requests (:8000 / /api/)        → Network-only (never cache auth data)
 *   • Third-party (Google Fonts CDN)      → Stale-while-revalidate (1 week)
 *
 * PageSpeed wins:
 *   - Repeat visits fully served from cache  → TTI < 1 s
 *   - Offline fallback → PWA-ready
 *   - Eliminates redundant network requests
 */

const CACHE_VERSION   = 'v2';
const STATIC_CACHE    = `tech4u-static-${CACHE_VERSION}`;
const FONT_CACHE      = `tech4u-fonts-${CACHE_VERSION}`;
const DYNAMIC_CACHE   = `tech4u-dynamic-${CACHE_VERSION}`;

// Resources to pre-cache on install (critical shell)
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.svg',
];

// ── Install ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())           // Activate immediately
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const VALID_CACHES = [STATIC_CACHE, FONT_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !VALID_CACHES.includes(key))
            .map((key) => caches.delete(key))   // Evict stale caches
        )
      )
      .then(() => self.clients.claim())          // Take control of open tabs
  );
});

// ── Helpers ──────────────────────────────────────────────────────────────────
function isStaticAsset(url) {
  return /\.(js|css|woff2?|otf|ttf|eot|png|jpe?g|webp|avif|svg|ico|gif)(\?.*)?$/.test(url.pathname);
}

function isGoogleFont(url) {
  return url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
}

function isApiRequest(url) {
  // Never cache auth / API data
  return url.port === '8000' || url.pathname.startsWith('/api/');
}

// ── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only intercept GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith('http')) return;

  // ── API: Network-only ──────────────────────────────────────────────────
  if (isApiRequest(url)) return;

  // ── Google Fonts: Cache-first (fonts rarely change) ────────────────────
  if (isGoogleFont(url)) {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Vite-built Static Assets: Cache-first + background revalidate ──────
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          // Revalidate in background regardless of cache hit
          const fetchPromise = fetch(request)
            .then((response) => {
              if (response.ok) cache.put(request, response.clone());
              return response;
            })
            .catch(() => cached);              // Offline: fall back silently

          return cached || fetchPromise;       // Cache-first
        })
      )
    );
    return;
  }

  // ── HTML Navigation: Network-first + cache fallback ────────────────────
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) =>
            cached || caches.match('/')        // SPA fallback to shell
          )
        )
    );
    return;
  }
});
