'use client'
import { useState } from 'react'
import RecordsPage from '@/components/admin/RecordsPage'
import { Field } from '@/components/ui/fields'
import { formatDate, money } from '@/lib/format'
import type { Quote } from '@/lib/types'

function Amount({ q, update }: { q: Quote; update: (p: Record<string, unknown>) => void }) {
  const [v, setV] = useState(q.quoted_amount?.toString() ?? '')
  return (<div className="flex items-end gap-3"><Field label="Quoted amount" type="number" min={0} step="0.01" value={v} onChange={(e) => setV(e.target.value)} className="flex-1" /><button className="btn-line btn-sm" onClick={() => update({ quoted_amount: v ? Number(v) : null, ...(v && q.status === 'new' ? { status: 'quoted' } : {}) })}>Save</button></div>)
}

export default function AdminQuotes() {
  return (
    <RecordsPage<Quote> table="quotes" statuses={['new', 'in_progress', 'quoted', 'accepted', 'declined', 'closed']}
      columns={[{ label: 'Reference', render: (r) => <span className="font-medium">{r.reference}</span> }, { label: 'Customer', render: (r) => <>{r.name}{r.company && <span className="text-xs text-muted"> · {r.company}</span>}<br /><span className="text-xs text-muted">{r.email}</span></> }, { label: 'Type', render: (r) => r.enquiry_type }, { label: 'Qty', render: (r) => r.quantity ?? '—' }, { label: 'Event', render: (r) => formatDate(r.event_date) }]}
      details={(r) => [['Name', r.name], ['Company', r.company], ['Email', r.email], ['Phone', r.phone], ['Type', r.enquiry_type], ['Quantity', r.quantity], ['Event date', formatDate(r.event_date)], ['Budget', r.budget_range], ['Quoted', r.quoted_amount ? money(r.quoted_amount) : '—'], ['Products of interest', r.products_of_interest], ['Message', r.message]]}
      extra={(r, update) => <Amount key={r.id} q={r} update={update} />}
      subject={(r) => `Your quotation ${r.reference}`} whatsappText={(r) => `Hello ${r.name.split(' ')[0]}, this is LICHT SIGNATURE regarding your quote request ${r.reference}.`} />
  )
}
