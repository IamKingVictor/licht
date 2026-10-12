'use client'
import Link from 'next/link'
import { CheckCircle2, MessageCircle, WifiOff } from 'lucide-react'
import { useStore } from '@/lib/store'
import { digits, whatsappLink } from '@/lib/format'

export type Errors = Record<string, string>

export function FormSuccess({ title, reference, queued, children, onReset, whatsappText }: { title: string; reference?: string; queued?: boolean; children?: React.ReactNode; onReset?: () => void; whatsappText?: string }) {
  const { settings } = useStore()
  return (
    <div role="status" className="border border-line bg-white/60 p-8 text-center sm:p-12">
      {queued ? <WifiOff className="mx-auto text-gold" size={36} strokeWidth={1.3} /> : <CheckCircle2 className="mx-auto text-gold" size={36} strokeWidth={1.3} />}
      <h3 className="mt-5 font-serif text-3xl sm:text-4xl">{queued ? 'Saved — we will send it when you are online' : title}</h3>
      {reference && !queued && <p className="mt-4 text-[10px] uppercase tracking-[0.22em] text-gold">Reference <span className="ml-2 font-medium text-ink">{reference}</span></p>}
      <div className="lead mx-auto mt-4 max-w-md">{children}</div>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {digits(settings.whatsapp_number).length >= 7 && (
          <a className="btn-line btn-sm" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.whatsapp_number, whatsappText ?? `Hello, I just sent an enquiry${reference ? ` (${reference})` : ''}.`)}><MessageCircle size={14} /> Message us on WhatsApp</a>
        )}
        {onReset && <button onClick={onReset} className="btn-line btn-sm">Send another</button>}
        <Link href="/shop" className="btn-dark btn-sm">Continue shopping</Link>
      </div>
    </div>
  )
}
