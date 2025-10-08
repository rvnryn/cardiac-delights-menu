// Service Worker for menu caching and offline support
const CACHE_NAME = "cardiac-delights-menu-v1";
const API_CACHE_NAME = "cardiac-delights-api-v1";

// Cache duration (30 seconds for API, longer for static assets)
const API_CACHE_DURATION = 30 * 1000; // 30 seconds
const STATIC_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// URLs to cache
const STATIC_ASSETS = [
  "/",
  "/Features/Beverages",
  "/Features/RiceToppings",
  "/Features/Sizzlers",
  "/Features/Desserts",
  "/Features/SoupsNoodles",
  "/Features/Extras",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("✅ Service Worker installed successfully");
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("✅ Service Worker activated");
        return self.clients.claim();
      })
  );
});

// Fetch event - handle network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests (menu data)
  if (url.pathname.includes("/api/menu")) {
    event.respondWith(handleMenuAPI(request));
    return;
  }

  // Handle static assets
  if (request.method === "GET") {
    event.respondWith(handleStaticAssets(request));
    return;
  }
});

// Handle menu API requests with cache-first strategy
async function handleMenuAPI(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Check if cached response is still fresh
  if (cachedResponse) {
    const cachedTime = cachedResponse.headers.get("sw-cached-time");
    const isFresh =
      cachedTime && Date.now() - parseInt(cachedTime) < API_CACHE_DURATION;

    if (isFresh) {
      console.log("⚡ Serving fresh cached menu data");

      // Update cache in background if getting close to expiry
      const age = Date.now() - parseInt(cachedTime);
      if (age > API_CACHE_DURATION * 0.8) {
        // Refresh when 80% of cache time has passed
        console.log("🔄 Background refresh triggered");
        fetchAndCacheMenu(request, cache);
      }

      return cachedResponse;
    } else {
      console.log("⏰ Cached data expired, fetching fresh data");
    }
  }

  // Try to fetch fresh data
  try {
    console.log("🌐 Fetching fresh menu data from network");
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      // Clone response before caching
      const responseToCache = networkResponse.clone();

      // Add timestamp header
      const headers = new Headers(responseToCache.headers);
      headers.set("sw-cached-time", Date.now().toString());

      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      // Cache the response
      cache.put(request, cachedResponse);
      console.log("💾 Fresh menu data cached");

      return networkResponse;
    }
  } catch (error) {
    console.warn("🚫 Network request failed:", error);
  }

  // Fallback to cached data if available (even if expired)
  if (cachedResponse) {
    console.log("📱 Network failed, serving stale cached data");
    return cachedResponse;
  }

  // Return error response if no cache available
  return new Response(
    JSON.stringify({ error: "Menu data unavailable offline" }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Background fetch and cache (doesn't block the response)
async function fetchAndCacheMenu(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const responseToCache = response.clone();
      const headers = new Headers(responseToCache.headers);
      headers.set("sw-cached-time", Date.now().toString());

      const cachedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers,
      });

      cache.put(request, cachedResponse);
      console.log("🔄 Background cache update completed");
    }
  } catch (error) {
    console.warn("🔄 Background fetch failed:", error);
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log("⚡ Serving cached static asset");
    return cachedResponse;
  }

  try {
    console.log("🌐 Fetching static asset from network");
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log("💾 Static asset cached");
    }

    return networkResponse;
  } catch (error) {
    console.warn("🚫 Static asset fetch failed:", error);

    // Return offline page for navigation requests
    if (request.destination === "document") {
      return new Response("Offline - Please check your connection", {
        status: 503,
        headers: { "Content-Type": "text/html" },
      });
    }

    throw error;
  }
}
