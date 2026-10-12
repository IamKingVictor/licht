import Link from 'next/link'

export default function Logo({ className = '', dark = false }: { className?: string; dark?: boolean }) {
  return (
    <Link href="/" aria-label="LICHT SIGNATURE SOUVENIRS — home" className={`block ${className}`}>
      <span className={`block font-serif text-[22px] leading-none tracking-[0.23em] ${dark ? 'text-cream' : 'text-[#29231e]'}`}>LICHT</span>
      <span className="mt-1 block text-[8px] tracking-[0.39em] text-gold">SIGNATURE SOUVENIRS</span>
    </Link>
  )
}
