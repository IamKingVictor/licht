'use client'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import ProductCard from './ProductCard'
import { EmptyState, Skeleton } from '@/components/ui/bits'
import { Select } from '@/components/ui/fields'

const SORTS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name A–Z' },
]
const PRICES = [
  { value: '', label: 'Any price' }, { value: '0-25', label: 'Under £25' }, { value: '25-50', label: '£25 – £50' },
  { value: '50-100', label: '£50 – £100' }, { value: '100-', label: '£100 +' },
]

export default function ShopView({ fixedCategory, hideFilters = false }: { fixedCategory?: string; hideFilters?: boolean }) {
  const { products, categories, ready, error, reload } = useStore()
  const sp = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const category = fixedCategory ?? sp.get('category') ?? ''
  const sort = sp.get('sort') ?? 'featured'
  const price = sp.get('price') ?? ''
  const personalised = sp.get('personalised') === '1'
  const bestsellers = sp.get('filter') === 'bestsellers'
  const urlQ = sp.get('q') ?? ''
  const [q, setQ] = useState(urlQ)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => setQ(urlQ), [urlQ])

  const set = (patch: Record<string, string>) => {
    const next = new URLSearchParams(sp.toString())
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)))
    router.replace(`${pathname}${next.toString() ? `?${next}` : ''}`, { scroll: false })
  }
  useEffect(() => {
    if (q === urlQ) return
    const t = setTimeout(() => set({ q: q.trim() }), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  const list = useMemo(() => {
    let l = products.filter((p) => !category || p.category_slug === category)
    if (urlQ) { const t = urlQ.toLowerCase(); l = l.filter((p) => `${p.name} ${p.short_description} ${p.description} ${p.occasions.join(' ')} ${p.category_slug}`.toLowerCase().includes(t)) }
    if (personalised) l = l.filter((p) => p.is_personalisable)
    if (bestsellers) l = l.filter((p) => p.is_bestseller)
    if (price) { const [min, max] = price.split('-'); l = l.filter((p) => p.price >= Number(min || 0) && (!max || p.price < Number(max))) }
    const s = [...l]
    if (sort === 'price-asc') s.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') s.sort((a, b) => b.price - a.price)
    else if (sort === 'name') s.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'newest') s.sort((a, b) => b.created_at.localeCompare(a.created_at))
    else s.sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.sort_order - b.sort_order)
    return s
  }, [products, category, urlQ, personalised, bestsellers, price, sort])

  const active = [category && !fixedCategory, urlQ, personalised, bestsellers, price].filter(Boolean).length
  const reset = () => { setQ(''); router.replace(pathname, { scroll: false }) }

  return (
    <div>
      {!hideFilters && (
        <div className="mb-8 space-y-5">
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="tablist" aria-label="Categories">
            {[{ slug: '', name: 'All' }, ...categories].map((c) => {
              const on = category === c.slug
              return <button key={c.slug} role="tab" aria-selected={on} onClick={() => set({ category: c.slug })} className={`shrink-0 border px-4 py-2.5 text-[10px] uppercase tracking-[0.16em] transition-colors ${on ? 'border-ink bg-ink text-white' : 'border-line hover:border-gold hover:text-gold'}`}>{c.name}</button>
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-[200px] flex-1 items-center gap-2 border border-line bg-white/60 px-4 py-3 focus-within:border-gold">
              <Search size={15} className="text-gold" />
              <input value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" placeholder="Search products" className="w-full bg-transparent text-sm outline-none placeholder:text-faint" />
              {q && <button aria-label="Clear search" onClick={() => setQ('')}><X size={14} /></button>}
            </div>
            <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} className="btn-line btn-sm"><SlidersHorizontal size={14} /> Filters{active ? ` (${active})` : ''}</button>
            <label className="sr-only" htmlFor="sort">Sort by</label>
            <select id="sort" value={sort} onChange={(e) => set({ sort: e.target.value === 'featured' ? '' : e.target.value })} className="field !w-auto">
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {showFilters && (
            <div className="grid gap-5 border border-line bg-white/50 p-5 sm:grid-cols-3">
              <Select label="Price" value={price} onChange={(e) => set({ price: e.target.value })} options={PRICES} />
              <label className="flex cursor-pointer items-center gap-3 self-end py-3 text-sm"><input type="checkbox" checked={personalised} onChange={(e) => set({ personalised: e.target.checked ? '1' : '' })} className="h-4 w-4 accent-[#9a7644]" /> Personalisable only</label>
              <label className="flex cursor-pointer items-center gap-3 self-end py-3 text-sm"><input type="checkbox" checked={bestsellers} onChange={(e) => set({ filter: e.target.checked ? 'bestsellers' : '' })} className="h-4 w-4 accent-[#9a7644]" /> Bestsellers only</label>
            </div>
          )}
          <p className="text-xs text-muted" aria-live="polite">{ready ? `${list.length} product${list.length === 1 ? '' : 's'}` : 'Loading…'}{active > 0 && <button onClick={reset} className="ml-4 border-b border-gold text-gold">Clear all</button>}</p>
        </div>
      )}

      {error && !products.length ? (
        <EmptyState title="We couldn’t load the collection" text={error} action={<button onClick={reload} className="btn-dark">Try again</button>} />
      ) : !ready ? (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[0.9]" />)}</div>
      ) : list.length === 0 ? (
        <EmptyState title="Nothing matches yet" text="Try removing a filter or searching for something else — or tell us what you are looking for and we will create it." action={<div className="flex flex-wrap justify-center gap-3"><button onClick={reset} className="btn-line">Clear filters</button><Link href="/quote?type=custom" className="btn-dark">Request a custom order</Link></div>} />
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-5">{list.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 4} />)}</div>
      )}
    </div>
  )
}
