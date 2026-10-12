'use client'
import RecordsPage from '@/components/admin/RecordsPage'
import { formatDate, humanise } from '@/lib/format'
import type { Booking } from '@/lib/types'

export default function AdminBookings() {
  return (
    <RecordsPage<Booking> table="bookings" statuses={['pending', 'confirmed', 'completed', 'cancelled']}
      columns={[{ label: 'Reference', render: (r) => <span className="font-medium">{r.reference}</span> }, { label: 'Customer', render: (r) => <>{r.name}<br /><span className="text-xs text-muted">{r.email}</span></> }, { label: 'Type', render: (r) => humanise(r.booking_type) }, { label: 'When', render: (r) => <>{formatDate(r.preferred_date)}<br /><span className="text-xs text-muted">{r.preferred_time} · {humanise(r.mode)}</span></> }]}
      details={(r) => [['Name', r.name], ['Email', r.email], ['Phone', r.phone], ['Booking type', humanise(r.booking_type)], ['Date', formatDate(r.preferred_date)], ['Time', r.preferred_time], ['Meeting mode', humanise(r.mode)], ['Occasion', r.event_type], ['Guests / gifts', r.guests], ['Message', r.message]]}
      subject={(r) => `Your booking ${r.reference} — LICHT SIGNATURE`} whatsappText={(r) => `Hello ${r.name.split(' ')[0]}, this is LICHT SIGNATURE about your booking ${r.reference} on ${formatDate(r.preferred_date)} at ${r.preferred_time}.`} />
  )
}
