'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { api } from '@/lib/db'
import { formatDate, money } from '@/lib/format'
import type { Booking, Message, Order, Product, Quote } from '@/lib/types'
import { Loading, Panel, Pill, td, th } from '@/components/admin/ui'

export default function Dashboard() {
  const [data, setData] = useState<{ orders: Order[]; quotes: Quote[]; bookings: Booking[]; messages: Message[]; products: Product[] } | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    const [o, q, b, m, p] = await Promise.all([api.admin.list<Order>('orders'), api.admin.list<Quote>('quotes'), api.admin.list<Booking>('bookings'), api.admin.list<Message>('messages'), api.admin.list<Product>('products')])
    const bad = [o, q, b, m, p].find((r) => !r.ok)
    if (bad && !bad.ok) return setError(bad.error)
    setData({ orders: o.ok ? o.data : [], quotes: q.ok ? q.data : [], bookings: b.ok ? b.data : [], messages: m.ok ? m.data : [], products: p.ok ? p.data : [] })
  }
  useEffect(() => { load() }, [])

  if (!data) return <Loading loading={!error} error={error} onRetry={load} />
  const live = data.orders.filter((o) => o.status !== 'cancelled')
  const revenue = live.filter((o) => o.payment_status === 'paid').reduce((s, o) => s + o.total, 0)
  const outstanding = live.filter((o) => o.payment_status === 'unpaid').reduce((s, o) => s + o.total, 0)
  const low = data.products.filter((p) => p.stock !== null && p.stock <= 5)
  const stats = [
    { label: 'Orders to confirm', value: data.orders.filter((o) => o.status === 'pending').length, href: '/admin/orders' },
    { label: 'Revenue (paid)', value: money(revenue), href: '/admin/orders' },
    { label: 'Awaiting payment', value: money(outstanding), href: '/admin/orders' },
    { label: 'New quote requests', value: data.quotes.filter((q) => q.status === 'new').length, href: '/admin/quotes' },
    { label: 'Pending bookings', value: data.bookings.filter((b) => b.status === 'pending').length, href: '/admin/bookings' },
    { label: 'Unread messages', value: data.messages.filter((m) => m.status === 'new').length, href: '/admin/messages' },
  ]
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (<Link key={s.label} href={s.href} className="border border-line bg-white/60 p-5 transition-colors hover:border-gold"><p className="text-[10px] uppercase tracking-[0.16em] text-muted">{s.label}</p><p className="mt-2 font-serif text-4xl">{s.value}</p></Link>))}
      </div>
      <div className="grid gap-8 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Recent orders" action={<Link href="/admin/orders" className="link-line">View all</Link>}>
          {data.orders.length === 0 ? <Loading empty="No orders yet." /> : (
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-line"><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Total</th><th className={th}>Status</th><th className={th}>Date</th></tr></thead>
              <tbody className="divide-y divide-line">{data.orders.slice(0, 6).map((o) => (<tr key={o.id}><td className={td}><Link href="/admin/orders" className="font-medium hover:text-gold">{o.order_number}</Link></td><td className={td}>{o.customer_name}</td><td className={td}>{money(o.total)}</td><td className={td}><Pill value={o.status} /></td><td className={td}>{formatDate(o.created_at)}</td></tr>))}</tbody></table></div>
          )}
        </Panel>
        <Panel title="Stock alerts">
          {low.length === 0 ? <Loading empty="No low-stock products." /> : <ul className="divide-y divide-line">{low.map((p) => (<li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm"><span className="flex items-center gap-2"><AlertTriangle size={14} className="text-[#a3412e]" />{p.name}</span><span className="text-[#a3412e]">{p.stock} left</span></li>))}</ul>}
        </Panel>
      </div>
    </div>
  )
}
