/*
 * Leo Joseph portfolio — service worker.
 *
 * Hand-rolled (no packages) with per-resource-type strategies:
 *   /_next/static/*          cache-first (content-hashed, immutable)
 *   images (face/projects/   stale-while-revalidate (reusable, may change)
 *     publications/effects,
 *     /_next/image)
 *   prod.spline.design       cache-first, only for real CORS responses
 *                            (avoids quota-inflating opaque entries)
 *   navigations (HTML)       network-first with cached-page offline
 *                            fallback (never stale-serves pages)
 *   everything else          network passthrough (API, etc.)
 *
 * Cache versioning: every cache is prefixed with VERSION; activate()
 * deletes anything from other versions. Quota errors purge the
 * offending cache rather than breaking requests. Sensitive/dynamic
 * responses and non-GET requests are never touched.
 */

const VERSION = "leo-portfolio-v2";
const STATIC_CACHE = VERSION + "-static";
const IMAGE_CACHE = VERSION + "-images";
const SPLINE_CACHE = VERSION + "-spline";
const PAGE_CACHE = VERSION + "-pages";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

async function putGuarded(cacheName, request, response) {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response);
  } catch (err) {
    // Quota exceeded or storage unavailable: free this cache and move on.
    try {
      await caches.delete(cacheName);
    } catch (_) {
      /* nothing more we can do */
    }
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const response = await fetch(request);
  if (response && response.ok && response.type !== "opaque") {
    putGuarded(cacheName, request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  const network = fetch(request)
    .then(async (response) => {
      if (response && response.ok && response.type !== "opaque") {
        putGuarded(cacheName, request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return hit || (await network) || Response.error();
}

async function networkFirstPage(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response && response.ok && response.type !== "opaque") {
      putGuarded(PAGE_CACHE, request, response.clone());
    }
    return response;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    return new Response(
      "<!doctype html><title>Offline</title><body style=\"background:#000;color:#fff;font-family:serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0\"><p>You are offline and this page is not in the cache yet.</p></body>",
      { headers: { "Content-Type": "text/html" }, status: 503 }
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static/")) {
      // Only cache-first properly HASHED build assets. Development
      // chunks keep the same URL across rebuilds — caching those would
      // serve stale code against fresh HTML (hydration breakage).
      const hashed = /[a-f0-9]{16,}/.test(url.pathname.split("/").pop() || "");
      if (hashed) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
      }
      return;
    }
    if (
      url.pathname.startsWith("/_next/image") ||
      url.pathname.startsWith("/face/") ||
      url.pathname.startsWith("/projects/") ||
      url.pathname.startsWith("/publications/") ||
      url.pathname.startsWith("/effects/")
    ) {
      event.respondWith(staleWhileRevalidate(request, IMAGE_CACHE));
      return;
    }
    // Same-origin but not matched: plain network, never cached
    // (covers /api/* and anything dynamic).
    return;
  }

  // Spline scenes/runtime from the CDN — big, stable, high repeat value.
  if (url.hostname.endsWith("spline.design")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SPLINE_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const response = await fetch(request);
        // Only store real CORS responses — opaque ones are quota-padded
        // heavily on some engines and would waste the visitor's storage.
        if (response && response.ok && response.type !== "opaque") {
          putGuarded(SPLINE_CACHE, request, response.clone());
        }
        return response;
      })()
    );
    return;
  }

  // All other cross-origin traffic: untouched.
});
