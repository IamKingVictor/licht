'use client'
import Link from 'next/link'
import { useWishlist } from '@/lib/wishlist'
import { useStore } from '@/lib/store'
import ProductCard from './ProductCard'
import { EmptyState, Skeleton } from '@/components/ui/bits'

export default function WishlistView() {
  const { slugs } = useWishlist()
  const { products, ready } = useStore()
  const list = slugs.map((s) => products.find((p) => p.slug === s)).filter(Boolean) as typeof products
  if (!ready) return <Skeleton className="h-64" />
  if (!list.length) return <EmptyState title="Your wishlist is empty" text="Tap the heart on any product to save it here for later." action={<Link href="/shop" className="btn-dark">Browse the shop</Link>} />
  return <div className="grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-x-5">{list.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
}
