'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Check, MessageCircle, Printer, Search } from 'lucide-react'
import { api } from '@/lib/db'
import { useStore } from '@/lib/store'
import { useSearchParams } from 'next/navigation'
import { digits, formatDate, humanise, money, whatsappLink } from '@/lib/format'
import type { Order } from '@/lib/types'
import { Alert, Field, Spinner } from '@/components/ui/fields'
import { personalisationText } from './CartView'

const FLOW = ['pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered'] as const
const FLOW_LABEL: Record<string, string> = { pending: 'Received', confirmed: 'Confirmed', processing: 'In production', ready: 'Ready', shipped: 'On its way', delivered: 'Delivered' }

export default function OrderTracker({ initialNumber = '' }: { initialNumber?: string }) {
  const sp = useSearchParams()
  const isNew = sp.get('new') === '1'
  const [number, setNumber] = useState(initialNumber)
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailed, setEmailed] = useState(false)
  const tried = useRef(false)

  const lookup = async (n: string, e: string) => {
    setLoading(true); setError('')
    const r = await api.trackOrder(n, e)
    setLoading(false)
    if (!r.ok) { setError(r.error); return }
    setOrder(r.data)
    sessionStorage.setItem('licht:last-order', JSON.stringify({ number: r.data.order_number, email: e.trim().toLowerCase(), emailed }))
  }

  useEffect(() => {
    if (tried.current) return
    tried.current = true
    try {
      const saved = JSON.parse(sessionStorage.getItem('licht:last-order') || 'null')
      if (saved && (!initialNumber || saved.number === initialNumber)) {
        setNumber(saved.number); setEmail(saved.email); setEmailed(Boolean(saved.emailed))
        lookup(saved.number, saved.email)
      }
    } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (order) return <OrderDetails order={order} isNew={isNew} emailed={emailed} />

  return (
    <div className="mx-auto max-w-lg px-5 py-14 lg:py-20">
      <form onSubmit={(e) => { e.preventDefault(); lookup(number, email) }} className="space-y-5" noValidate>
        <h2 className="font-serif text-3xl">Find your order</h2>
        <p className="text-sm leading-6 text-muted">Enter the order number from your confirmation and the email address you used at checkout.</p>
        <Field name="number" label="Order number" placeholder="LS-2610-ABCD" value={number} onChange={(e) => setNumber(e.target.value.toUpperCase())} required />
        <Field name="email" type="email" label="Email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        {error && <Alert kind="error">{error}</Alert>}
        <button disabled={loading} className="btn-dark w-full">{loading ? <><Spinner /> Searching…</> : <><Search size={14} /> Track order</>}</button>
      </form>
    </div>
  )
}

function OrderDetails({ order, isNew, emailed }: { order: Order; isNew: boolean; emailed: boolean }) {
  const { settings, bySlug } = useStore()
  const cancelled = order.status === 'cancelled'
  const step = FLOW.indexOf(order.status as (typeof FLOW)[number])
  const pending = order.payment_status === 'unpaid' && !cancelled
  const items = order.order_items ?? []

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10 lg:py-14">
      {isNew && (
        <div className="mb-10 border border-line bg-white/60 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold text-white"><Check size={26} /></div>
          <h2 className="mt-5 font-serif text-4xl">Thank you, {order.customer_name.split(' ')[0]}</h2>
          <p className="lead mx-auto mt-3 max-w-md">Your order has been received.{emailed ? ` A confirmation has been emailed to ${order.email}.` : ' Please keep your order number safe — you can track it any time with your email.'}</p>
        </div>
      )}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div><p className="eyebrow">Order</p><h1 className="font-serif text-4xl tracking-[0.04em]">{order.order_number}</h1><p className="mt-1 text-xs text-muted">Placed {formatDate(order.created_at)}</p></div>
        <button onClick={() => window.print()} className="btn-line btn-sm no-print"><Printer size={14} /> Print</button>
      </div>

      <div className="my-10">
        {cancelled ? <Alert kind="error" title="This order was cancelled">Please contact us if you have any questions.</Alert> : (
          <ol className="grid grid-cols-3 gap-y-6 sm:grid-cols-6" aria-label="Order progress">
            {FLOW.filter((s) => !(s === 'ready' && order.delivery_method === 'delivery') && !(s === 'shipped' && order.delivery_method === 'collection')).map((s) => {
              const idx = FLOW.indexOf(s)
              const done = idx <= step
              return (
                <li key={s} className="text-center" aria-current={idx === step ? 'step' : undefined}>
                  <span className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-xs ${done ? 'border-gold bg-gold text-white' : 'border-line text-faint'}`}>{done ? <Check size={15} /> : idx + 1}</span>
                  <span className={`mt-2 block text-[10px] uppercase tracking-[0.12em] ${done ? 'text-ink' : 'text-faint'}`}>{FLOW_LABEL[s]}</span>
                </li>
              )
            })}
          </ol>
        )}
        {order.tracking_number && <p className="mt-6 text-center text-sm">Tracking reference: <strong>{order.tracking_number}</strong></p>}
      </div>

      {pending && order.payment_method === 'bank_transfer' && (
        <div className="mb-10 border border-gold-soft/60 bg-sand p-6">
          <h2 className="font-serif text-2xl">Complete your payment</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{settings.payment_instructions}</p>
          <dl className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            <div><dt className="text-[10px] uppercase tracking-[0.16em] text-faint">Account name</dt><dd>{settings.bank_account_name}</dd></div>
            <div><dt className="text-[10px] uppercase tracking-[0.16em] text-faint">Bank</dt><dd>{settings.bank_name}</dd></div>
            <div><dt className="text-[10px] uppercase tracking-[0.16em] text-faint">Sort code</dt><dd>{settings.bank_sort_code}</dd></div>
            <div><dt className="text-[10px] uppercase tracking-[0.16em] text-faint">Account number</dt><dd>{settings.bank_account_number}</dd></div>
            <div className="sm:col-span-2"><dt className="text-[10px] uppercase tracking-[0.16em] text-faint">Payment reference</dt><dd className="font-medium">{order.order_number}</dd></div>
          </dl>
          <p className="mt-4 text-sm">Amount due: <strong>{money(order.total)}</strong></p>
        </div>
      )}
      {pending && order.payment_method === 'card_link' && <div className="mb-10"><Alert kind="info" title="Card payment">{settings.card_payment_note}</Alert></div>}
      {pending && order.payment_method === 'pay_on_collection' && <div className="mb-10"><Alert kind="info" title="Pay on collection">Please pay {money(order.total)} when you collect. We will contact you to arrange a time.</Alert></div>}

      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <section>
          <h2 className="mb-4 font-serif text-2xl">Items</h2>
          <ul className="divide-y divide-line border-y border-line">
            {items.map((i) => (
              <li key={i.id} className="flex justify-between gap-4 py-4 text-sm">
                <div><p className="font-medium">{i.product_name} <span className="text-muted">× {i.quantity}</span></p>
                  {personalisationText(bySlug(i.product_slug), i.personalisation ?? {}).map(([k, v]) => <p key={k} className="text-xs text-muted">{k}: {v}</p>)}</div>
                <p>{money(i.line_total)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.delivery_fee ? money(order.delivery_fee) : 'Free'}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 font-serif text-2xl"><dt>Total</dt><dd>{money(order.total)}</dd></div>
          </dl>
        </section>
        <section className="space-y-6 text-sm">
          <div><h2 className="mb-2 font-serif text-2xl">{order.delivery_method === 'collection' ? 'Collection' : 'Delivering to'}</h2>
            {order.delivery_method === 'collection' ? <p className="text-muted">We will contact you to arrange collection.</p> : <p className="leading-6 text-muted">{order.customer_name}<br />{order.address_line1}{order.address_line2 && <><br />{order.address_line2}</>}<br />{order.city} {order.postcode}<br />{order.country}</p>}</div>
          <div><h2 className="mb-2 font-serif text-2xl">Payment</h2><p className="text-muted">{humanise(order.payment_method)} · <span className={order.payment_status === 'paid' ? 'text-[#3d6b2f]' : ''}>{humanise(order.payment_status)}</span></p></div>
          {order.event_date && <div><h2 className="mb-2 font-serif text-2xl">Needed by</h2><p className="text-muted">{formatDate(order.event_date)}</p></div>}
        </section>
      </div>

      <div className="no-print mt-12 flex flex-wrap gap-4 border-t border-line pt-8">
        {digits(settings.whatsapp_number).length >= 7 && <a className="btn-line btn-sm" target="_blank" rel="noopener noreferrer" href={whatsappLink(settings.whatsapp_number, `Hello, I have a question about order ${order.order_number}.`)}><MessageCircle size={14} /> Message us about this order</a>}
        <Link href="/shop" className="btn-dark btn-sm">Continue shopping</Link>
      </div>
    </div>
  )
}
