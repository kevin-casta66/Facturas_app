// Service Worker — Sistema de Facturación
// Estrategia: Cache-First para assets estáticos, Network-First para API y páginas

const CACHE_NAME = "facturas-app-v1";
const STATIC_CACHE_NAME = "facturas-static-v1";

// Assets que se cachean al instalar el SW
const PRECACHE_ASSETS = [
  "/",
  "/facturas",
  "/clientes",
  "/productos",
  "/estadisticas",
  "/configuracion",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// Instalar: pre-cachear assets principales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activar: limpiar caches viejos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: estrategia según tipo de request
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no son de nuestro origen
  if (url.origin !== location.origin) return;

  // Solo cachear requests GET — POST/PUT/DELETE no se pueden almacenar en cache
  if (request.method !== "GET") return;

  // API routes: siempre Network-First (datos frescos)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Assets estáticos (_next/static): Cache-First
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
    return;
  }

  // Páginas y todo lo demás: Network-First con fallback a cache
  event.respondWith(networkFirst(request));
});

// Estrategia Network-First: intenta red, si falla usa cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback offline para páginas de navegación
    if (request.mode === "navigate") {
      const fallback = await caches.match("/");
      if (fallback) return fallback;
    }
    return new Response("Sin conexión", { status: 503 });
  }
}

// Estrategia Cache-First: usa cache si existe, si no va a la red
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    return new Response("Asset no disponible offline", { status: 503 });
  }
}
