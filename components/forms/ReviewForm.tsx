'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import { api } from '@/lib/db'
import { Alert, Field, Honeypot, Spinner, TextArea, formString, isSpam } from '@/components/ui/fields'

export default function ReviewForm({ productSlug }: { productSlug: string }) {
  const [rating, setRating] = useState(5)
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (isSpam(fd)) { setState('done'); return }
    const name = formString(fd, 'name'), body = formString(fd, 'body')
    if (!name) return setError('Please add your name.')
    if (body.length < 10) return setError('Please write at least a sentence about your experience.')
    setError(''); setState('sending')
    const r = await api.submitReview({ name, body, rating, title: formString(fd, 'title') || undefined, product_slug: productSlug })
    if (!r.ok) { setError(r.error); setState('idle'); return }
    setState('done')
  }

  if (state === 'done') return <Alert kind="success" title="Thank you for your review">It will appear on the page once our team has approved it.</Alert>
  if (!open) return <button onClick={() => setOpen(true)} className="link-line">Write a review</button>
  return (
    <form onSubmit={submit} noValidate className="relative max-w-xl space-y-4 border border-line bg-white/50 p-6">
      <Honeypot />
      <div>
        <span className="lbl">Your rating</span>
        <div className="flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((i) => (
            <button type="button" key={i} role="radio" aria-checked={rating === i} aria-label={`${i} star${i > 1 ? 's' : ''}`} onClick={() => setRating(i)} className="p-1 text-gold-soft"><Star size={22} fill={i <= rating ? 'currentColor' : 'none'} /></button>
          ))}
        </div>
      </div>
      <Field name="name" label="Your name" required autoComplete="name" />
      <Field name="title" label="Headline" placeholder="Optional" />
      <TextArea name="body" label="Your review" required rows={4} />
      {error && <Alert kind="error">{error}</Alert>}
      <button disabled={state === 'sending'} className="btn-dark btn-sm">{state === 'sending' ? <><Spinner /> Sending…</> : 'Submit review'}</button>
    </form>
  )
}
