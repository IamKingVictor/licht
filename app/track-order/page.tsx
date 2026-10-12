import { Suspense } from 'react'
import type { Metadata } from 'next'
import OrderTracker from '@/components/checkout/OrderTracker'
import { PageHero } from '@/components/ui/bits'

export const metadata: Metadata = { title: 'Track your order', description: 'Check the progress of your LICHT SIGNATURE order.' }

export default function TrackOrderPage() {
  return (<><PageHero eyebrow="Order status" title="Track your" em="order" crumbs={[{ label: 'Track order' }]} /><Suspense fallback={null}><OrderTracker /></Suspense></>)
}
