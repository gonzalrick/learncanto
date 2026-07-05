/* Service worker for the Learn Cantonese PWA.
   Precaches the app shell so every lesson works offline after the
   first visit, and runtime-caches the Google Fonts. Bump CACHE
   (e.g. v2, v3) whenever you redeploy changed files. */
const CACHE = "canto-v10";

const ASSETS = [
  "/",
  "/index.html",
  "/cantonese-foundations.html",
  "/cantonese-basics.html",
  "/cantonese-meeting-the-family.html",
  "/cantonese-beyond-basics.html",
  "/cantonese-conversational.html",
  "/cantonese-listening-dojo.html",
  "/cantonese-characters.html",
  "/night.css",
  "/nav.js",
  "/data/found.js",
  "/data/chars.js",
  "/data/basics.js",
  "/data/family.js",
  "/data/beyond.js",
  "/data/conv.js",
  "/data/dojo.js",
  "/voice.js",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-180.png",
  "/icon-192-maskable.png",
  "/icon-512-maskable.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then((c) => c.addAll(ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isFont = /fonts\.(googleapis|gstatic)\.com$/.test(url.host);

  // Network-first for our own HTML pages (so updates show after redeploy),
  // falling back to cache when offline.
  if (sameOrigin && req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match("/index.html")),
        ),
    );
    return;
  }

  // Cache-first for everything else (assets, fonts).
  e.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req)
          .then((res) => {
            if (sameOrigin || isFont) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => hit),
    ),
  );
});
