'use client'
import { Camera, Mail, MapPin, MessageCircle, Phone, Clock } from 'lucide-react'
import { useStore } from '@/lib/store'
import { digits, whatsappLink } from '@/lib/format'

export default function ContactDetails() {
  const { settings: s } = useStore()
  const rows = [
    s.contact_email && { icon: Mail, label: 'Email', text: s.contact_email, href: `mailto:${s.contact_email}` },
    s.contact_phone && { icon: Phone, label: 'Phone', text: s.contact_phone, href: `tel:${digits(s.contact_phone)}` },
    digits(s.whatsapp_number).length >= 7 && { icon: MessageCircle, label: 'WhatsApp', text: s.whatsapp_number, href: whatsappLink(s.whatsapp_number) },
    s.instagram_handle && { icon: Camera, label: 'Instagram', text: s.instagram_handle, href: `https://instagram.com/${s.instagram_handle.replace('@', '')}` },
    s.location && { icon: MapPin, label: 'Location', text: s.location },
    s.opening_hours && { icon: Clock, label: 'Hours', text: s.opening_hours },
  ].filter(Boolean) as { icon: typeof Mail; label: string; text: string; href?: string }[]
  return (
    <ul className="divide-y divide-line border-y border-line">
      {rows.map((r) => (
        <li key={r.label} className="flex items-start gap-4 py-4"><r.icon size={18} strokeWidth={1.4} className="mt-0.5 shrink-0 text-forest" />
          <div><p className="text-[10px] uppercase tracking-[0.18em] text-faint">{r.label}</p>{r.href ? <a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm hover:text-forest">{r.text}</a> : <p className="text-sm">{r.text}</p>}</div>
        </li>
      ))}
    </ul>
  )
}
