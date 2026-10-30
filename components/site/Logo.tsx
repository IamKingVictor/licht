'use client'
import Link from 'next/link'
import { useState } from 'react'

/**
 * Header logo. Uses /public/logo.png; if that file is missing or fails to load
 * it falls back to the text wordmark so the header is never broken.
 */
export default function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  const [failed, setFailed] = useState(false)
  return (
    <Link href="/" aria-label="LICHT SIGNATURE SOUVENIRS — home" className={`block shrink-0 ${className}`}>
      {failed ? (
        <>
          <span className={`block font-serif text-[22px] leading-none tracking-[0.23em] ${dark ? 'text-cream' : 'text-ink'}`}>LICHT</span>
          <span className="mt-1 block text-[8px] tracking-[0.39em] text-forest">SIGNATURE SOUVENIRS</span>
        </>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/logo.png" width={416} height={395} alt="LICHT SIGNATURE SOUVENIRS" onError={() => setFailed(true)} className={dark ? "h-16 w-auto object-contain sm:h-24" : "h-12 w-auto object-contain sm:h-16"} />
      )}
    </Link>
  )
}
