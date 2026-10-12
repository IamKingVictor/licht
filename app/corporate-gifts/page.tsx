import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PageHero, CheckList, SectionHead } from '@/components/ui/bits'
import ShopView from '@/components/shop/ShopView'
import QuoteForm from '@/components/forms/QuoteForm'
import { CORPORATE_FOR } from '@/lib/content'

export const metadata: Metadata = { title: 'Corporate gifts', description: 'Corporate gifting with a signature touch — client gifts, staff appreciation, conferences and bulk orders.' }

export default function CorporatePage() {
  return (
    <>
      <PageHero eyebrow="Corporate gifting" title="Corporate gifting," em="with a signature touch" text="Make a lasting impression with thoughtful corporate gifts, branded and presented beautifully." crumbs={[{ label: 'Corporate gifts' }]}>
        <a href="#quote" className="btn-dark">Request a corporate quote <ArrowRight size={15} /></a>
        <Link href="/quote?tab=booking" className="link-line">Book a consultation</Link>
      </PageHero>
      <section className="mx-auto max-w-[1180px] px-5 py-16 lg:px-10">
        <SectionHead eyebrow="We provide gifting solutions for" title="Businesses of" em="every size" />
        <CheckList items={CORPORATE_FOR} />
      </section>
      <section className="mx-auto max-w-[1360px] px-5 pb-16 lg:px-10">
        <SectionHead eyebrow="Ready to order" title="Corporate" em="collection" action={{ href: '/shop?category=corporate-gifts', label: 'View all' }} />
        <Suspense fallback={null}><ShopView fixedCategory="corporate-gifts" hideFilters /></Suspense>
      </section>
      <section id="quote" className="scroll-mt-28 border-t border-line bg-sand px-5 py-16 lg:px-10">
        <div className="mx-auto max-w-[900px]">
          <SectionHead eyebrow="Bulk & corporate orders" title="Request a" em="corporate quote" />
          <QuoteForm defaultType="Corporate gifts" />
        </div>
      </section>
    </>
  )
}
