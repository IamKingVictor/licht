'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { personalisationKey } from './pricing'
import type { CartLine, Product } from './types'
import { useToast } from './toast'
import { useAuth } from './auth'
import { api } from './db'

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

/** Saved lines win, plus anything added as a guest before signing in. Same line in both: keep the larger quantity. */
function mergeLines(remote: CartLine[], local: CartLine[]): CartLine[] {
  const out = new Map(remote.map((l) => [l.key, l]))
  for (const l of local) {
    const r = out.get(l.key)
    out.set(l.key, r ? { ...r, quantity: Math.max(r.quantity, l.quantity) } : l)
  }
  return [...out.values()]
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)
  const toast = useToast()
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const syncedFor = useRef<string | null>(null) // user whose saved cart has been merged in; saving is blocked until then
  const linesRef = useRef<CartLine[]>([])
  linesRef.current = lines

  // The browser copy is the guest cart and an instant-load cache. Signed-in customers also have it saved in the database.
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

  // Signing in: merge the saved cart with the guest cart. Signing out: clear the cart so it does not linger on a shared device.
  useEffect(() => {
    if (!hydrated || authLoading) return
    if (!userId) {
      if (syncedFor.current) { syncedFor.current = null; setLines([]) }
      return
    }
    if (syncedFor.current === userId) return
    let cancelled = false
    api.cart.load().then((r) => {
      if (cancelled || !r.ok) return // on failure keep the local cart and do not overwrite the saved one
      syncedFor.current = userId
      setLines(mergeLines(r.data, linesRef.current))
    })
    return () => { cancelled = true }
  }, [hydrated, authLoading, userId])

  // Save to the database shortly after each change.
  useEffect(() => {
    if (!hydrated || !userId || syncedFor.current !== userId) return
    const t = setTimeout(() => { void api.cart.save(lines) }, 700)
    return () => clearTimeout(t)
  }, [lines, hydrated, userId])

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
