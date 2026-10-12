import { Suspense } from 'react'
import type { Metadata } from 'next'
import ShopView from '@/components/shop/ShopView'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Shop', description: 'Shop wedding souvenirs, birthday gifts, corporate gifts, personalised gifts and curated gift boxes.' }

export default function ShopPage() {
  return (
    <>
      <PageHero eyebrow="The collection" title="Shop" em="all gifts" text="Wedding souvenirs, birthday gifts, corporate gifts and curated gift boxes — most can be personalised." crumbs={[{ label: 'Shop' }]} />
      <section className="mx-auto max-w-[1360px] px-5 py-12 sm:py-16 lg:px-10">
        <Suspense fallback={null}><ShopView /></Suspense>
      </section>
    </>
  )
}
