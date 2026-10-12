'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useToast } from './toast'

interface Ctx { slugs: string[]; has: (slug: string) => boolean; toggle: (slug: string, name?: string) => void }
const C = createContext<Ctx | null>(null)
export function useWishlist() {
  const c = useContext(C)
  if (!c) throw new Error('useWishlist must be used inside <WishlistProvider>')
  return c
}
const KEY = 'licht:wishlist'

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [slugs, setSlugs] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const toast = useToast()
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setSlugs(JSON.parse(raw)) } catch { /* ignore */ }
    setHydrated(true)
  }, [])
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(slugs)) }, [slugs, hydrated])
  const has = useCallback((s: string) => slugs.includes(s), [slugs])
  const toggle = useCallback((slug: string, name?: string) => {
    const on = slugs.includes(slug)
    setSlugs(on ? slugs.filter((x) => x !== slug) : [...slugs, slug])
    toast(on ? `${name ?? 'Item'} removed from your wishlist.` : `${name ?? 'Item'} saved to your wishlist.`, on ? { kind: 'info' } : { action: { label: 'View wishlist', href: '/wishlist' } })
  }, [slugs, toast])
  const value = useMemo(() => ({ slugs, has, toggle }), [slugs, has, toggle])
  return <C.Provider value={value}>{children}</C.Provider>
}
