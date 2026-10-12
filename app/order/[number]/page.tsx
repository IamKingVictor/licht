import { Suspense } from 'react'
import type { Metadata } from 'next'
import OrderTracker from '@/components/checkout/OrderTracker'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Your order', robots: { index: false } }

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  return (<><PageHero title="Order" em="details" crumbs={[{ label: 'Order' }]} /><Suspense fallback={null}><OrderTracker initialNumber={decodeURIComponent(number).toUpperCase()} /></Suspense></>)
}
