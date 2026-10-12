import type { Metadata } from 'next'
import WishlistView from '@/components/shop/WishlistView'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false } }

export default function WishlistPage() {
  return (<><PageHero title="Your" em="wishlist" crumbs={[{ label: 'Wishlist' }]} /><section className="mx-auto max-w-[1360px] px-5 py-12 lg:px-10"><WishlistView /></section></>)
}
