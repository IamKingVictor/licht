'use client'
import Link from 'next/link'
import { useMemo } from 'react'
import { ArrowRight, Minus, Plus, Trash2, Truck } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useStore } from '@/lib/store'
import { computeTotals } from '@/lib/pricing'
import { money } from '@/lib/format'
import { EmptyState, Skeleton } from '@/components/ui/bits'
import { ProductImage } from '@/components/shop/ProductCard'
import type { Product } from '@/lib/types'

export function personalisationText(product: Product | undefined, p: Record<string, string>) {
  return Object.entries(p).filter(([, v]) => v).map(([k, v]) => {
    const label = product?.personalisation_fields.find((f) => f.key === k)?.label ?? k
    return [label, v] as const
  })
}

export default function CartView() {
  const { lines, hydrated, setQty, remove, clear } = useCart()
  const { bySlug, settings, ready } = useStore()

  const rows = useMemo(() => lines.map((l) => ({ line: l, product: bySlug(l.slug) })), [lines, bySlug])
  const valid = rows.filter((r): r is { line: typeof r.line; product: Product } => Boolean(r.product))
  const totals = computeTotals(valid.map((r) => ({ product: r.product, quantity: r.line.quantity })), settings, 'delivery')
  const itemCount = valid.reduce((n, r) => n + r.line.quantity, 0)
  const toFree = Math.max(0, settings.free_delivery_threshold - totals.subtotal)
  const progress = settings.free_delivery_threshold ? Math.min(100, (totals.subtotal / settings.free_delivery_threshold) * 100) : 0

  if (!hydrated || !ready) return <div className="mx-auto max-w-[1360px] space-y-4 px-5 py-14 lg:px-10"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>

  if (!lines.length) {
    return (
      <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10">
        <EmptyState title="Your basket is empty" text="Discover beautifully presented souvenirs, personalised gifts and curated gift boxes." action={<div className="flex flex-wrap justify-center gap-3"><Link href="/shop" className="btn-dark">Start shopping <ArrowRight size={15} /></Link><Link href="/quote" className="btn-line">Request a quote</Link></div>} />
      </div>
    )
  }

  return (
    <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14 lg:px-10 lg:py-14">
      <div>
        <div className="mb-2 flex items-center justify-between border-b border-line pb-4">
          <p className="text-xs text-muted">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
          <button onClick={() => { if (confirm('Remove everything from your basket?')) clear() }} className="text-[10px] uppercase tracking-[0.16em] text-muted">Clear basket</button>
        </div>
        <ul className="divide-y divide-line">
          {rows.map(({ line, product }) => {
            const extras = personalisationText(product, line.personalisation)
            if (!product) {
              return (
                <li key={line.key} className="flex items-center justify-between gap-4 py-6">
                  <p className="text-sm text-[#a3412e]">This product is no longer available.</p>
                  <button onClick={() => remove(line.key)} className="btn-line btn-sm">Remove</button>
                </li>
              )
            }
            const step = product.min_quantity > 10 ? 5 : 1
            const max = product.stock ?? 9999
            return (
              <li key={line.key} className="grid grid-cols-[88px_1fr] gap-4 py-6 sm:grid-cols-[120px_1fr_auto] sm:gap-6">
                <Link href={`/shop/${product.slug}`} className="relative aspect-[0.9] overflow-hidden bg-sand"><ProductImage src={product.images[0]} alt={product.name} sizes="120px" /></Link>
                <div className="min-w-0">
                  <h3 className="font-serif text-xl leading-tight"><Link href={`/shop/${product.slug}`} className="hover:text-forest">{product.name}</Link></h3>
                  <p className="mt-1 text-xs text-forest">{product.price_is_from ? 'From ' : ''}{money(product.price)} each</p>
                  {extras.length > 0 && <dl className="mt-2 space-y-0.5 text-xs text-muted">{extras.map(([k, v]) => <div key={k} className="flex gap-2"><dt className="shrink-0 text-faint">{k}:</dt><dd className="break-words">{v}</dd></div>)}</dl>}
                  {line.quantity < product.min_quantity && <p className="err-text">Minimum order is {product.min_quantity}.</p>}
                  <div className="mt-4 flex items-center gap-5 sm:hidden">
                    <Qty value={line.quantity} onChange={(n) => setQty(line.key, Math.min(max, Math.max(product.min_quantity, n)))} step={step} />
                    <button onClick={() => remove(line.key)} aria-label={`Remove ${product.name}`} className="text-faint"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="hidden flex-col items-end justify-between sm:flex">
                  <p className="font-serif text-xl">{money(product.price * line.quantity)}</p>
                  <div className="flex items-center gap-5">
                    <Qty value={line.quantity} onChange={(n) => setQty(line.key, Math.min(max, Math.max(product.min_quantity, n)))} step={step} />
                    <button onClick={() => remove(line.key)} aria-label={`Remove ${product.name}`} className="text-faint"><Trash2 size={16} /></button>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
        <Link href="/shop" className="link-line mt-6">Continue shopping <ArrowRight size={14} /></Link>
      </div>

      <aside className="h-fit border border-line bg-white/50 p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-3xl">Order summary</h2>
        {settings.free_delivery_threshold > 0 && (
          <div className="mt-5">
            <p className="flex items-center gap-2 text-xs text-muted"><Truck size={14} className="text-forest" />{toFree > 0 ? <>Add <strong className="text-ink">{money(toFree)}</strong> for free delivery</> : 'You qualify for free delivery'}</p>
            <div className="mt-2 h-1 bg-nude"><div className="h-1 bg-gold-soft transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        )}
        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{totals.delivery_fee === 0 ? 'Free' : money(totals.delivery_fee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 font-serif text-2xl"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
        </dl>
        <p className="mt-2 text-[11px] leading-5 text-faint">Delivery shown for standard delivery; collection is always free. Final amount is confirmed at checkout.</p>
        <Link href="/checkout" className={`btn-dark mt-6 w-full ${valid.length !== rows.length ? 'pointer-events-none opacity-50' : ''}`} aria-disabled={valid.length !== rows.length}>Checkout securely <ArrowRight size={15} /></Link>
        {itemCount >= settings.bulk_threshold && (
          <div className="mt-6 border border-gold-soft/50 bg-sand p-4 text-xs leading-5">
            <p className="font-medium">Ordering for a large event?</p>
            <p className="mt-1 text-muted">Request a tailored quote for bulk pricing, branding and custom packaging.</p>
            <Link href="/quote?type=bulk" className="mt-2 inline-block border-b border-gold text-forest">Request a quote</Link>
          </div>
        )}
      </aside>
    </div>
  )
}

function Qty({ value, onChange, step }: { value: number; onChange: (n: number) => void; step: number }) {
  return (
    <div className="flex items-center border border-line bg-white/60" role="group" aria-label="Quantity">
      <button aria-label="Decrease quantity" onClick={() => onChange(value - step)} className="p-2.5"><Minus size={13} /></button>
      <span className="w-10 text-center text-sm" aria-live="polite">{value}</span>
      <button aria-label="Increase quantity" onClick={() => onChange(value + step)} className="p-2.5"><Plus size={13} /></button>
    </div>
  )
}
