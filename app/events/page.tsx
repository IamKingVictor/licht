import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/ui/bits'
import { OCCASIONS, STEPS } from '@/lib/content'

export const metadata: Metadata = { title: 'Events & occasions', description: 'Souvenirs and gifts for weddings, birthdays, anniversaries, baby showers, christenings, graduations and corporate events.' }

export default function EventsPage() {
  return (
    <>
      <PageHero eyebrow="Events & occasions" title="Celebrations deserve" em="a signature touch" text="From intimate gatherings to large events, we create keepsakes that guests treasure long after the celebration." crumbs={[{ label: 'Events & occasions' }]}>
        <Link href="/quote" className="btn-dark">Plan your event <ArrowRight size={15} /></Link>
        <Link href="/quote?tab=booking" className="link-line">Book a consultation</Link>
      </PageHero>
      <section className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-px border border-line bg-line md:grid-cols-2">
          {OCCASIONS.map((o) => (
            <article id={o.id} key={o.id} className="scroll-mt-32 bg-cream p-8 sm:p-10">
              <h2 className="font-serif text-3xl sm:text-4xl">{o.title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-muted">{o.text}</p>
              <div className="mt-6 flex flex-wrap gap-5">
                <Link href={o.category ? `/shop?category=${o.category}` : '/shop'} className="link-line">Shop gifts <ArrowRight size={14} /></Link>
                <Link href={`/quote?type=${encodeURIComponent(o.id)}`} className="link-line">Request a quote</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-line bg-sand px-5 py-16 lg:px-10">
        <div className="mx-auto max-w-[1360px]">
          <h2 className="h2 mb-10 text-center">Your perfect gift in <em>4 simple steps</em></h2>
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map((s) => (<li key={s.n} className="border-t border-gold-soft pt-5"><p className="font-serif text-3xl text-gold">{s.n}</p><h3 className="mt-3 text-[11px] uppercase tracking-[0.22em]">{s.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{s.text}</p></li>))}</ol>
        </div>
      </section>
    </>
  )
}
