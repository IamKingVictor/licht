'use client'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useStore } from '@/lib/store'
import { seedSlides } from '@/lib/seed'
import { ProductImage } from '@/components/shop/ProductCard'

/** Time each slide stays on screen. */
export const SLIDE_MS = 5000

export default function HeroCarousel() {
  const { slides, ready } = useStore()
  // Slides come from the database; until some exist (or the table is not created yet) the default slides are shown.
  const list = useMemo(() => {
    const active = slides.filter((s) => s.is_active).sort((a, b) => a.sort_order - b.sort_order)
    return active.length ? active : seedSlides
  }, [slides])
  const count = list.length

  const [index, setIndex] = useState(0)
  const [userPaused, setUserPaused] = useState(false)
  const [hover, setHover] = useState(false)
  const [kbFocus, setKbFocus] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [reduced, setReduced] = useState(false)
  const touch = useRef<{ x: number; y: number } | null>(null)

  const current = count ? index % count : 0
  const playing = count > 1 && !userPaused && !hover && !kbFocus && !hidden && !reduced

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count])

  // Respect "reduce motion" and pause while the tab is in the background.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    const vis = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', vis)
    return () => { mq.removeEventListener('change', sync); document.removeEventListener('visibilitychange', vis) }
  }, [])

  // Advance every SLIDE_MS. The timer restarts after any manual change or pause, matching the progress bar on the dots.
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS)
    return () => clearTimeout(t)
  }, [playing, current, count])

  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touch.current; touch.current = null
    if (!s) return
    const dx = e.changedTouches[0].clientX - s.x
    const dy = e.changedTouches[0].clientY - s.y
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) go(current + (dx < 0 ? 1 : -1))
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(current + 1)
    if (e.key === 'ArrowLeft') go(current - 1)
  }

  return (
    <section
      id="top"
      aria-roledescription="carousel"
      aria-label="Featured collections"
      onKeyDown={onKeyDown}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={(e) => setKbFocus(e.target.matches(':focus-visible'))}
      onBlur={() => setKbFocus(false)}
      className="relative isolate mx-3 mt-3 overflow-hidden rounded-[2rem] border border-line bg-cream sm:mx-6 sm:mt-4"
    >
      {/* gifts & souvenirs collage at 50% opacity */}
      <div aria-hidden className="hero-bg absolute inset-0 -z-20" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-cream/70" />

      <h1 className="sr-only">LICHT SIGNATURE SOUVENIRS — premium souvenirs, personalised gifts and curated gift boxes</h1>

      <div className="mx-auto max-w-[1360px] px-5 pb-4 pt-8 sm:px-8 sm:pt-10 md:px-10 md:pt-14" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd} style={{ touchAction: 'pan-y' }}>
        {!ready && slides.length === 0 ? (
          <div className="grid items-center gap-8 md:grid-cols-[0.95fr_1.05fr]" aria-hidden>
            <div className="order-2 h-72 animate-pulse rounded-3xl bg-cream/70 md:order-1" />
            <div className="order-1 aspect-[4/3] animate-pulse rounded-3xl bg-sand/80 md:order-2 md:aspect-square" />
          </div>
        ) : (
          <div className="grid" aria-live={playing ? 'off' : 'polite'}>
            {list.map((s, i) => {
              const active = i === current
              return (
                <article
                  key={s.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${i + 1} of ${count}`}
                  aria-hidden={!active}
                  inert={!active}
                  className={`col-start-1 row-start-1 grid items-center gap-6 transition-all duration-700 ease-out md:grid-cols-[0.95fr_1.05fr] md:gap-10 ${active ? 'z-10 translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
                >
                  <div className="order-2 max-w-xl rounded-3xl bg-cream/80 p-6 shadow-[0_20px_50px_-30px_rgba(156,58,94,0.45)] backdrop-blur-sm sm:p-8 md:order-1">
                    {s.eyebrow && <p className="mb-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold"><span className="h-px w-8 bg-gold-soft" />{s.eyebrow}</p>}
                    <h2 className="font-serif text-[40px] leading-[1] tracking-[-0.03em] sm:text-6xl lg:text-[70px]">
                      {s.title}
                      {s.title_em && <><br /><em className="font-light text-rose">{s.title_em}</em></>}
                    </h2>
                    {s.body && <p className="mt-5 max-w-md text-[15px] leading-7 text-muted">{s.body}</p>}
                    {(s.cta_label || s.cta2_label) && (
                      <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                        {s.cta_label && s.cta_href && <Link href={s.cta_href} className="btn-dark">{s.cta_label} <ArrowRight size={15} /></Link>}
                        {s.cta2_label && s.cta2_href && <Link href={s.cta2_href} className="link-line">{s.cta2_label} <ArrowRight size={14} /></Link>}
                      </div>
                    )}
                  </div>
                  <div className="relative order-1 md:order-2">
                    <div className="absolute -bottom-4 -left-3 hidden h-24 w-24 rounded-3xl border-2 border-rose/40 sm:block" />
                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand shadow-[0_24px_60px_-28px_rgba(43,32,37,0.55)] md:aspect-[1/1] lg:max-h-[600px] lg:w-full">
                      <ProductImage src={s.image_url} alt={s.title} priority={i === 0} sizes="(max-width: 768px) 100vw, 55vw" />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {count > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3 pb-2 sm:mt-8">
            <button aria-label="Previous slide" onClick={() => go(current - 1)} className="rounded-full border border-line bg-white/80 p-2.5 transition-all hover:-translate-y-0.5 hover:border-rose hover:text-rose"><ChevronLeft size={16} /></button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
              {list.map((s, i) => {
                const active = i === current
                return (
                  <button key={s.id} role="tab" aria-selected={active} aria-label={`Go to slide ${i + 1}`} onClick={() => go(i)} className={`relative h-2.5 overflow-hidden rounded-full bg-ink/15 transition-all duration-300 ${active ? 'w-10' : 'w-2.5 hover:bg-rose/50'}`}>
                    {active && <span key={`${current}-${playing}`} className={`absolute inset-y-0 left-0 rounded-full bg-rose ${playing ? 'hero-fill' : 'w-full'}`} style={playing ? { animationDuration: `${SLIDE_MS}ms` } : undefined} />}
                  </button>
                )
              })}
            </div>
            <button aria-label="Next slide" onClick={() => go(current + 1)} className="rounded-full border border-line bg-white/80 p-2.5 transition-all hover:-translate-y-0.5 hover:border-rose hover:text-rose"><ChevronRight size={16} /></button>
            <button aria-label={userPaused || reduced ? 'Play slideshow' : 'Pause slideshow'} onClick={() => { setUserPaused((p) => !p); setReduced(false) }} className="ml-1 rounded-full border border-line bg-white/80 p-2.5 transition-all hover:-translate-y-0.5 hover:border-rose hover:text-rose">{userPaused || reduced ? <Play size={14} /> : <Pause size={14} />}</button>
          </div>
        )}
      </div>
    </section>
  )
}
