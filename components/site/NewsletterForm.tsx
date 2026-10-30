'use client'
import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { api } from '@/lib/db'
import { isEmail } from '@/lib/format'
import { Honeypot, isSpam, Spinner } from '@/components/ui/fields'

export default function NewsletterForm({ dark = false }: { dark?: boolean }) {
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (isSpam(fd)) { setState('done'); setMsg('Thank you for subscribing.'); return }
    const email = String(fd.get('email') ?? '').trim()
    if (!isEmail(email)) { setError('Enter a valid email address.'); return }
    setError(''); setState('sending')
    const r = await api.subscribe(email)
    if (!r.ok) { setError(r.error); setState('idle'); return }
    setMsg(r.data.already ? 'You are already on our list — thank you.' : 'Thank you — you are on the list.')
    setState('done')
  }

  if (state === 'done') return <p role="status" className={`flex items-center gap-2 text-sm ${dark ? 'text-champagne' : 'text-forest'}`}><Check size={16} /> {msg}</p>
  return (
    <form onSubmit={submit} noValidate className="relative">
      <Honeypot />
      <div className={`flex border-b pb-2 ${error ? 'border-[#e58b73]' : 'border-gold'}`}>
        <input name="email" type="email" autoComplete="email" aria-label="Email address" placeholder="Your email address" className={`w-full bg-transparent text-xs outline-none ${dark ? 'text-cream placeholder:text-[#aab5ae]' : 'placeholder:text-faint'}`} />
        <button aria-label="Subscribe" disabled={state === 'sending'} className={dark ? 'text-champagne' : 'text-forest'}>{state === 'sending' ? <Spinner /> : <Plus size={16} />}</button>
      </div>
      {error && <p role="alert" className={dark ? 'mt-1.5 text-xs text-[#f2b8a8]' : 'err-text'}>{error}</p>}
    </form>
  )
}
