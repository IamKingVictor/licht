import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, Star } from 'lucide-react'

export function SectionHead({ eyebrow, title, em, action, center = false, light = false }: { eyebrow?: string; title: string; em?: string; action?: { href: string; label: string }; center?: boolean; light?: boolean }) {
  return (
    <div className={`mb-9 flex items-end justify-between gap-6 ${center ? 'flex-col items-center text-center' : ''}`}>
      <div>
        {eyebrow && <p className={`mb-3 text-[10px] uppercase tracking-[0.3em] ${light ? 'text-champagne' : 'text-gold'}`}>{eyebrow}</p>}
        <h2 className="h2">{title} {em && <em className={light ? 'text-champagne' : ''}>{em}</em>}</h2>
      </div>
      {action && (
        <Link href={action.href} className="hidden shrink-0 items-center gap-2 text-[10px] uppercase tracking-[0.17em] hover:text-gold sm:flex">{action.label} <ArrowRight size={14} /></Link>
      )}
    </div>
  )
}

export function PageHero({ eyebrow, title, em, text, children, crumbs }: { eyebrow?: string; title: string; em?: string; text?: string; children?: ReactNode; crumbs?: { href?: string; label: string }[] }) {
  return (
    <section className="border-b border-line bg-sand px-5 py-14 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-[1360px]">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted">
            <Link href="/" className="hover:text-gold">Home</Link>
            {crumbs.map((c) => (<span key={c.label} className="flex items-center gap-2"><span>/</span>{c.href ? <Link href={c.href} className="hover:text-gold">{c.label}</Link> : <span className="text-ink">{c.label}</span>}</span>))}
          </nav>
        )}
        {eyebrow && <p className="mb-4 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-gold"><span className="h-px w-8 bg-gold-soft" />{eyebrow}</p>}
        <h1 className="h1 max-w-3xl font-serif text-[44px] leading-[1] tracking-[-0.035em] sm:text-6xl lg:text-7xl">{title} {em && <em className="font-light text-gold">{em}</em>}</h1>
        {text && <p className="lead mt-6 max-w-xl">{text}</p>}
        {children && <div className="mt-8 flex flex-wrap items-center gap-5">{children}</div>}
      </div>
    </section>
  )
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-1 text-gold-soft" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={size} fill={i <= Math.round(value) ? 'currentColor' : 'none'} />)}
    </span>
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-sand ${className}`} aria-hidden />
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="font-serif text-3xl">{title}</p>
      {text && <p className="lead mx-auto mt-3 max-w-md">{text}</p>}
      {action && <div className="mt-7 flex justify-center">{action}</div>}
    </div>
  )
}

export function CheckList({ items, light = false }: { items: string[]; light?: boolean }) {
  return (
    <ul className={`grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2 ${light ? 'text-[#c3b9ae]' : 'text-muted'}`}>
      {items.map((i) => (<li key={i} className="flex items-center gap-3 border-b border-line/60 pb-3"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-soft" />{i}</li>))}
    </ul>
  )
}
