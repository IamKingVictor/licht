'use client'
import Link from 'next/link'
import { Camera, Share2, MessageCircle, Music2 } from 'lucide-react'
import NewsletterForm from './NewsletterForm'
import { useStore } from '@/lib/store'
import { digits, whatsappLink } from '@/lib/format'

const cols = [
  { title: 'Shop', links: [['All products', '/shop'], ['Wedding souvenirs', '/shop?category=wedding-souvenirs'], ['Personalised gifts', '/personalised-gifts'], ['Gift boxes', '/gift-boxes'], ['Corporate gifts', '/corporate-gifts'], ['New arrivals', '/shop?sort=newest'], ['Bestsellers', '/shop?filter=bestsellers']] },
  { title: 'Information', links: [['About us', '/about'], ['Contact us', '/contact'], ['FAQs', '/faq'], ['Track order', '/track-order'], ['Delivery information', '/policies/delivery'], ['Returns & refunds', '/policies/returns'], ['Terms & conditions', '/policies/terms'], ['Privacy policy', '/policies/privacy']] },
  { title: 'Business', links: [['Corporate gifting', '/corporate-gifts'], ['Bulk orders', '/quote?type=bulk'], ['Custom orders', '/quote?type=custom'], ['Event orders', '/events'], ['Book a consultation', '/quote?tab=booking']] },
]

export default function Footer() {
  const { settings } = useStore()
  const handle = settings.instagram_handle.replace('@', '')
  return (
    <footer className="bg-cream px-5 pb-8 pt-14 lg:px-10">
      <div className="mx-auto max-w-[1360px]">
        <div className="grid gap-10 border-b border-line pb-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1fr_0.9fr_1.2fr]">
          <div>
            <span className="block font-serif text-2xl tracking-[0.2em]">LICHT</span>
            <span className="mt-1 block text-[8px] tracking-[0.37em] text-gold">SIGNATURE SOUVENIRS</span>
            <p className="mt-5 max-w-xs text-sm leading-6 text-[#736a61]">Memorable moments. Beautifully preserved.</p>
            <address className="mt-5 space-y-1 text-xs not-italic leading-5 text-[#625a52]">
              {settings.contact_email && <a className="block hover:text-gold" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>}
              {settings.contact_phone && <a className="block hover:text-gold" href={`tel:${digits(settings.contact_phone)}`}>{settings.contact_phone}</a>}
              {settings.location && <p>{settings.location}</p>}
            </address>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h3 className="mb-5 text-[10px] uppercase tracking-[0.23em] text-gold">{c.title}</h3>
              <ul className="space-y-3 text-[12px] text-[#625a52]">
                {c.links.map(([label, href]) => <li key={label}><Link className="block hover:text-gold" href={href}>{label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-5 text-[10px] uppercase tracking-[0.23em] text-gold">Stay in the know</h3>
            <p className="mb-4 text-[12px] leading-5 text-[#736a61]">Join our list for thoughtful gifting inspiration and first access.</p>
            <NewsletterForm />
            <h3 className="mb-4 mt-8 text-[10px] uppercase tracking-[0.23em] text-gold">Connect</h3>
            <div className="flex items-center gap-4 text-ink">
              <a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Camera size={18} strokeWidth={1.5} /></a>
              {settings.facebook_url && <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Share2 size={18} strokeWidth={1.5} /></a>}
              {settings.tiktok_url && <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" aria-label="TikTok"><Music2 size={18} strokeWidth={1.5} /></a>}
              {digits(settings.whatsapp_number).length >= 7 && <a href={whatsappLink(settings.whatsapp_number)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><MessageCircle size={18} strokeWidth={1.5} /></a>}
              <a href={`https://instagram.com/${handle}`} target="_blank" rel="noopener noreferrer" className="text-[11px] uppercase tracking-[0.15em]">{settings.instagram_handle}</a>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-7 text-[10px] uppercase tracking-[0.17em] text-[#8d8378] sm:flex-row">
          <p>© {new Date().getFullYear()} LICHT SIGNATURE SOUVENIRS. All rights reserved.</p>
          <p>Every moment deserves a signature.</p>
        </div>
      </div>
    </footer>
  )
}
