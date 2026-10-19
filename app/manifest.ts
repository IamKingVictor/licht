import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'LICHT SIGNATURE SOUVENIRS',
    short_name: 'LICHT',
    description: "Premium souvenirs, personalised gifts and curated gift boxes for life's special moments.",
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#080807',
    theme_color: '#28231f',
    categories: ['shopping', 'lifestyle'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Shop', url: '/shop', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'My basket', url: '/cart', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Request a quote', url: '/quote', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  }
}
