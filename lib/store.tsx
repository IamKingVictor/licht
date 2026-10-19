'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, flushOutbox } from './db'
import { HAS_SUPABASE } from './config'
import { setCurrency } from './format'
import { seedCategories, seedProducts, seedSettings, seedSlides } from './seed'
import type { Category, HeroSlide, Product, SiteSettings } from './types'

interface StoreCtx {
  categories: Category[]
  products: Product[]
  settings: SiteSettings
  slides: HeroSlide[]
  ready: boolean
  error: string | null
  reload: () => Promise<void>
  bySlug: (slug: string) => Product | undefined
}

const Ctx = createContext<StoreCtx | null>(null)
export function useStore() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useStore must be used inside <StoreProvider>')
  return c
}

const CACHE = 'licht:cache:storefront'

export function StoreProvider({ children }: { children: ReactNode }) {
  // Demo mode can render seed data on the server; Supabase mode shows skeletons until real data arrives.
  const [categories, setCategories] = useState<Category[]>(HAS_SUPABASE ? [] : seedCategories)
  const [products, setProducts] = useState<Product[]>(HAS_SUPABASE ? [] : seedProducts)
  const [settings, setSettings] = useState<SiteSettings>(seedSettings)
  const [slides, setSlides] = useState<HeroSlide[]>(HAS_SUPABASE ? [] : seedSlides)
  const [ready, setReady] = useState(!HAS_SUPABASE)
  const [error, setError] = useState<string | null>(null)

  const apply = useCallback((d: { categories: Category[]; products: Product[]; settings: SiteSettings; slides?: HeroSlide[] }) => {
    setCurrency(d.settings.currency)
    setCategories(d.categories)
    setProducts(d.products)
    setSettings(d.settings)
    setSlides(d.slides ?? [])
  }, [])

  const reload = useCallback(async () => {
    const r = await api.loadStorefront()
    if (r.ok) {
      apply(r.data)
      setError(null)
      try { if (HAS_SUPABASE) localStorage.setItem(CACHE, JSON.stringify(r.data)) } catch { /* quota */ }
    } else {
      setError(r.error)
    }
    setReady(true)
  }, [apply])

  useEffect(() => {
    if (HAS_SUPABASE) {
      try {
        const cached = localStorage.getItem(CACHE)
        if (cached) { apply(JSON.parse(cached)); setReady(true) } // instant paint, then refresh below
      } catch { /* ignore */ }
    }
    reload()
    const online = () => { reload(); flushOutbox() }
    window.addEventListener('online', online)
    flushOutbox()
    return () => window.removeEventListener('online', online)
  }, [apply, reload])

  const bySlug = useCallback((slug: string) => products.find((p) => p.slug === slug), [products])
  const value = useMemo(() => ({ categories, products, settings, slides, ready, error, reload, bySlug }), [categories, products, settings, slides, ready, error, reload, bySlug])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
