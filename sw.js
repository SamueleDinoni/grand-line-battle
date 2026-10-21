// Grand Line Battle: tutto in cache, il gioco funziona offline.
const CACHE = "grandline-c8c338ef09f3";
const FILES = ["./", "apple-touch-icon.png", "icon-192.png", "icon-512.png", "icon-maskable-512.png", "index.html", "manifest.webmanifest"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  const path = new URL(req.url).pathname;
  // pagina, online.json e immagini admin: prima la rete (così gli aggiornamenti arrivano subito), poi la cache
  if (req.mode === "navigate" || path.endsWith("/online.json") || path.includes("/admin/")) {
    const cacheKey = req.mode === "navigate" ? "./" : req;
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(cacheKey, copy)); } return res; }).catch(() => caches.match(cacheKey, { ignoreSearch: true })));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req)));
});
