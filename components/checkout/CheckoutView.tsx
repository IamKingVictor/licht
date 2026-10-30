'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Banknote, CreditCard, Lock, Store, Truck } from 'lucide-react'
import { useCart } from '@/lib/cart'
import { useStore } from '@/lib/store'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/db'
import { computeTotals } from '@/lib/pricing'
import { isEmail, isPhone, money, todayISO } from '@/lib/format'
import type { DeliveryMethod, PaymentMethod, Product } from '@/lib/types'
import { Alert, Field, Spinner, TextArea } from '@/components/ui/fields'
import { EmptyState, Skeleton } from '@/components/ui/bits'
import { ProductImage } from '@/components/shop/ProductCard'
import { personalisationText } from './CartView'

type Form = { customer_name: string; email: string; phone: string; address_line1: string; address_line2: string; city: string; postcode: string; country: string; event_date: string; customer_notes: string }
const empty: Form = { customer_name: '', email: '', phone: '', address_line1: '', address_line2: '', city: '', postcode: '', country: 'United Kingdom', event_date: '', customer_notes: '' }

export default function CheckoutView() {
  const router = useRouter()
  const { lines, hydrated, clear } = useCart()
  const { bySlug, settings, ready } = useStore()
  const { user } = useAuth()
  const [form, setForm] = useState<Form>(empty)
  const [method, setMethod] = useState<DeliveryMethod>('delivery')
  const [payment, setPayment] = useState<PaymentMethod>('bank_transfer')
  const [agree, setAgree] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, customer_name: f.customer_name || user.full_name, email: f.email || user.email, phone: f.phone || user.phone }))
  }, [user])
  useEffect(() => { if (method === 'delivery' && payment === 'pay_on_collection') setPayment('bank_transfer') }, [method, payment])

  const rows = useMemo(() => lines.map((l) => ({ line: l, product: bySlug(l.slug) })), [lines, bySlug])
  const valid = rows.filter((r): r is { line: typeof r.line; product: Product } => Boolean(r.product))
  const totals = computeTotals(valid.map((r) => ({ product: r.product, quantity: r.line.quantity })), settings, method)
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  if (!hydrated || !ready) return <div className="mx-auto max-w-[1360px] px-5 py-14 lg:px-10"><Skeleton className="h-96" /></div>
  if (!lines.length) return <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10"><EmptyState title="Your basket is empty" text="Add something beautiful before checking out." action={<Link href="/shop" className="btn-dark">Browse the shop</Link>} /></div>
  if (valid.length !== rows.length) return <div className="mx-auto max-w-[1360px] px-5 py-16 lg:px-10"><EmptyState title="Some items are no longer available" text="Please review your basket and remove unavailable items." action={<Link href="/cart" className="btn-dark">Back to basket</Link>} /></div>

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.customer_name.trim()) e.customer_name = 'Please enter your full name.'
    if (!isEmail(form.email)) e.email = 'Enter a valid email address.'
    if (!isPhone(form.phone)) e.phone = 'Enter a phone number we can reach you on.'
    if (method === 'delivery') {
      if (!form.address_line1.trim()) e.address_line1 = 'Enter your street address.'
      if (!form.city.trim()) e.city = 'Enter your town or city.'
      if (!form.postcode.trim()) e.postcode = 'Enter your postcode.'
    }
    if (form.event_date && form.event_date < todayISO()) e.event_date = 'Choose a date in the future.'
    for (const r of valid) if (r.line.quantity < r.product.min_quantity) e.items = `${r.product.name} has a minimum order of ${r.product.min_quantity}.`
    if (!agree) e.agree = 'Please accept the terms to continue.'
    setErrors(e)
    return e
  }

  const place = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setTimeout(() => (document.querySelector('[aria-invalid="true"], [data-error]') as HTMLElement | null)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); return }
    setServerError(''); setSubmitting(true)
    const r = await api.placeOrder({
      customer_name: form.customer_name.trim(), email: form.email.trim(), phone: form.phone.trim(), delivery_method: method, payment_method: payment,
      address_line1: method === 'delivery' ? form.address_line1.trim() : undefined, address_line2: method === 'delivery' ? form.address_line2.trim() : undefined,
      city: method === 'delivery' ? form.city.trim() : undefined, postcode: method === 'delivery' ? form.postcode.trim() : undefined, country: method === 'delivery' ? form.country.trim() : undefined,
      event_date: form.event_date || undefined, customer_notes: form.customer_notes.trim() || undefined,
      items: valid.map((x) => ({ slug: x.line.slug, quantity: x.line.quantity, personalisation: x.line.personalisation })),
    })
    setSubmitting(false)
    if (!r.ok) { setServerError(r.error); window.scrollTo({ top: 0, behavior: 'smooth' }); return }
    sessionStorage.setItem('licht:last-order', JSON.stringify({ number: r.data.order_number, email: form.email.trim().toLowerCase(), emailed: r.data.emailed, payment }))
    clear()
    router.push(`/order/${r.data.order_number}?new=1`)
  }

  const payOptions: { value: PaymentMethod; label: string; text: string; icon: React.ReactNode; hidden?: boolean }[] = [
    { value: 'bank_transfer', label: 'Bank transfer', text: 'Pay by transfer — bank details are shown after you place your order.', icon: <Banknote size={18} /> },
    { value: 'card_link', label: 'Card payment', text: settings.card_payment_note, icon: <CreditCard size={18} /> },
    { value: 'pay_on_collection', label: 'Pay on collection', text: 'Pay when you collect your order from us.', icon: <Store size={18} />, hidden: method !== 'collection' },
  ]

  return (
    <form onSubmit={place} noValidate className="mx-auto grid max-w-[1360px] gap-10 px-5 py-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14 lg:px-10 lg:py-14">
      <div className="space-y-12">
        {serverError && <Alert kind="error" title="We could not place your order">{serverError}</Alert>}
        {!user && <p className="text-xs text-muted">Checking out as a guest. <Link href="/account" className="border-b border-gold text-forest">Sign in</Link> to save your details and track orders in your account.</p>}

        <section>
          <h2 className="mb-5 font-serif text-3xl">Contact</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="customer_name" label="Full name" required autoComplete="name" value={form.customer_name} onChange={set('customer_name')} error={errors.customer_name} className="sm:col-span-2" />
            <Field name="email" type="email" label="Email" required autoComplete="email" value={form.email} onChange={set('email')} error={errors.email} />
            <Field name="phone" type="tel" label="Phone / WhatsApp" required autoComplete="tel" value={form.phone} onChange={set('phone')} error={errors.phone} />
          </div>
        </section>

        <section>
          <h2 className="mb-5 font-serif text-3xl">Delivery</h2>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Delivery method">
            {([['delivery', 'Delivery', settings.delivery_note ? 'To your home or event venue' : 'To your door', <Truck key="t" size={18} />], ['collection', 'Collection', 'Free — collect from us by appointment', <Store key="s" size={18} />]] as const).map(([v, label, text, icon]) => (
              <label key={v} className={`flex cursor-pointer items-start gap-3 border p-4 ${method === v ? 'border-gold bg-white' : 'border-line bg-white/40'}`}>
                <input type="radio" name="delivery_method" value={v} checked={method === v} onChange={() => setMethod(v)} className="mt-1 accent-[#1f3b32]" />
                <span className="text-forest">{icon}</span>
                <span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted">{text}</span></span>
              </label>
            ))}
          </div>
          {method === 'delivery' ? (
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field name="address_line1" label="Address" required autoComplete="address-line1" value={form.address_line1} onChange={set('address_line1')} error={errors.address_line1} className="sm:col-span-2" />
              <Field name="address_line2" label="Apartment, suite, etc." autoComplete="address-line2" value={form.address_line2} onChange={set('address_line2')} className="sm:col-span-2" />
              <Field name="city" label="Town / city" required autoComplete="address-level2" value={form.city} onChange={set('city')} error={errors.city} />
              <Field name="postcode" label="Postcode" required autoComplete="postal-code" value={form.postcode} onChange={set('postcode')} error={errors.postcode} />
              <Field name="country" label="Country" autoComplete="country-name" value={form.country} onChange={set('country')} className="sm:col-span-2" />
            </div>
          ) : (
            <p className="mt-5 border border-line bg-white/50 p-4 text-sm leading-6 text-muted">We will contact you to arrange a collection time. {settings.location && <>Location: {settings.location}.</>}</p>
          )}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field name="event_date" type="date" label="Event / needed-by date" min={todayISO()} value={form.event_date} onChange={set('event_date')} error={errors.event_date} hint="Helps us plan production in time" />
            <TextArea name="customer_notes" label="Order notes" rows={3} value={form.customer_notes} onChange={set('customer_notes')} placeholder="Gift message, delivery instructions…" className="sm:col-span-2" />
          </div>
        </section>

        <section>
          <h2 className="mb-5 font-serif text-3xl">Payment</h2>
          <div className="space-y-3" role="radiogroup" aria-label="Payment method">
            {payOptions.filter((o) => !o.hidden).map((o) => (
              <label key={o.value} className={`flex cursor-pointer items-start gap-3 border p-4 ${payment === o.value ? 'border-gold bg-white' : 'border-line bg-white/40'}`}>
                <input type="radio" name="payment" value={o.value} checked={payment === o.value} onChange={() => setPayment(o.value)} className="mt-1 accent-[#1f3b32]" />
                <span className="text-forest">{o.icon}</span>
                <span><span className="block text-sm font-medium">{o.label}</span><span className="block text-xs leading-5 text-muted">{o.text}</span></span>
              </label>
            ))}
          </div>
        </section>

        <div data-error={errors.agree ? true : undefined}>
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-muted">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1.5 h-4 w-4 accent-[#1f3b32]" />
            <span>I have read and accept the <Link href="/policies/terms" target="_blank" className="border-b border-gold text-ink">terms &amp; conditions</Link>, <Link href="/policies/returns" target="_blank" className="border-b border-gold text-ink">returns policy</Link> and <Link href="/policies/privacy" target="_blank" className="border-b border-gold text-ink">privacy policy</Link>, and I have checked my personalisation details.</span>
          </label>
          {errors.agree && <p className="err-text">{errors.agree}</p>}
          {errors.items && <p className="err-text">{errors.items}</p>}
        </div>
      </div>

      <aside className="h-fit border border-line bg-white/50 p-6 lg:sticky lg:top-28">
        <h2 className="font-serif text-3xl">Your order</h2>
        <ul className="mt-5 divide-y divide-line">
          {valid.map(({ line, product }) => (
            <li key={line.key} className="flex gap-4 py-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-sand"><ProductImage src={product.images[0]} alt="" sizes="64px" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-serif text-lg leading-tight">{product.name}</p>
                <p className="text-xs text-muted">Qty {line.quantity}</p>
                {personalisationText(product, line.personalisation).map(([k, v]) => <p key={k} className="truncate text-[11px] text-faint">{k}: {v}</p>)}
              </div>
              <p className="text-sm">{money(product.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">{method === 'collection' ? 'Collection' : 'Delivery'}</dt><dd>{totals.delivery_fee === 0 ? 'Free' : money(totals.delivery_fee)}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 font-serif text-2xl"><dt>Total</dt><dd>{money(totals.total)}</dd></div>
        </dl>
        <button disabled={submitting} className="btn-dark mt-6 w-full">{submitting ? <><Spinner /> Placing order…</> : <><Lock size={14} /> Place order · {money(totals.total)}</>}</button>
        <p className="mt-3 flex items-center justify-center gap-2 text-[11px] text-faint"><ArrowRight size={12} /> You will not be charged until payment is confirmed.</p>
        <Link href="/cart" className="mt-4 block text-center text-[10px] uppercase tracking-[0.16em] text-muted hover:text-forest">Back to basket</Link>
      </aside>
    </form>
  )
}
