'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { personalisationKey } from './pricing'
import type { CartLine, Product } from './types'
import { useToast } from './toast'

interface CartCtx {
  lines: CartLine[]
  count: number
  hydrated: boolean
  add: (product: Product, quantity: number, personalisation?: Record<string, string>) => void
  setQty: (key: string, quantity: number) => void
  remove: (key: string) => void
  clear: () => void
}

const Ctx = createContext<CartCtx | null>(null)
export function useCart() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useCart must be used inside <CartProvider>')
  return c
}

const KEY = 'licht:cart'

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  const toast = useToast()

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) setLines(JSON.parse(raw))
    } catch { /* corrupt storage — start fresh */ }
    setHydrated(true)
    const sync = (e: StorageEvent) => { if (e.key === KEY) try { setLines(JSON.parse(e.newValue || '[]')) } catch { /* ignore */ } }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(lines))
  }, [lines, hydrated])

  const add = useCallback<CartCtx['add']>((product, quantity, personalisation = {}) => {
    const clean = Object.fromEntries(Object.entries(personalisation).filter(([, v]) => v.trim() !== ''))
    const key = personalisationKey(product.slug, clean)
    const qty = Math.max(quantity, product.min_quantity)
    setLines((cur) => {
      const found = cur.find((l) => l.key === key)
      if (found) return cur.map((l) => (l.key === key ? { ...l, quantity: l.quantity + qty } : l))
      return [...cur, { key, slug: product.slug, quantity: qty, personalisation: clean }]
    })
    toast(`${product.name} added to your basket.`, { action: { label: 'View basket', href: '/cart' } })
  }, [toast])

  const setQty = useCallback<CartCtx['setQty']>((key, quantity) => setLines((cur) => cur.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(9999, Math.floor(quantity) || 1)) } : l))), [])
  const remove = useCallback((key: string) => setLines((cur) => cur.filter((l) => l.key !== key)), [])
  const clear = useCallback(() => setLines([]), [])

  const count = useMemo(() => lines.reduce((n, l) => n + l.quantity, 0), [lines])
  const value = useMemo(() => ({ lines, count, hydrated, add, setQty, remove, clear }), [lines, count, hydrated, add, setQty, remove, clear])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
