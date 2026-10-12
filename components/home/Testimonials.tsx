'use client'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '@/lib/db'
import type { Review } from '@/lib/types'
import { Stars } from '@/components/ui/bits'

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => { api.listReviews(undefined, 8).then((r) => r.ok && setReviews(r.data)) }, [])
  useEffect(() => {
    if (paused || reviews.length < 2) return
    const t = setInterval(() => setI((x) => (x + 1) % reviews.length), 7000)
    return () => clearInterval(t)
  }, [paused, reviews.length])

  if (!reviews.length) return null
  const r = reviews[i % reviews.length]
  return (
    <section className="border-t border-line bg-sand px-5 py-14 sm:py-16 lg:px-10" aria-label="Customer reviews" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="mx-auto max-w-[1360px] text-center">
        <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-gold">What our customers say</p>
        <div className="mb-5 flex justify-center"><Stars value={r.rating} /></div>
        <blockquote key={r.id} className="mx-auto min-h-[7.5rem] max-w-2xl font-serif text-2xl leading-relaxed animate-in fade-in sm:text-3xl">“{r.body}”</blockquote>
        <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-[#7e7469]">— {r.label || r.name}</p>
        {reviews.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <button aria-label="Previous review" onClick={() => setI((i - 1 + reviews.length) % reviews.length)} className="p-1 text-gold"><ChevronLeft size={18} /></button>
            <div className="flex gap-2">{reviews.map((x, n) => <button key={x.id} aria-label={`Review ${n + 1}`} aria-current={n === i} onClick={() => setI(n)} className={`h-1.5 rounded-full transition-all ${n === i ? 'w-6 bg-gold' : 'w-1.5 bg-nude'}`} />)}</div>
            <button aria-label="Next review" onClick={() => setI((i + 1) % reviews.length)} className="p-1 text-gold"><ChevronRight size={18} /></button>
          </div>
        )}
      </div>
    </section>
  )
}
