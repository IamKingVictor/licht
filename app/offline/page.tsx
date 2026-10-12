import Link from 'next/link'
import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'

export const metadata: Metadata = { title: 'Offline', robots: { index: false } }

export default function OfflinePage() {
  return (
    <section className="mx-auto max-w-lg px-5 py-24 text-center">
      <WifiOff className="mx-auto text-gold" size={40} strokeWidth={1.2} />
      <h1 className="mt-6 font-serif text-4xl">You are offline</h1>
      <p className="lead mt-4">This page is not saved on your device yet. Reconnect to keep browsing — pages you have already visited and your basket are still available.</p>
      <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn-dark">Home</Link><Link href="/cart" className="btn-line">My basket</Link></div>
    </section>
  )
}
