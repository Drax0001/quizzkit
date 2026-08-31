// Minimal, hand-rolled service worker — deliberately simple: precache a tiny
// app shell, network-first navigations with an offline fallback, cache-first
// static assets. It does NOT cache question data or queue offline attempts
// yet (the old CCA Quiz app did that with a localStorage TTL cache + retry
// queue — see docs/multi-domain-playbook.md for the IndexedDB upgrade path).
// A Turbopack-safe starting point over @serwist/next since Serwist's
// injectManifest plugin is webpack-only as of this build.
const CACHE_NAME = "quizkit-shell-v1";
const APP_SHELL = ["/", "/sign-in", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(
          () =>
            caches.match(request).then((cached) => cached) ??
            caches.match("/"),
        ),
    );
    return;
  }

  if (/\.(?:js|css|woff2?|png|svg|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
