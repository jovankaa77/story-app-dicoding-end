const CACHE_NAME = "story-app-cache-v1";
const STATIC_CACHE = "story-app-static-v1";
const DYNAMIC_CACHE = "story-app-dynamic-v1";
const API_CACHE = "story-app-api-v1";

const assetsToCache = [
  "/",
  "/index.html",
  "/app.bundle.js",
  "/app.webmanifest",
  "/favicon.ico",
  "/images/story-app-small.png",
  "/images/story-app-big.png",
  "/offline.html",
  "/styles/styles.css", // Tambahkan CSS yang missing
  "/scripts/xlows/spp.js", // Tambahkan JS yang missing
];

self.addEventListener("install", (event) => {
  console.log("Installing SW...");
  self.skipWaiting();

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Caching assets");
      return cache.addAll(assetsToCache).catch((error) => {
        console.error("Failed to cache some assets:", error);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("SW activated");
  event.waitUntil(clients.claim());

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith("story-app-") &&
              cacheName !== STATIC_CACHE &&
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE
          )
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests use network first strategy
  if (
    url.pathname.startsWith("/api") ||
    url.hostname.includes("dicoding.dev")
  ) {
    event.respondWith(networkFirstStrategy(request));
  } else {
    // All other requests use cache first strategy
    event.respondWith(cacheFirstStrategy(request));
  }
});

async function networkFirstStrategy(request) {
  try {
    // Fetch from network
    const networkResponse = await fetch(request);

    // Clone response immediately for caching
    const responseClone = networkResponse.clone();

    // Cache the response in background
    caches.open(API_CACHE).then((cache) => {
      if (request.method === "GET") {
        cache.put(request, responseClone).catch((err) => {
          console.error("Failed to cache API response:", err);
        });
      }
    });

    return networkResponse;
  } catch (error) {
    console.log("Network failed, trying cache...", error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match("/offline.html");
  }
}

async function cacheFirstStrategy(request) {
  try {
    // Try to get from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);

    // Clone response immediately for caching
    const responseClone = networkResponse.clone();

    // Cache the response in background
    caches.open(DYNAMIC_CACHE).then((cache) => {
      if (request.method === "GET") {
        cache.put(request, responseClone).catch((err) => {
          console.error("Failed to cache dynamic response:", err);
        });
      }
    });

    return networkResponse;
  } catch (error) {
    console.log("Fetch failed, serving fallback", error);
    if (request.destination === "document") {
      return caches.match("/offline.html");
    }
    return new Response("Network error", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

// Push notification handlers remain the same
self.addEventListener("push", handlePush);
self.addEventListener("notificationclick", handleNotificationClick);

function handlePush(event) {
  let data = {
    title: "Notifikasi",
    body: "Ada pesan masuk!",
    url: "/",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || "Pesan baru diterima.",
    icon: "/images/story-app-small.png",
    badge: "/images/story-app-big.png",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Notifikasi", options)
  );
}

function handleNotificationClick(event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === targetUrl && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
}
