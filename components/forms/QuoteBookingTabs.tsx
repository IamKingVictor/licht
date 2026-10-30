'use client'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { CalendarCheck, FileText } from 'lucide-react'
import QuoteForm from './QuoteForm'
import BookingForm from './BookingForm'
import { ENQUIRY_TYPES } from '@/lib/config'

const typeMap: Record<string, string> = {
  weddings: 'Wedding souvenirs', birthdays: 'Birthday gifts', anniversaries: 'Anniversary', 'baby-showers': 'Baby shower', christenings: 'Christening / religious celebration',
  graduations: 'Graduation', corporate: 'Corporate gifts', special: 'Other event', bulk: 'Other event', custom: 'Other event', 'custom-box': 'Custom gift boxes',
}

export default function QuoteBookingTabs() {
  const sp = useSearchParams()
  const [tab, setTab] = useState<'quote' | 'booking'>(sp.get('tab') === 'booking' ? 'booking' : 'quote')
  const t = sp.get('type') ?? ''
  const defaultType = ENQUIRY_TYPES.includes(t) ? t : typeMap[t] ?? ''
  const product = sp.get('product')
  const defaultMessage = [t === 'bulk' ? 'Bulk order enquiry.' : t === 'custom' ? 'Custom order enquiry.' : '', product ? `Interested in: ${product.replace(/-/g, ' ')}.` : ''].filter(Boolean).join(' ')

  return (
    <div>
      <div role="tablist" aria-label="Quotes and bookings" className="mb-10 grid grid-cols-2 border border-line bg-white/40">
        {([['quote', 'Request a quotation', FileText], ['booking', 'Book a consultation', CalendarCheck]] as const).map(([k, label, Icon]) => (
          <button key={k} role="tab" aria-selected={tab === k} id={`tab-${k}`} aria-controls={`panel-${k}`} onClick={() => setTab(k)} className={`flex items-center justify-center gap-2 rounded-full px-3 py-3.5 text-[10px] font-medium uppercase tracking-[0.16em] transition-all sm:text-[11px] ${tab === k ? 'bg-forest text-white shadow-md' : 'hover:bg-mist hover:text-forest'}`}><Icon size={15} /> {label}</button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'quote' ? (
          <>
            <p className="lead mb-8">Tell us about your event and we will prepare a tailored quotation covering products, personalisation, branding and packaging.</p>
            <QuoteForm defaultType={defaultType} defaultMessage={defaultMessage} />
          </>
        ) : (
          <>
            <p className="lead mb-8">Reserve a time with our team — by video, phone or in person — to plan your gifting, see samples or finalise a large order.</p>
            <BookingForm />
          </>
        )}
      </div>
    </div>
  )
}
