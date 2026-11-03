const CACHE = "rk-8";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(["./", "./index.html"]).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);

  if (e.request.mode === "navigate"){
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const c = r.clone();
          caches.open(CACHE).then(x => x.put(e.request, c));
          return r;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  if (u.hostname === "cdn.jsdelivr.net" || u.hostname === "js.stripe.com"){
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request).then(n => {
        const c = n.clone();
        caches.open(CACHE).then(x => x.put(e.request, c));
        return n;
      }).catch(() => r))
    );
  }
});