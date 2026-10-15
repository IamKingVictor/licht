'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Heart } from 'lucide-react'
import type { Product } from '@/lib/types'
import { money } from '@/lib/format'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist'
import { useRouter } from 'next/navigation'

export function ProductImage({ src, alt, sizes, priority, className = '' }: { src?: string | null; alt: string; sizes: string; priority?: boolean; className?: string }) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) {
    return <div className="absolute inset-0 flex items-center justify-center bg-nude"><span className="font-serif text-xl tracking-[0.25em] text-gold">LICHT</span></div>
  }
  return <Image src={src} alt={alt} fill priority={priority} sizes={sizes} onError={() => setBroken(true)} className={`object-cover ${className}`} />
}

export default function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { add } = useCart()
  const { has, toggle } = useWishlist()
  const router = useRouter()
  const liked = has(product.slug)
  const soldOut = product.stock !== null && product.stock <= 0
  const needsOptions = product.is_personalisable || product.min_quantity > 1

  const quickAdd = () => {
    if (soldOut) return
    if (needsOptions) { router.push(`/shop/${product.slug}`); return }
    add(product, 1)
  }

  return (
    <article>
      <div className="group relative aspect-square overflow-hidden bg-sand">
        <Link href={`/shop/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          <ProductImage src={product.images[0]} alt={product.name} priority={priority} sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" className="transition-transform duration-700 group-hover:scale-105" />
        </Link>
        {product.is_bestseller && <span className="absolute left-2 top-2 bg-cream/90 px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-gold">Bestseller</span>}
        {soldOut && <span className="absolute left-2 top-2 bg-ink px-2 py-0.5 text-[8px] uppercase tracking-[0.16em] text-white">Sold out</span>}
        <button aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={liked} onClick={() => toggle(product.slug, product.name)} className="absolute right-2 top-2 rounded-full bg-cream/85 p-1.5">
          <Heart size={14} fill={liked ? '#9a7644' : 'none'} className={liked ? 'text-gold' : ''} strokeWidth={1.5} />
        </button>
        <button onClick={quickAdd} disabled={soldOut} className="absolute inset-x-2 bottom-2 hidden bg-ink/95 py-2.5 text-[9px] uppercase tracking-[0.18em] text-white disabled:opacity-60 md:block">
          {soldOut ? 'Sold out' : needsOptions ? 'Personalise & add' : 'Add to cart'}
        </button>
      </div>
      <div className="pt-2.5">
        <h3 className="line-clamp-1 font-serif text-[17px] leading-tight sm:text-lg"><Link href={`/shop/${product.slug}`} className="hover:text-gold">{product.name}</Link></h3>
        <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-[#7d746b]">{product.short_description}</p>
        <p className="mt-1 flex items-center justify-between gap-2 text-[12px] font-medium text-gold"><span>{product.price_is_from ? 'From ' : ''}{money(product.price)}</span>{product.is_personalisable && <span className="text-[9px] font-normal uppercase tracking-[0.12em]">Personalisable</span>}</p>
      </div>
      <button onClick={quickAdd} disabled={soldOut} className="mt-2 w-full border border-ink py-2 text-[9px] uppercase tracking-[0.16em] disabled:opacity-50 md:hidden">{soldOut ? 'Sold out' : needsOptions ? 'Personalise & add' : 'Add to cart'}</button>
    </article>
  )
}
