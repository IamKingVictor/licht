import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { PageHero } from '@/components/ui/bits'
import GiftBoxGrid from '@/components/shop/GiftBoxGrid'

export const metadata: Metadata = { title: 'Gift boxes', description: 'Curated luxury gift boxes — the Signature, Celebration, Wedding, Corporate and Luxury boxes.' }

export default function GiftBoxesPage() {
  return (
    <>
      <PageHero eyebrow="The art of gifting" title="Gift boxes," em="beautifully curated" text="Our curated gift boxes bring together beautiful products in elegant packaging — ready to give the moment they arrive." crumbs={[{ label: 'Gift boxes' }]}>
        <Link href="/shop?category=gift-boxes" className="btn-dark">Shop gift boxes <ArrowRight size={15} /></Link>
        <Link href="/quote?type=custom-box" className="link-line">Design a custom box</Link>
      </PageHero>
      <section className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10 lg:py-20"><GiftBoxGrid /></section>
      <section className="bg-ink text-cream">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 py-16 md:grid-cols-2 lg:px-10">
          <div className="relative aspect-[1.2] overflow-hidden"><Image src="/images/products/pura-4-smart-fragrance-diffuser.jpg" alt="Pura 4 smart fragrance diffuser beside its box" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
          <div><p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-champagne">Premium presentation</p><h2 className="font-serif text-4xl leading-tight sm:text-5xl">Presentation is <em className="font-light text-champagne">part of the gift.</em></h2>
            <p className="mt-5 text-sm leading-7 text-[#c3b9ae]">Need 20, 50 or 500 boxes for an event? We can colour-match ribbons, add your logo and write every card.</p>
            <Link href="/quote?type=custom-box" className="mt-8 inline-flex items-center gap-3 border-b border-champagne pb-2 text-[10px] uppercase tracking-[0.2em]">Request custom gift boxes <ArrowRight size={14} /></Link></div>
        </div>
      </section>
    </>
  )
}
