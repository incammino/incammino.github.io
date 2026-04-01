// ============================================================
//  Service Worker — Network First
//  Aggiorna SOLO il numero di versione ad ogni deploy!
// ============================================================
const CACHE_VERSION = '20260401133308'; // <-- cambia questo ad ogni deploy (es. v2, v3...)
const CACHE_NAME = `incammino-${CACHE_VERSION}`;

// File da pre-cachare al primo caricamento
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/notes.html',
  '/style.css',
  '/app.js',
  '/config.js',
  '/giussani.js',
  '/notes.js',
];

// ── INSTALL: pre-carica i file principali ──────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  // Attiva subito il nuovo SW senza aspettare che le tab vecchie si chiudano
  self.skipWaiting();
});

// ── ACTIVATE: elimina le cache vecchie ────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  // Prendi il controllo di tutte le tab aperte immediatamente
  self.clients.claim();
});

// ── FETCH: network-first ──────────────────────────────────
self.addEventListener('fetch', event => {
  // Gestisci solo richieste GET dello stesso sito
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Ottieni risposta dalla rete → aggiorna la cache
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return networkResponse;
      })
      .catch(() =>
        // Rete non disponibile → usa la cache
        caches.match(event.request)
      )
  );
});
