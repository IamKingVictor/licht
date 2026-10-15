'use client'
import { useStore } from '@/lib/store'
import ProductCard from './ProductCard'
import { EmptyState, Skeleton } from '@/components/ui/bits'
import Link from 'next/link'

/** Shows whatever is in the "Gift Boxes" category, so the page always follows the admin catalogue. */
export default function GiftBoxGrid() {
  const { products, ready } = useStore()
  const list = products.filter((p) => p.category_slug === 'gift-boxes')
  if (!ready) return <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="aspect-square" />)}</div>
  if (!list.length) return <EmptyState title="Gift boxes are coming soon" text="Tell us what you have in mind and we will create it." action={<Link href="/quote?type=custom-box" className="btn-dark">Request a custom box</Link>} />
  return <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">{list.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
}
