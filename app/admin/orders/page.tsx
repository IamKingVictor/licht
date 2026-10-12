'use client'
import { useMemo, useState } from 'react'
import { CheckCircle2, Mail, MessageCircle, Printer, Search } from 'lucide-react'
import { api } from '@/lib/db'
import { useAdminList } from '@/lib/useAdminList'
import { useToast } from '@/lib/toast'
import { useStore } from '@/lib/store'
import { ORDER_STATUSES } from '@/lib/config'
import { digits, formatDateTime, humanise, money, whatsappLink } from '@/lib/format'
import type { Order, OrderStatus, PaymentStatus } from '@/lib/types'
import { Drawer, Loading, Panel, Pill, Toolbar, td, th } from '@/components/admin/ui'
import { TextArea, Field, Select } from '@/components/ui/fields'
import { personalisationText } from '@/components/checkout/CartView'

export default function AdminOrders() {
  const { rows, loading, error, reload, update } = useAdminList<Order>('orders')
  const toast = useToast()
  const { bySlug } = useStore()
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [tracking, setTracking] = useState('')
  const open = rows.find((o) => o.id === openId) ?? null

  const list = useMemo(() => rows.filter((o) => (!status || o.status === status) && (!q || `${o.order_number} ${o.customer_name} ${o.email}`.toLowerCase().includes(q.toLowerCase()))), [rows, status, q])

  const show = (o: Order) => { setOpenId(o.id); setNotes(o.admin_notes ?? ''); setTracking(o.tracking_number ?? '') }

  const setOrderStatus = async (o: Order, next: OrderStatus, notify = true) => {
    const ok = await update(o.id, { status: next }, `Order ${o.order_number} marked ${humanise(next)}.`)
    if (ok && notify && next !== 'pending') {
      const sent = await api.admin.emailOrderUpdate({ ...o, status: next })
      if (sent) toast(`Customer notified by email.`, { kind: 'info' })
    }
  }
  const setPayment = (o: Order, p: PaymentStatus) => update(o.id, { payment_status: p }, `Payment marked ${p}.`)
  const confirmOrder = async (o: Order) => { await update(o.id, { status: 'confirmed', payment_status: o.payment_status }, `Order ${o.order_number} confirmed.`); const sent = await api.admin.emailOrderUpdate({ ...o, status: 'confirmed' }); if (sent) toast('Confirmation emailed to customer.', { kind: 'info' }) }

  return (
    <div>
      <Toolbar>
        <div className="flex min-w-[220px] flex-1 items-center gap-2 border border-line bg-white/60 px-4 py-3"><Search size={15} className="text-gold" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order, name or email" aria-label="Search orders" className="w-full bg-transparent text-sm outline-none" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="field !w-auto"><option value="">All statuses</option>{ORDER_STATUSES.map((s) => <option key={s} value={s}>{humanise(s)}</option>)}</select>
        <button onClick={reload} className="btn-line btn-sm">Refresh</button>
      </Toolbar>
      <Panel>
        {loading || error || !list.length ? <Loading loading={loading} error={error} empty="No orders found." onRetry={reload} /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[760px]"><thead><tr className="border-b border-line"><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Total</th><th className={th}>Payment</th><th className={th}>Status</th><th className={th}>Placed</th><th className={th} /></tr></thead>
            <tbody className="divide-y divide-line">{list.map((o) => (
              <tr key={o.id} className="hover:bg-sand/50"><td className={`${td} font-medium`}>{o.order_number}</td><td className={td}>{o.customer_name}<br /><span className="text-xs text-muted">{o.email}</span></td><td className={td}>{money(o.total)}</td>
                <td className={td}><Pill value={o.payment_status} /></td><td className={td}><Pill value={o.status} /></td><td className={td}>{formatDateTime(o.created_at)}</td>
                <td className={td}><div className="flex gap-2">{o.status === 'pending' && <button onClick={() => confirmOrder(o)} className="btn-gold btn-sm !px-3">Confirm</button>}<button onClick={() => show(o)} className="btn-line btn-sm !px-3">Open</button></div></td></tr>))}</tbody></table></div>
        )}
      </Panel>

      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open?.order_number ?? ''} wide>
        {open && (
          <div className="space-y-8" id="print-area">
            <div className="flex flex-wrap items-center gap-3"><Pill value={open.status} /><Pill value={open.payment_status} /><span className="text-xs text-muted">{humanise(open.payment_method)} · {humanise(open.delivery_method)}</span></div>
            <div className="no-print flex flex-wrap gap-3">
              {open.status === 'pending' && <button onClick={() => confirmOrder(open)} className="btn-gold btn-sm"><CheckCircle2 size={14} /> Confirm order</button>}
              {open.payment_status !== 'paid' ? <button onClick={() => setPayment(open, 'paid')} className="btn-dark btn-sm">Mark as paid</button> : <button onClick={() => setPayment(open, 'refunded')} className="btn-line btn-sm">Mark refunded</button>}
              <button onClick={() => window.print()} className="btn-line btn-sm"><Printer size={14} /> Print slip</button>
              <a href={`mailto:${open.email}?subject=Your order ${open.order_number}`} className="btn-line btn-sm"><Mail size={14} /> Email</a>
              {digits(open.phone).length >= 7 && <a target="_blank" rel="noopener noreferrer" href={whatsappLink(open.phone, `Hello ${open.customer_name.split(' ')[0]}, this is LICHT SIGNATURE about order ${open.order_number}.`)} className="btn-line btn-sm"><MessageCircle size={14} /> WhatsApp</a>}
            </div>
            <div className="grid gap-6 text-sm sm:grid-cols-2">
              <div><p className="lbl">Customer</p><p>{open.customer_name}</p><p className="text-muted">{open.email}</p><p className="text-muted">{open.phone}</p></div>
              <div><p className="lbl">{open.delivery_method === 'collection' ? 'Collection' : 'Ship to'}</p>{open.delivery_method === 'collection' ? <p className="text-muted">Customer collects</p> : <p className="text-muted">{open.address_line1}{open.address_line2 && `, ${open.address_line2}`}<br />{open.city} {open.postcode}<br />{open.country}</p>}</div>
              {open.event_date && <div><p className="lbl">Needed by</p><p>{open.event_date}</p></div>}
              {open.customer_notes && <div className="sm:col-span-2"><p className="lbl">Customer notes</p><p className="whitespace-pre-wrap text-muted">{open.customer_notes}</p></div>}
            </div>
            <div><p className="lbl">Items</p>
              <ul className="divide-y divide-line border-y border-line">{(open.order_items ?? []).map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-3 text-sm"><div><p className="font-medium">{i.product_name} × {i.quantity}</p>{personalisationText(bySlug(i.product_slug), i.personalisation ?? {}).map(([k, v]) => <p key={k} className="text-xs text-muted">{k}: <span className="text-ink">{v}</span></p>)}</div><p>{money(i.line_total)}</p></li>))}</ul>
              <dl className="mt-3 space-y-1 text-sm"><div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(open.subtotal)}</dd></div><div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{money(open.delivery_fee)}</dd></div><div className="flex justify-between font-medium"><dt>Total</dt><dd>{money(open.total)}</dd></div></dl></div>
            <div className="no-print space-y-4 border-t border-line pt-6">
              <Select label="Order status" value={open.status} onChange={(e) => setOrderStatus(open, e.target.value as OrderStatus)} options={ORDER_STATUSES.map((s) => ({ value: s, label: humanise(s) }))} />
              <div className="flex items-end gap-3"><Field label="Tracking reference" value={tracking} onChange={(e) => setTracking(e.target.value)} className="flex-1" /><button className="btn-line btn-sm" onClick={() => update(open.id, { tracking_number: tracking.trim() || null }, 'Tracking saved.')}>Save</button></div>
              <TextArea label="Internal notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              <button className="btn-dark btn-sm" onClick={() => update(open.id, { admin_notes: notes.trim() || null }, 'Notes saved.')}>Save notes</button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
