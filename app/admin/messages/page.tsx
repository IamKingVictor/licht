'use client'
import RecordsPage from '@/components/admin/RecordsPage'
import { formatDate } from '@/lib/format'
import type { Message } from '@/lib/types'

export default function AdminMessages() {
  return (
    <RecordsPage<Message> table="messages" statuses={['new', 'read', 'replied', 'archived']}
      columns={[{ label: 'From', render: (r) => <>{r.name}<br /><span className="text-xs text-muted">{r.email}</span></> }, { label: 'Type', render: (r) => r.enquiry_type }, { label: 'Message', render: (r) => <span className="line-clamp-2 max-w-xs text-muted">{r.message}</span> }]}
      details={(r) => [['Name', r.name], ['Email', r.email], ['Phone', r.phone], ['Type', r.enquiry_type], ['Event date', formatDate(r.event_date)], ['Quantity', r.quantity], ['Budget', r.budget_range], ['Message', r.message]]}
      subject={(r) => `Re: your ${r.enquiry_type.toLowerCase()} enquiry`} whatsappText={(r) => `Hello ${r.name.split(' ')[0]}, thank you for contacting LICHT SIGNATURE.`} noNotes />
  )
}
