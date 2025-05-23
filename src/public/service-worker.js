async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Clone response sebelum digunakan
    const responseToCache = networkResponse.clone();

    // Simpan ke cache tanpa menunggu
    const cachePromise = caches.open(API_CACHE).then((cache) => {
      if (request.method === "GET") {
        cache.put(request, responseToCache);
      }
    });

    // Return response asli
    return networkResponse;
  } catch (error) {
    console.log("Failed", error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || caches.match("/offline.html");
  }
}

async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Clone response sebelum digunakan
    const responseToCache = networkResponse.clone();

    // Simpan ke cache tanpa menunggu
    const cachePromise = caches.open(DYNAMIC_CACHE).then((cache) => {
      if (request.method === "GET") {
        cache.put(request, responseToCache);
      }
    });

    // Return response asli
    return networkResponse;
  } catch (error) {
    console.log("Failed", error);
    if (request.destination === "document") {
      return caches.match("/offline.html");
    }
    return new Response("Network error happened", {
      status: 408,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
