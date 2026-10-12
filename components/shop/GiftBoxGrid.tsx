'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BOXES } from '@/lib/content'
import { useStore } from '@/lib/store'
import { money } from '@/lib/format'
import { ProductImage } from './ProductCard'

export default function GiftBoxGrid() {
  const { bySlug } = useStore()
  return (
    <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {BOXES.map((b) => {
        const p = bySlug(b.slug)
        return (
          <Link key={b.slug} href={`/shop/${b.slug}`} className="group">
            <div className="relative aspect-[0.9] overflow-hidden bg-sand"><ProductImage src={p?.images[0]} alt={b.name} sizes="(max-width: 640px) 100vw, 33vw" className="transition-transform duration-700 group-hover:scale-105" /></div>
            <div className="flex items-start justify-between gap-3 border-b border-line pt-4 pb-4">
              <div><h2 className="font-serif text-2xl">{b.name}</h2><p className="mt-1 text-xs leading-5 text-muted">{b.text}</p></div>
              <div className="text-right">{p && <p className="text-xs font-medium text-gold">{money(p.price)}</p>}<ArrowRight size={16} className="ml-auto mt-2 text-gold" /></div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
