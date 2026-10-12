import type { Metadata } from 'next'
import CheckoutView from '@/components/checkout/CheckoutView'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } }

export default function CheckoutPage() {
  return (<><PageHero title="Secure" em="checkout" crumbs={[{ href: '/cart', label: 'Basket' }, { label: 'Checkout' }]} /><CheckoutView /></>)
}
