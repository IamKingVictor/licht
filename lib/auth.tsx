'use client'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { HAS_SUPABASE } from './config'
import { getSupabase } from './supabase'
import { errMsg } from './db'
import type { Res } from './types'

export interface AuthUser { id: string; email: string; full_name: string; phone: string; role: 'customer' | 'admin' }

interface AuthCtx {
  user: AuthUser | null
  loading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<Res<AuthUser>>
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<Res<{ needsConfirmation: boolean }>>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<Res<true>>
  updateProfile: (patch: { full_name: string; phone: string }) => Promise<Res<true>>
}

const Ctx = createContext<AuthCtx | null>(null)
export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used inside <AuthProvider>')
  return c
}

/* demo-mode accounts live in browser storage only */
const USERS = 'licht:demo:users'
const SESSION = 'licht:demo:session'
export const DEMO_ADMIN = { email: 'admin@licht.demo', password: 'admin123' }
type DemoUser = AuthUser & { password: string }

function demoUsers(): DemoUser[] {
  try {
    const raw = localStorage.getItem(USERS)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  const seed: DemoUser[] = [{ id: 'demo-admin', email: DEMO_ADMIN.email, password: DEMO_ADMIN.password, full_name: 'Demo Admin', phone: '', role: 'admin' }]
  localStorage.setItem(USERS, JSON.stringify(seed))
  return seed
}
const strip = ({ password: _p, ...u }: DemoUser): AuthUser => u

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (id: string, email: string) => {
    const sb = getSupabase()
    if (!sb) return
    const { data } = await sb.from('profiles').select('full_name, phone, role').eq('id', id).maybeSingle()
    setUser({ id, email, full_name: data?.full_name ?? '', phone: data?.phone ?? '', role: data?.role === 'admin' ? 'admin' : 'customer' })
  }, [])

  useEffect(() => {
    const sb = getSupabase()
    if (!sb) {
      try {
        const s = JSON.parse(localStorage.getItem(SESSION) || 'null')
        const found = s ? demoUsers().find((u) => u.id === s.id) : null
        setUser(found ? strip(found) : null)
      } catch { setUser(null) }
      setLoading(false)
      return
    }
    let active = true
    sb.auth.getSession().then(async ({ data }) => {
      if (!active) return
      const u = data.session?.user
      if (u) await loadProfile(u.id, u.email ?? '')
      setLoading(false)
    })
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      const u = session?.user
      if (u) setTimeout(() => loadProfile(u.id, u.email ?? ''), 0)
      else setUser(null)
    })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [loadProfile])

  const signIn: AuthCtx['signIn'] = useCallback(async (email, password) => {
    try {
      const sb = getSupabase()
      if (!sb) {
        const u = demoUsers().find((x) => x.email === email.trim().toLowerCase() && x.password === password)
        if (!u) return { ok: false, error: 'Incorrect email or password.' }
        localStorage.setItem(SESSION, JSON.stringify({ id: u.id }))
        setUser(strip(u))
        return { ok: true, data: strip(u) }
      }
      const { data, error } = await sb.auth.signInWithPassword({ email: email.trim(), password })
      if (error) return { ok: false, error: /invalid login/i.test(error.message) ? 'Incorrect email or password.' : errMsg(error) }
      const { data: p } = await sb.from('profiles').select('full_name, phone, role').eq('id', data.user.id).maybeSingle()
      const u: AuthUser = { id: data.user.id, email: data.user.email ?? email, full_name: p?.full_name ?? '', phone: p?.phone ?? '', role: p?.role === 'admin' ? 'admin' : 'customer' }
      setUser(u)
      return { ok: true, data: u }
    } catch (e) { return { ok: false, error: errMsg(e) } }
  }, [])

  const signUp: AuthCtx['signUp'] = useCallback(async (email, password, fullName, phone) => {
    try {
      const sb = getSupabase()
      if (!sb) {
        const list = demoUsers()
        const mail = email.trim().toLowerCase()
        if (list.some((u) => u.email === mail)) return { ok: false, error: 'An account with this email already exists.' }
        const u: DemoUser = { id: crypto.randomUUID(), email: mail, password, full_name: fullName, phone, role: 'customer' }
        localStorage.setItem(USERS, JSON.stringify([...list, u]))
        localStorage.setItem(SESSION, JSON.stringify({ id: u.id }))
        setUser(strip(u))
        return { ok: true, data: { needsConfirmation: false } }
      }
      const { data, error } = await sb.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName, phone } } })
      if (error) return { ok: false, error: errMsg(error) }
      return { ok: true, data: { needsConfirmation: !data.session } }
    } catch (e) { return { ok: false, error: errMsg(e) } }
  }, [])

  const signOut = useCallback(async () => {
    const sb = getSupabase()
    if (sb) await sb.auth.signOut()
    else localStorage.removeItem(SESSION)
    setUser(null)
  }, [])

  const resetPassword: AuthCtx['resetPassword'] = useCallback(async (email) => {
    const sb = getSupabase()
    if (!sb) return { ok: true, data: true }
    const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/account` })
    return error ? { ok: false, error: errMsg(error) } : { ok: true, data: true }
  }, [])

  const updateProfile: AuthCtx['updateProfile'] = useCallback(async (patch) => {
    if (!user) return { ok: false, error: 'Please sign in first.' }
    const sb = getSupabase()
    if (!sb) {
      const list = demoUsers().map((u) => (u.id === user.id ? { ...u, ...patch } : u))
      localStorage.setItem(USERS, JSON.stringify(list))
    } else {
      const { error } = await sb.from('profiles').update(patch).eq('id', user.id)
      if (error) return { ok: false, error: errMsg(error) }
    }
    setUser({ ...user, ...patch })
    return { ok: true, data: true }
  }, [user])

  const value = useMemo<AuthCtx>(() => ({ user, loading, isAdmin: user?.role === 'admin', signIn, signUp, signOut, resetPassword, updateProfile }), [user, loading, signIn, signUp, signOut, resetPassword, updateProfile])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export { HAS_SUPABASE }
