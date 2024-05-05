const cacheName = "MatheStart";
const precachedResources = [
  "/",
  "index.html",
  "js/ui.js",
  "css/index.css",
  "css/mathsstar.css",
  "font/mathsstar.eot",
  "font/mathsstar.svg",
  "font/mathsstar.ttf",
  "font/mathsstar.woff",
  "img/logo_128.svg",
];

async function precache() {
  const cache = await caches.open(cacheName);
  return cache.addAll(precachedResources);
}

function isCacheable(request) {
  const url = new URL(request.url);
  return !url.pathname.endsWith(".json");
}

async function cacheFirstWithRefresh(request) {
  const fetchResponsePromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((e) => {
      console.info(e);
    });

  return (await caches.match(request)) || (await fetchResponsePromise);
}

self.addEventListener("install", (event) => {
  event.waitUntil(precache());
});

self.addEventListener("fetch", (event) => {
  if (isCacheable(event.request)) {
    event.respondWith(cacheFirstWithRefresh(event.request));
  }
});
