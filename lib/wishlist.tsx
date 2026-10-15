'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useToast } from './toast'
import { useAuth } from './auth'
import { api } from './db'

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
  const { user, loading: authLoading } = useAuth()
  const userId = user?.id ?? null
  const syncedFor = useRef<string | null>(null)
  const slugsRef = useRef<string[]>([])
  slugsRef.current = slugs

  // Browser copy = guest wishlist and instant-load cache. Signed-in customers also have it saved in the database.
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) setSlugs(JSON.parse(raw)) } catch { /* ignore */ }
    setHydrated(true)
  }, [])
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(slugs)) }, [slugs, hydrated])

  useEffect(() => {
    if (!hydrated || authLoading) return
    if (!userId) {
      if (syncedFor.current) { syncedFor.current = null; setSlugs([]) }
      return
    }
    if (syncedFor.current === userId) return
    let cancelled = false
    api.wishlist.load().then((r) => {
      if (cancelled || !r.ok) return
      syncedFor.current = userId
      setSlugs([...new Set([...r.data, ...slugsRef.current])])
    })
    return () => { cancelled = true }
  }, [hydrated, authLoading, userId])

  useEffect(() => {
    if (!hydrated || !userId || syncedFor.current !== userId) return
    const t = setTimeout(() => { void api.wishlist.save(slugs) }, 700)
    return () => clearTimeout(t)
  }, [slugs, hydrated, userId])

  const has = useCallback((s: string) => slugs.includes(s), [slugs])
  const toggle = useCallback((slug: string, name?: string) => {
    const on = slugs.includes(slug)
    setSlugs(on ? slugs.filter((x) => x !== slug) : [...slugs, slug])
    toast(on ? `${name ?? 'Item'} removed from your wishlist.` : `${name ?? 'Item'} saved to your wishlist.`, on ? { kind: 'info' } : { action: { label: 'View wishlist', href: '/wishlist' } })
  }, [slugs, toast])
  const value = useMemo(() => ({ slugs, has, toggle }), [slugs, has, toggle])
  return <C.Provider value={value}>{children}</C.Provider>
}
