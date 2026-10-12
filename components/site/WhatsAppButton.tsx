'use client'
import { MessageCircle } from 'lucide-react'
import { useStore } from '@/lib/store'
import { digits, whatsappLink } from '@/lib/format'

export default function WhatsAppButton() {
  const { settings } = useStore()
  if (digits(settings.whatsapp_number).length < 7) return null
  return (
    <a
      href={whatsappLink(settings.whatsapp_number, 'Hello LICHT SIGNATURE, I would like to ask about…')}
      target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
      className="no-print fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 sm:right-6"
    >
      <MessageCircle size={22} />
    </a>
  )
}
