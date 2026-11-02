import { Suspense } from 'react'
import type { Metadata } from 'next'
import ShopView from '@/components/shop/ShopView'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Shop', description: 'Shop home appliances, phone and tech accessories, and giftable lifestyle pieces from LICHT SIGNATURE SOUVENIRS.' }

export default function ShopPage() {
  return (
    <>
      <PageHero eyebrow="The collection" title="Shop" em="all gifts" text="Home appliances, phone and tech accessories, and giftable lifestyle pieces, ready to order." crumbs={[{ label: 'Shop' }]} />
      <section className="mx-auto max-w-[1360px] px-5 py-12 sm:py-16 lg:px-10">
        <Suspense fallback={null}><ShopView /></Suspense>
      </section>
    </>
  )
}
