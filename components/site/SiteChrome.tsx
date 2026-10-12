'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'

/** Public site chrome. The admin area brings its own shell, so it is skipped there. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const path = usePathname()
  if (path.startsWith('/admin')) return <>{children}</>
  return (
    <>
      <Header />
      <main id="main" className="min-h-[60vh] bg-cream text-[#241f1b]">{children}</main>
      <Footer />
      <WhatsAppButton />
    </>
  )
}
