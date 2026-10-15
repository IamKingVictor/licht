'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogOut, Package, ShieldCheck, User } from 'lucide-react'
import { useAuth, DEMO_ADMIN } from '@/lib/auth'
import { HAS_SUPABASE } from '@/lib/config'
import { api } from '@/lib/db'
import { formatDate, humanise, isEmail, money } from '@/lib/format'
import type { Order } from '@/lib/types'
import { Alert, Field, Spinner } from '@/components/ui/fields'
import { Skeleton } from '@/components/ui/bits'
import { useToast } from '@/lib/toast'

export default function AccountView() {
  const { user, loading } = useAuth()
  if (loading) return <div className="mx-auto max-w-3xl px-5 py-14"><Skeleton className="h-64" /></div>
  return user ? <Dashboard /> : <AuthForms />
}

function AuthForms() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState<'in' | 'up' | 'reset'>('in')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const email = String(fd.get('email') ?? '').trim(), password = String(fd.get('password') ?? '')
    setError(''); setInfo('')
    if (!isEmail(email)) return setError('Enter a valid email address.')
    if (mode !== 'reset' && password.length < 6) return setError('Your password must be at least 6 characters.')
    setBusy(true)
    if (mode === 'in') {
      const r = await signIn(email, password)
      if (!r.ok) setError(r.error)
    } else if (mode === 'up') {
      const name = String(fd.get('full_name') ?? '').trim()
      if (!name) { setBusy(false); return setError('Please enter your name.') }
      const r = await signUp(email, password, name, String(fd.get('phone') ?? '').trim())
      if (!r.ok) setError(r.error)
      else if (r.data.needsConfirmation) { setInfo('Check your inbox — we sent you a link to confirm your email address, then sign in.'); setMode('in') }
    } else {
      const r = await resetPassword(email)
      if (!r.ok) setError(r.error); else setInfo('If an account exists for that email, a reset link is on its way.')
    }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-md px-5 py-14 lg:py-20">
      <h2 className="font-serif text-4xl">{mode === 'in' ? 'Welcome back' : mode === 'up' ? 'Create your account' : 'Reset password'}</h2>
      <p className="mt-2 text-sm text-muted">{mode === 'up' ? 'Save your details, track orders and check out faster.' : mode === 'in' ? 'Sign in to view your orders and details.' : 'We will email you a link to choose a new password.'}</p>
      <form onSubmit={submit} noValidate className="mt-8 space-y-5">
        {mode === 'up' && (<><Field name="full_name" label="Full name" required autoComplete="name" /><Field name="phone" type="tel" label="Phone" autoComplete="tel" /></>)}
        <Field name="email" type="email" label="Email" required autoComplete="email" />
        {mode !== 'reset' && <Field name="password" type="password" label="Password" required autoComplete={mode === 'in' ? 'current-password' : 'new-password'} />}
        {error && <Alert kind="error">{error}</Alert>}
        {info && <Alert kind="success">{info}</Alert>}
        <button disabled={busy} className="btn-dark w-full">{busy ? <Spinner /> : mode === 'in' ? 'Sign in' : mode === 'up' ? 'Create account' : 'Send reset link'}</button>
      </form>
      <div className="mt-6 flex flex-wrap justify-between gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
        {mode !== 'in' && <button onClick={() => { setMode('in'); setError(''); setInfo('') }}>Sign in</button>}
        {mode !== 'up' && <button onClick={() => { setMode('up'); setError(''); setInfo('') }}>Create an account</button>}
        {mode === 'in' && <button onClick={() => { setMode('reset'); setError(''); setInfo('') }}>Forgot password?</button>}
      </div>
      {!HAS_SUPABASE && (
        <div className="mt-10 border border-line bg-sand p-4 text-xs leading-5 text-muted">
          <p className="font-medium text-ink">Demo mode</p>
          <p>Accounts are stored in this browser only. Admin demo login: <code>{DEMO_ADMIN.email}</code> / <code>{DEMO_ADMIN.password}</code>. Connect Supabase to go live.</p>
        </div>
      )}
    </div>
  )
}

function Dashboard() {
  const { user, signOut, updateProfile, isAdmin } = useAuth()
  const toast = useToast()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [ordersError, setOrdersError] = useState('')
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState(user?.full_name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')

  useEffect(() => {
    api.myOrders(user?.email).then((r) => { if (r.ok) setOrders(r.data); else { setOrdersError(r.error); setOrders([]) } })
  }, [user?.email])

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const r = await updateProfile({ full_name: name.trim(), phone: phone.trim() })
    setSaving(false)
    toast(r.ok ? 'Your details were saved.' : r.error, { kind: r.ok ? 'success' : 'error' })
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-12 px-5 py-12 md:grid-cols-[1.4fr_1fr] lg:py-16">
      <section>
        <h2 className="mb-6 flex items-center gap-3 font-serif text-3xl"><Package size={22} className="text-gold" /> Your orders</h2>
        {orders === null ? <Skeleton className="h-32" /> : ordersError ? <Alert kind="error">{ordersError}</Alert> : orders.length === 0 ? (
          <div className="border border-dashed border-line p-8 text-center"><p className="text-sm text-muted">You have not placed any orders yet.</p><Link href="/shop" className="btn-dark mt-5">Start shopping</Link></div>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-5">
                <div><p className="font-medium tracking-wide">{o.order_number}</p><p className="text-xs text-muted">{formatDate(o.created_at)} · {humanise(o.status)}</p></div>
                <div className="flex items-center gap-5"><p className="font-serif text-xl">{money(o.total)}</p>
                  <button className="link-line" onClick={() => { sessionStorage.setItem('licht:last-order', JSON.stringify({ number: o.order_number, email: o.email })); window.location.href = `/order/${o.order_number}` }}>View</button></div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="space-y-8">
        <form onSubmit={save} className="space-y-4">
          <h2 className="flex items-center gap-3 font-serif text-3xl"><User size={22} className="text-gold" /> Your details</h2>
          <Field name="email" label="Email" value={user?.email ?? ''} readOnly disabled />
          <Field name="full_name" label="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <Field name="phone" type="tel" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          <button disabled={saving} className="btn-dark btn-sm">{saving ? <Spinner /> : 'Save details'}</button>
        </form>
        <div className="flex flex-wrap gap-3 border-t border-line pt-6">
          {isAdmin && <Link href="/admin" className="btn-gold btn-sm"><ShieldCheck size={14} /> Admin panel</Link>}
          <Link href="/wishlist" className="btn-line btn-sm">Wishlist</Link>
          <button onClick={signOut} className="btn-line btn-sm"><LogOut size={14} /> Sign out</button>
        </div>
      </section>
    </div>
  )
}
