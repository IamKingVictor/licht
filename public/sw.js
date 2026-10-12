/* LICHT SIGNATURE SOUVENIRS — service worker
 * Strategy: static assets stale-while-revalidate, pages network-first with offline fallback,
 * cross-origin (Supabase) and non-GET requests are never cached.
 */
const VERSION = 'licht-v1'
const STATIC = `${VERSION}-static`
const PAGES = `${VERSION}-pages`
const PRECACHE = ['/offline', '/icons/icon-192.png', '/icons/icon-512.png', '/images/hero-gift-boxes.jpg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return // Supabase, fonts CDN, analytics: let the network handle them
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) return

  // HTML navigations: network first, fall back to cache, then the offline page
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(PAGES).then((c) => c.put(req, copy))
          return res
        })
        .catch(async () => (await caches.match(req)) || (await caches.match('/offline')) || Response.error())
    )
    return
  }

  // Static assets: stale-while-revalidate
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/images') || url.pathname.startsWith('/icons') || /\.(?:woff2?|css|js|png|jpg|jpeg|webp|svg)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(req)
        const network = fetch(req).then((res) => {
          if (res.ok) cache.put(req, res.clone())
          return res
        }).catch(() => cached)
        return cached || network
      })
    )
  }
})
