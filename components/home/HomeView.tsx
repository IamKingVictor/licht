'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Camera, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { OCCASIONS, STEPS, USPS } from '@/lib/content'
import ProductCard from '@/components/shop/ProductCard'
import { SectionHead, Skeleton } from '@/components/ui/bits'
import Testimonials from './Testimonials'

const gallery = ['decorative-mirror', 'luxe-velvet-vanity-chair', 'pura-4-smart-fragrance-diffuser', 'marble-shelf', 'customizable-smart-light-bulbs', 'portable-uv-phone-sanitizer'].map((s) => `/images/products/${s}.jpg`)

export default function HomeView() {
  const { categories, products, ready, settings } = useStore()
  const bestsellers = (products.filter((p) => p.is_bestseller).length ? products.filter((p) => p.is_bestseller) : products).slice(0, 8)
  const cols = categories.slice(0, 5)
  const handle = settings.instagram_handle.replace('@', '')

  return (
    <>
      <section id="top" className="mx-auto grid max-w-[1360px] items-center gap-10 px-5 py-12 sm:py-16 md:grid-cols-[0.88fr_1.12fr] md:gap-10 md:px-10 md:py-20">
        <div className="order-2 max-w-xl md:order-1">
          <p className="mb-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-gold"><span className="h-px w-8 bg-gold-soft" /> Premium gifting, thoughtfully made</p>
          <h1 className="max-w-[590px] font-serif text-[48px] leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-[78px]">Memorable moments.<br /><em className="font-light text-gold">Beautifully preserved.</em></h1>
          <p className="mt-7 max-w-md text-[15px] leading-7 text-muted">From elegant event souvenirs to personalised gifts, we help you celebrate life&apos;s special moments with gifts worth remembering.</p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/shop" className="btn-dark">Shop now <ArrowRight size={15} /></Link>
            <Link href="#collections" className="link-line">Explore collection <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-12 flex gap-10 border-t border-line pt-6">
            <div><p className="font-serif text-2xl text-gold">01</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#777067]">Curated with care</p></div>
            <div><p className="font-serif text-2xl text-gold">∞</p><p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#777067]">Made for memories</p></div>
          </div>
        </div>
        <div className="relative order-1 md:order-2">
          <div className="absolute -bottom-5 -left-5 h-28 w-28 border border-gold-soft sm:-bottom-7 sm:-left-7" />
          <div className="relative aspect-[0.93] overflow-hidden"><Image src="/images/products/led-vanity-mirror.jpg" alt="Backlit round LED vanity mirror in an elegant bathroom" fill priority className="object-cover" sizes="(max-width: 768px) 100vw, 55vw" /></div>
          <div className="absolute bottom-5 right-5 bg-cream px-5 py-4 sm:bottom-8 sm:right-8"><p className="font-serif text-lg">Every moment</p><p className="text-[9px] uppercase tracking-[0.2em] text-gold">deserves a signature</p></div>
        </div>
      </section>

      <section id="collections" className="bg-sand px-5 py-16 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1360px]">
          <SectionHead eyebrow="Find your perfect piece" title="Gifts made for" em="every occasion" action={{ href: '/shop', label: 'View all' }} />
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-6">
            {!ready && [0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[1.05] md:col-span-2" />)}
            {cols.map((c, i) => (
              <Link href={c.slug === 'personalised-gifts' ? '/personalised-gifts' : c.slug === 'corporate-gifts' ? '/corporate-gifts' : c.slug === 'gift-boxes' ? '/gift-boxes' : `/shop?category=${c.slug}`} key={c.id} className={`group ${i < 3 ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <div className={`relative overflow-hidden bg-nude ${i < 3 ? 'aspect-[1.05]' : 'aspect-[1.6]'}`}>
                  {c.image_url && <Image src={c.image_url} alt={c.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" />}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#17120f]/70 to-transparent p-5 pt-20 text-white"><p className="font-serif text-2xl">{c.name}</p></div>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-[#cfc4b5] py-4">
                  <p className="max-w-[300px] text-[12px] leading-5 text-muted">{c.description}</p>
                  <span className="shrink-0 text-gold"><ArrowRight size={18} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-[1360px] px-5 py-16 sm:py-20 lg:px-10">
        <SectionHead eyebrow="The edit" title="Our signature" em="collection" action={{ href: '/shop', label: 'Shop all' }} />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">
          {!ready && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square" />)}
          {bestsellers.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 2} />)}
        </div>
        <div className="mt-10 text-center sm:hidden"><Link href="/shop" className="link-line">Shop all <ArrowRight size={14} /></Link></div>
      </section>

      <section className="bg-ink px-5 py-16 text-cream sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-champagne">More than a gift</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl">It&apos;s a <em className="font-light text-champagne">memory.</em></h2>
            <p className="mt-6 max-w-md text-sm leading-7 text-[#c3b9ae]">Every important moment deserves to be remembered. We create and curate beautiful souvenirs designed to add a special touch to celebrations — from weddings and birthdays to corporate events.</p>
            <Link href="/about" className="mt-8 inline-flex items-center gap-3 border-b border-champagne pb-2 text-[10px] uppercase tracking-[0.2em] text-cream">Our story <ArrowRight size={14} /></Link>
          </div>
          <div className="grid gap-7 sm:grid-cols-2">
            {USPS.map((u) => (
              <div key={u.title} className="border-t border-[#5c5044] pt-4"><Sparkles size={16} className="mb-5 text-champagne" strokeWidth={1.3} /><h3 className="font-serif text-xl">{u.title}</h3><p className="mt-2 text-xs leading-5 text-[#aaa096]">{u.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:py-20 lg:px-10">
        <SectionHead eyebrow="Events & occasions" title="Celebrations deserve" em="a signature touch" action={{ href: '/events', label: 'All occasions' }} />
        <ul className="grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {OCCASIONS.map((o) => (
            <li key={o.id} className="border-b border-r border-line">
              <Link href={`/events#${o.id}`} className="group block h-full p-6 transition-colors hover:bg-sand">
                <h3 className="font-serif text-2xl leading-tight">{o.title}</h3>
                <p className="mt-2 text-[12px] leading-5 text-muted">{o.text}</p>
                <span className="mt-5 inline-flex text-gold transition-transform group-hover:translate-x-1"><ArrowRight size={16} /></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-sand px-5 py-16 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1360px]">
          <SectionHead eyebrow="How it works" title="Your perfect gift in" em="4 simple steps" center />
          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-gold-soft pt-5"><p className="font-serif text-3xl text-gold">{s.n}</p><h3 className="mt-3 text-[11px] uppercase tracking-[0.22em]">{s.title}</h3><p className="mt-2 text-sm leading-6 text-muted">{s.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-16 text-center sm:py-20 lg:px-10">
        <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-gold">For your next celebration</p>
        <h2 className="h2">Planning an event? <em>Let us help.</em></h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-muted">Whether you need 20, 50 or 500+ souvenirs, we can help create a memorable gifting experience for your guests.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/quote" className="btn-dark">Request a quote <ArrowRight size={15} /></Link>
          <Link href="/quote?tab=booking" className="btn-line">Book a consultation</Link>
        </div>
      </section>

      <Testimonials />

      <section className="mx-auto max-w-[1360px] px-5 py-16 sm:py-20 lg:px-10" aria-label="Instagram">
        <SectionHead eyebrow={settings.instagram_handle} title="Follow the LICHT" em="SIGNATURE experience" center />
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {gallery.map((src) => (
            <a key={src} href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" aria-label="View on Instagram" className="group relative aspect-square overflow-hidden bg-sand">
              <Image src={src} alt="LICHT SIGNATURE gifting" fill sizes="(max-width: 1024px) 33vw, 16vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition-all group-hover:bg-ink/40 group-hover:opacity-100"><Camera size={20} /></span>
            </a>
          ))}
        </div>
        <div className="mt-8 text-center"><a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" className="btn-line">Follow us</a></div>
      </section>
    </>
  )
}
