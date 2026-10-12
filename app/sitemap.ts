import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/config'
import { seedProducts } from '@/lib/seed'

const pages = ['', '/shop', '/about', '/events', '/personalised-gifts', '/corporate-gifts', '/gift-boxes', '/quote', '/contact', '/faq', '/track-order', '/policies/delivery', '/policies/returns', '/policies/terms', '/policies/privacy']

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    ...pages.map((p) => ({ url: `${SITE.url}${p}`, lastModified: now, priority: p === '' ? 1 : 0.7 })),
    ...seedProducts.map((p) => ({ url: `${SITE.url}/shop/${p.slug}`, lastModified: now, priority: 0.6 })),
  ]
}
