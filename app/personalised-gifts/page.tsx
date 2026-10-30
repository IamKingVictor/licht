import { Suspense } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { PageHero, CheckList, SectionHead } from '@/components/ui/bits'
import ShopView from '@/components/shop/ShopView'
import { PERSONALISE_OPTIONS } from '@/lib/content'

export const metadata: Metadata = { title: 'Personalised gifts', description: 'Personalise gifts with names, dates, initials, messages, logos and event details.' }

export default function PersonalisedPage() {
  return (
    <>
      <PageHero eyebrow="Make it personal" title="A personal touch" em="treasured forever" text="A personal touch can turn a beautiful gift into a treasured memory." crumbs={[{ label: 'Personalised gifts' }]}>
        <a href="#shop" className="btn-dark">Shop personalised gifts <ArrowRight size={15} /></a>
      </PageHero>
      <section className="mx-auto max-w-[1180px] px-5 py-16 lg:px-10">
        <SectionHead eyebrow="Create something personal" title="You can personalise with" em="" />
        <CheckList items={PERSONALISE_OPTIONS} />
        <p className="lead mt-8 max-w-xl">Looking for something entirely bespoke? <Link href="/quote?type=custom" className="border-b border-gold text-forest">Request a custom order</Link> and we will design it with you.</p>
      </section>
      <section id="shop" className="mx-auto max-w-[1360px] scroll-mt-28 px-5 pb-20 lg:px-10">
        <SectionHead eyebrow="Ready to personalise" title="Shop personalised" em="gifts" />
        <Suspense fallback={null}><ShopView fixedCategory="personalised-gifts" hideFilters /></Suspense>
      </section>
    </>
  )
}
