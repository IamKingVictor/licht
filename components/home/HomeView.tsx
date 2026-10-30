'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Camera, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { OCCASIONS, STEPS, USPS } from '@/lib/content'
import ProductCard from '@/components/shop/ProductCard'
import { SectionHead, Skeleton } from '@/components/ui/bits'
import Testimonials from './Testimonials'
import HeroCarousel from './HeroCarousel'

const gallery = ['decorative-mirror', 'luxe-velvet-vanity-chair', 'pura-4-smart-fragrance-diffuser', 'marble-shelf', 'customizable-smart-light-bulbs', 'portable-uv-phone-sanitizer'].map((s) => `/images/products/${s}.jpg`)

export default function HomeView() {
  const { categories, products, ready, settings } = useStore()
  const bestsellers = (products.filter((p) => p.is_bestseller).length ? products.filter((p) => p.is_bestseller) : products).slice(0, 8)
  const cols = categories.slice(0, 5)
  const handle = settings.instagram_handle.replace('@', '')

  return (
    <>
      <HeroCarousel />

      <section id="collections" className="bg-sand px-5 py-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1360px]">
          <SectionHead eyebrow="Find your perfect piece" title="Gifts made for" em="every occasion" action={{ href: '/shop', label: 'View all' }} />
          <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 md:grid-cols-6">
            {!ready && [0, 1, 2].map((i) => <Skeleton key={i} className="aspect-[1.05] w-[72vw] shrink-0 sm:w-auto md:col-span-2" />)}
            {cols.map((c, i) => (
              <Link href={c.slug === 'personalised-gifts' ? '/personalised-gifts' : c.slug === 'corporate-gifts' ? '/corporate-gifts' : c.slug === 'gift-boxes' ? '/gift-boxes' : `/shop?category=${c.slug}`} key={c.id} className={`group w-[68vw] shrink-0 snap-start sm:w-auto ${i < 3 ? 'md:col-span-2' : 'md:col-span-3'}`}>
                <div className={`relative overflow-hidden bg-nude ${i < 3 ? 'aspect-[1.05]' : 'aspect-[1.6]'}`}>
                  {c.image_url && <Image src={c.image_url} alt={c.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw" />}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#17120f]/70 to-transparent p-5 pt-20 text-white"><p className="font-serif text-2xl">{c.name}</p></div>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-[#cfc4b5] py-4">
                  <p className="max-w-[300px] text-[12px] leading-5 text-muted">{c.description}</p>
                  <span className="shrink-0 text-forest"><ArrowRight size={18} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-[1360px] px-5 py-8 sm:py-20 lg:px-10">
        <SectionHead eyebrow="The edit" title="Our signature" em="collection" action={{ href: '/shop', label: 'Shop all' }} />
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">
          {!ready && [0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square" />)}
          {bestsellers.map((p, i) => <div key={p.slug} className={i >= 4 ? 'hidden sm:block' : ''}><ProductCard product={p} priority={i < 2} /></div>)}
        </div>
        <div className="mt-10 text-center sm:hidden"><Link href="/shop" className="link-line">Shop all <ArrowRight size={14} /></Link></div>
      </section>

      <section className="bg-forest px-5 py-8 text-cream sm:py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1180px] items-center gap-7 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-champagne">More than a gift</p>
            <h2 className="font-serif text-3xl leading-tight sm:text-5xl">It&apos;s a <em className="text-champagne">memory.</em></h2>
            <p className="mt-4 max-w-md text-[13px] leading-6 text-[#cfd6d1] sm:mt-6 sm:text-sm sm:leading-7">Every important moment deserves to be remembered. We create and curate beautiful souvenirs designed to add a special touch to celebrations — from weddings and birthdays to corporate events.</p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-3 border-b-2 border-gold pb-1.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-cream sm:mt-8">Our story <ArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:gap-7">
            {USPS.map((u, i) => (
              <div key={u.title} className={`border-t border-gold/50 pt-3 sm:pt-4 ${i === USPS.length - 1 && USPS.length % 2 ? 'col-span-2 sm:col-span-1' : ''}`}><Sparkles size={16} className="mb-3 text-gold sm:mb-5" strokeWidth={1.3} /><h3 className="font-serif text-base leading-snug sm:text-xl">{u.title}</h3><p className="mt-1.5 text-[11px] leading-[1.45] text-[#cfd6d1] sm:mt-2 sm:text-xs sm:leading-5">{u.text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1360px] px-5 py-8 sm:py-20 lg:px-10">
        <SectionHead eyebrow="Events & occasions" title="Celebrations deserve" em="a signature touch" action={{ href: '/events', label: 'All occasions' }} />
        <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {OCCASIONS.map((o) => (
            <li key={o.id} className="w-[66vw] shrink-0 snap-start sm:w-auto">
              <Link href={`/events#${o.id}`} className="group block h-full overflow-hidden rounded-2xl border border-line bg-white/60 transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                  <Image src={o.image} alt={`${o.title} gifts and souvenirs`} fill sizes="(max-width: 640px) 66vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-serif text-xl leading-tight sm:text-2xl">{o.title}</h3>
                  <p className="mt-1.5 line-clamp-3 text-[12px] leading-5 text-muted">{o.text}</p>
                  <span className="mt-3 inline-flex text-gold transition-transform group-hover:translate-x-1"><ArrowRight size={16} /></span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-sand px-5 py-8 sm:py-20 lg:px-10">
        <div className="mx-auto max-w-[1360px]">
          <SectionHead eyebrow="How it works" title="Your perfect gift in" em="4 simple steps" center />
          <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-8 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="border-t border-gold pt-4 sm:pt-5"><p className="font-serif text-2xl text-forest sm:text-3xl">{s.n}</p><h3 className="mt-2 text-[11px] font-semibold uppercase tracking-[0.09em] sm:mt-3">{s.title}</h3><p className="mt-1.5 text-[12px] leading-5 text-muted sm:mt-2 sm:text-sm sm:leading-6">{s.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-5 py-8 text-center sm:py-20 lg:px-10">
        <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-forest">For your next celebration</p>
        <h2 className="h2">Planning an event? <em>Let us help.</em></h2>
        <p className="mx-auto mt-4 max-w-lg text-[13px] leading-6 text-muted sm:mt-5 sm:text-sm sm:leading-7">Whether you need 20, 50 or 500+ souvenirs, we can help create a memorable gifting experience for your guests.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8 sm:gap-4">
          <Link href="/quote" className="btn-dark">Request a quote <ArrowRight size={15} /></Link>
          <Link href="/quote?tab=booking" className="btn-line">Book a consultation</Link>
        </div>
      </section>

      <Testimonials />

      <section className="mx-auto max-w-[1360px] px-5 py-8 sm:py-20 lg:px-10" aria-label="Instagram">
        <SectionHead eyebrow={settings.instagram_handle} title="Follow the LICHT" em="SIGNATURE experience" center />
        <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
          {gallery.map((src, i) => (
            <a key={src} href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" aria-label="View on Instagram" className={`group relative aspect-square overflow-hidden bg-sand ${i >= 3 ? 'hidden sm:block' : ''}`}>
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
