import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight, Sparkles } from 'lucide-react'
import { PageHero } from '@/components/ui/bits'
import { USPS } from '@/lib/content'

export const metadata: Metadata = { title: 'About us', description: 'LICHT SIGNATURE SOUVENIRS is a premium gifting and souvenir brand turning special moments into beautiful keepsakes.' }

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About LICHT SIGNATURE" title="More than a gift." em="It’s a memory." text="Every important moment deserves to be remembered." crumbs={[{ label: 'About us' }]} />
      <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-5 py-16 md:grid-cols-2 lg:px-10 lg:py-24">
        <div className="relative aspect-[0.9] overflow-hidden"><Image src="/images/products/decorative-mirror.jpg" alt="Ornate gold decorative mirror above a marble bathroom vanity" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" /></div>
        <div className="space-y-5 text-[15px] leading-7 text-muted">
          <h2 className="h2 text-ink">Our <em>story</em></h2>
          <p>LICHT SIGNATURE SOUVENIRS is a premium gifting and souvenir brand offering carefully selected and beautifully presented gifts and keepsakes for life&apos;s special moments.</p>
          <p>We provide souvenirs and personalised gifts for weddings, birthdays, anniversaries, christenings, graduations, corporate events, religious celebrations, parties and other memorable occasions.</p>
          <p>Whether you are planning a wedding, celebrating a birthday, hosting a corporate event or looking for a meaningful gift, we help you find something that feels personal, beautiful and memorable.</p>
          <blockquote className="border-l-2 border-gold-soft pl-5 font-serif text-2xl leading-snug text-ink">To turn ordinary gifts into extraordinary memories.</blockquote>
        </div>
      </section>
      <section className="bg-forest px-5 py-16 text-cream sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1180px]">
          <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-champagne">Our signature experience</p>
          <h2 className="mb-12 font-serif text-4xl sm:text-5xl">Why choose <em className="text-champagne">LICHT SIGNATURE SOUVENIRS?</em></h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {USPS.map((u) => (<div key={u.title} className="border-t border-gold/50 pt-4"><Sparkles size={16} className="mb-5 text-champagne" strokeWidth={1.3} /><h3 className="font-serif text-xl">{u.title}</h3><p className="mt-2 text-xs leading-5 text-[#cfd6d1]">{u.text}</p></div>))}
          </div>
        </div>
      </section>
      <section className="px-5 py-16 text-center sm:py-20 lg:px-10">
        <p className="eyebrow mb-4">Brand promise</p>
        <h2 className="h2">Every moment deserves <em>a signature.</em></h2>
        <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/shop" className="btn-dark">Shop now <ArrowRight size={15} /></Link><Link href="/contact" className="btn-line">Get in touch</Link></div>
      </section>
    </>
  )
}
