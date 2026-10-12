import type { Metadata } from 'next'
import CartView from '@/components/checkout/CartView'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Your basket', robots: { index: false } }

export default function CartPage() {
  return (<><PageHero title="Your" em="basket" crumbs={[{ label: 'Basket' }]} /><CartView /></>)
}
