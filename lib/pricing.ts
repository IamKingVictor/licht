import type { DeliveryMethod, Product, SiteSettings } from './types'

export interface PricedLine {
  product: Product
  quantity: number
}

export function computeTotals(lines: PricedLine[], settings: SiteSettings, method: DeliveryMethod) {
  const subtotal = round(lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0))
  const qualifiesFree = settings.free_delivery_threshold > 0 && subtotal >= settings.free_delivery_threshold
  const delivery_fee = method === 'collection' || subtotal === 0 || qualifiesFree ? 0 : round(settings.delivery_fee)
  return { subtotal, delivery_fee, total: round(subtotal + delivery_fee), qualifiesFree }
}

export const round = (n: number) => Math.round(n * 100) / 100

export function personalisationKey(slug: string, p: Record<string, string>) {
  const body = Object.keys(p)
    .sort()
    .map((k) => `${k}=${p[k]}`)
    .join('|')
  let h = 0
  for (let i = 0; i < body.length; i++) h = (h * 31 + body.charCodeAt(i)) | 0
  return `${slug}:${(h >>> 0).toString(36)}`
}
