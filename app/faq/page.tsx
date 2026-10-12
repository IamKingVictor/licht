import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronDown } from 'lucide-react'
import { PageHero } from '@/components/ui/bits'
import { FAQS } from '@/lib/content'

export const metadata: Metadata = { title: 'FAQs', description: 'Answers about personalised souvenirs, bulk orders, delivery, corporate gifting and quotes.' }

export default function FaqPage() {
  const ld = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <PageHero eyebrow="Help" title="Frequently asked" em="questions" crumbs={[{ label: 'FAQs' }]} />
      <section className="mx-auto max-w-[800px] px-5 py-14 lg:py-20">
        <div className="divide-y divide-line border-y border-line">
          {FAQS.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-serif text-xl marker:hidden [&::-webkit-details-marker]:hidden">{f.q}<ChevronDown size={18} className="shrink-0 text-gold transition-transform group-open:rotate-180" /></summary>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted">Still need help? <Link href="/contact" className="border-b border-gold text-gold">Contact us</Link> or <Link href="/quote" className="border-b border-gold text-gold">request a quote</Link>.</p>
      </section>
    </>
  )
}
