'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth, DEMO_ADMIN } from '@/lib/auth'
import { HAS_SUPABASE } from '@/lib/config'
import { Alert, Field, Spinner } from '@/components/ui/fields'

export default function AdminLogin() {
  const { user, isAdmin, loading, signIn, signOut } = useAuth()
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!loading && user && isAdmin) router.replace('/admin') }, [loading, user, isAdmin, router])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setBusy(true); setError('')
    const r = await signIn(String(fd.get('email') ?? ''), String(fd.get('password') ?? ''))
    setBusy(false)
    if (!r.ok) setError(r.error)
    else if (r.data.role !== 'admin') setError('This account does not have admin access.')
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-10 block text-center"><span className="block font-serif text-3xl tracking-[0.23em]">LICHT</span><span className="mt-1 block text-[9px] tracking-[0.39em] text-forest">SIGNATURE SOUVENIRS</span></Link>
      <form onSubmit={submit} className="space-y-5 border border-line bg-white/60 p-8" noValidate>
        <h1 className="font-serif text-3xl">Admin sign in</h1>
        <Field name="email" type="email" label="Email" required autoComplete="email" defaultValue={HAS_SUPABASE ? '' : DEMO_ADMIN.email} />
        <Field name="password" type="password" label="Password" required autoComplete="current-password" defaultValue={HAS_SUPABASE ? '' : DEMO_ADMIN.password} />
        {error && <Alert kind="error">{error}</Alert>}
        {user && !isAdmin && <Alert kind="info">You are signed in as {user.email}, which is not an admin. <button type="button" onClick={signOut} className="underline">Sign out</button></Alert>}
        <button disabled={busy} className="btn-dark w-full">{busy ? <Spinner /> : 'Sign in'}</button>
        {!HAS_SUPABASE && <p className="text-xs leading-5 text-muted">Demo mode: credentials are pre-filled. Changes are stored in this browser only.</p>}
      </form>
    </div>
  )
}
