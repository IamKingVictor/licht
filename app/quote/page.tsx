import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PageHero, CheckList } from '@/components/ui/bits'
import QuoteBookingTabs from '@/components/forms/QuoteBookingTabs'
import { BULK_HELP } from '@/lib/content'

export const metadata: Metadata = { title: 'Quotes & bookings', description: 'Request a quotation for bulk, event and corporate orders, or book a gifting consultation with LICHT SIGNATURE SOUVENIRS.' }

export default function QuotePage() {
  return (
    <>
      <PageHero eyebrow="Bulk & event orders" title="Planning an event?" em="Let us help." text="Whether you need 20, 50, 100 or 500+ souvenirs, we can help you create a memorable gifting experience for your guests." crumbs={[{ label: 'Quotes & bookings' }]} />
      <div className="mx-auto grid max-w-[1180px] gap-14 px-5 py-14 lg:grid-cols-[1.6fr_1fr] lg:px-10 lg:py-20">
        <Suspense fallback={null}><QuoteBookingTabs /></Suspense>
        <aside className="h-fit border border-line bg-white/50 p-6 lg:sticky lg:top-28">
          <h2 className="font-serif text-2xl">We can help with</h2>
          <div className="mt-4"><CheckList items={BULK_HELP} /></div>
          <p className="mt-6 text-xs leading-5 text-muted">Order early for large or personalised events — we recommend at least 3–4 weeks&apos; notice for 100+ items.</p>
        </aside>
      </div>
    </>
  )
}
