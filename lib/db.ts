/**
 * Data layer. Every public function resolves to a Res<T> ({ok:true,data} | {ok:false,error})
 * and never throws, so every UI action always gets a response it can show.
 *
 * Backend: Supabase when NEXT_PUBLIC_SUPABASE_URL / ANON_KEY are set, otherwise a
 * browser-storage demo backend that behaves the same way (seeded with sample data).
 */
import { HAS_SUPABASE } from './config'
import { getSupabase } from './supabase'
import { blobToDataUrl, resizeImage } from './image'
import { computeTotals, round } from './pricing'
import { seedCategories, seedProducts, seedReviews, seedSettings } from './seed'
import type {
  Booking, BookingInput, Category, Message, MessageInput, Order, OrderInput, OrderItem, Product, Quote,
  QuoteInput, Res, Review, ReviewInput, SiteSettings, Subscriber,
} from './types'

export type AdminTable = 'products' | 'categories' | 'orders' | 'quotes' | 'bookings' | 'messages' | 'reviews' | 'subscribers'

const ok = <T,>(data: T): Res<T> => ({ ok: true, data })
const fail = <T = never,>(error: string): Res<T> => ({ ok: false, error })

export function errMsg(e: unknown): string {
  const m = typeof e === 'string' ? e : (e as { message?: string })?.message || 'Something went wrong.'
  if (/failed to fetch|networkerror|load failed/i.test(m)) return 'We could not reach the server. Please check your connection and try again.'
  if (/row-level security|permission denied|not authorized/i.test(m)) return 'You do not have permission to do that.'
  return m
}

async function guard<T>(fn: () => Promise<Res<T>>): Promise<Res<T>> {
  try {
    return await fn()
  } catch (e) {
    return fail(errMsg(e))
  }
}

/* ───────────────────────── local (demo) backend ───────────────────────── */

const LS = (t: string) => `licht:db:${t}`
const hasWindow = () => typeof window !== 'undefined'

function lread<T>(table: string, seed: () => T[] = () => []): T[] {
  if (!hasWindow()) return seed()
  try {
    const raw = localStorage.getItem(LS(table))
    if (raw) return JSON.parse(raw) as T[]
  } catch {
    /* fall through to seed */
  }
  const s = seed()
  lwrite(table, s)
  return s
}
function lwrite<T>(table: string, rows: T[]) {
  localStorage.setItem(LS(table), JSON.stringify(rows))
}
function lsettings(): SiteSettings {
  try {
    const raw = hasWindow() && localStorage.getItem(LS('settings'))
    if (raw) return { ...seedSettings, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return seedSettings
}
const uid = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`)
const now = () => new Date().toISOString()
const rand = (n: number) => Array.from({ length: n }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
const ymd = () => now().slice(2, 7).replace('-', '')

export function resetDemoData() {
  Object.keys(localStorage).filter((k) => k.startsWith('licht:db:')).forEach((k) => localStorage.removeItem(k))
}

/* ───────────────────────── offline outbox (PWA) ───────────────────────── */

type OutboxKind = 'quote' | 'booking' | 'message' | 'subscribe' | 'review'
const OUTBOX = 'licht:outbox'

function outboxPush(kind: OutboxKind, payload: unknown) {
  const list = JSON.parse(localStorage.getItem(OUTBOX) || '[]')
  list.push({ kind, payload, at: now() })
  localStorage.setItem(OUTBOX, JSON.stringify(list))
}

async function send<T extends object>(kind: OutboxKind, payload: unknown, run: () => Promise<Res<T>>, queuedData: T): Promise<Res<T & { queued?: boolean }>> {
  if (hasWindow() && typeof navigator !== 'undefined' && navigator.onLine === false) {
    outboxPush(kind, payload)
    return ok({ ...queuedData, queued: true })
  }
  return run()
}

export async function flushOutbox(): Promise<number> {
  if (!hasWindow()) return 0
  let list: { kind: OutboxKind; payload: never }[] = []
  try {
    list = JSON.parse(localStorage.getItem(OUTBOX) || '[]')
  } catch {
    return 0
  }
  if (!list.length) return 0
  localStorage.removeItem(OUTBOX)
  let sent = 0
  for (const item of list) {
    let r: Res<unknown>
    if (item.kind === 'quote') r = await runQuote(item.payload)
    else if (item.kind === 'booking') r = await runBooking(item.payload)
    else if (item.kind === 'message') r = await runMessage(item.payload)
    else if (item.kind === 'subscribe') r = await runSubscribe(item.payload)
    else r = await runReview(item.payload)
    if (r.ok) sent++
    else outboxPush(item.kind, item.payload)
  }
  return sent
}

/* ───────────────────────── storefront ───────────────────────── */

async function loadStorefront(): Promise<Res<{ categories: Category[]; products: Product[]; settings: SiteSettings }>> {
  const sb = getSupabase()
  if (!sb) {
    return ok({
      categories: lread<Category>('categories', () => seedCategories).filter((c) => c.is_active).sort((a, b) => a.sort_order - b.sort_order),
      products: lread<Product>('products', () => seedProducts).filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order),
      settings: lsettings(),
    })
  }
  const [c, p, s] = await Promise.all([
    sb.from('categories').select('*').eq('is_active', true).order('sort_order'),
    sb.from('products').select('*').eq('is_active', true).order('sort_order'),
    sb.from('settings').select('value').eq('key', 'site').maybeSingle(),
  ])
  if (c.error) return fail(errMsg(c.error))
  if (p.error) return fail(errMsg(p.error))
  return ok({
    categories: (c.data ?? []) as Category[],
    products: (p.data ?? []) as Product[],
    settings: { ...seedSettings, ...((s.data?.value as Partial<SiteSettings>) ?? {}) },
  })
}

function validateOrderInput(i: OrderInput): string | null {
  if (!i.items?.length) return 'Your basket is empty.'
  if (!i.customer_name?.trim()) return 'Please enter your name.'
  if (!i.email?.trim()) return 'Please enter your email address.'
  if (i.delivery_method === 'delivery' && (!i.address_line1?.trim() || !i.city?.trim() || !i.postcode?.trim()))
    return 'Please complete your delivery address.'
  return null
}

async function placeOrder(input: OrderInput): Promise<Res<{ order_number: string; total: number; emailed: boolean }>> {
  const invalid = validateOrderInput(input)
  if (invalid) return fail(invalid)
  const sb = getSupabase()
  if (!sb) {
    const products = lread<Product>('products', () => seedProducts)
    const settings = lsettings()
    const items: OrderItem[] = []
    const priced: { product: Product; quantity: number }[] = []
    const orderId = uid()
    for (const line of input.items) {
      const product = products.find((p) => p.slug === line.slug && p.is_active)
      if (!product) return fail('One of the products in your basket is no longer available.')
      if (line.quantity < product.min_quantity) return fail(`${product.name} has a minimum order of ${product.min_quantity}.`)
      if (product.stock !== null && product.stock < line.quantity) return fail(`Only ${product.stock} of ${product.name} are in stock.`)
      priced.push({ product, quantity: line.quantity })
      items.push({
        id: uid(), order_id: orderId, product_slug: product.slug, product_name: product.name, image_url: product.images[0] ?? null,
        unit_price: product.price, quantity: line.quantity, line_total: round(product.price * line.quantity), personalisation: line.personalisation || {},
      })
    }
    const t = computeTotals(priced, settings, input.delivery_method)
    const orders = lread<Order>('orders')
    const order: Order = {
      id: orderId, order_number: `LS-${ymd()}-${rand(4)}`, user_id: currentLocalUserId(),
      customer_name: input.customer_name.trim(), email: input.email.trim().toLowerCase(), phone: input.phone?.trim() ?? '',
      delivery_method: input.delivery_method, address_line1: input.address_line1 ?? null, address_line2: input.address_line2 ?? null,
      city: input.city ?? null, postcode: input.postcode ?? null, country: input.country ?? null,
      event_date: input.event_date || null, customer_notes: input.customer_notes || null,
      subtotal: t.subtotal, delivery_fee: t.delivery_fee, total: t.total, payment_method: input.payment_method,
      payment_status: 'unpaid', status: 'pending', tracking_number: null, admin_notes: null, created_at: now(), updated_at: now(), order_items: items,
    }
    lwrite('orders', [order, ...orders])
    const next = products.map((p) => {
      const sold = priced.find((x) => x.product.id === p.id)
      return sold && p.stock !== null ? { ...p, stock: p.stock - sold.quantity } : p
    })
    lwrite('products', next)
    return ok({ order_number: order.order_number, total: order.total, emailed: false })
  }
  const { data, error } = await sb.rpc('place_order', { p_payload: input })
  if (error) return fail(errMsg(error))
  const res = data as { order_number: string; total: number }
  const emailed = await invokeEmail({ type: 'confirmation', order_number: res.order_number, email: input.email })
  return ok({ order_number: res.order_number, total: Number(res.total), emailed })
}

async function invokeEmail(body: { type: 'confirmation' | 'status'; order_number: string; email: string }): Promise<boolean> {
  const sb = getSupabase()
  if (!sb) return false
  try {
    const { data, error } = await sb.functions.invoke('order-email', { body })
    return !error && Boolean((data as { sent?: boolean })?.sent)
  } catch {
    return false
  }
}

async function trackOrder(orderNumber: string, email: string): Promise<Res<Order>> {
  const num = orderNumber.trim().toUpperCase()
  const mail = email.trim().toLowerCase()
  if (!num || !mail) return fail('Enter your order number and email address.')
  const sb = getSupabase()
  if (!sb) {
    const o = lread<Order>('orders').find((x) => x.order_number === num && x.email === mail)
    return o ? ok(o) : fail('We could not find an order matching those details.')
  }
  const { data, error } = await sb.rpc('track_order', { p_order_number: num, p_email: mail })
  if (error) return fail(errMsg(error))
  return data ? ok(data as Order) : fail('We could not find an order matching those details.')
}

async function myOrders(email?: string): Promise<Res<Order[]>> {
  const sb = getSupabase()
  if (!sb) {
    const uidNow = currentLocalUserId()
    return ok(lread<Order>('orders').filter((o) => (uidNow && o.user_id === uidNow) || (email && o.email === email.toLowerCase())))
  }
  const { data, error } = await sb.from('orders').select('*, order_items(*)').order('created_at', { ascending: false })
  return error ? fail(errMsg(error)) : ok((data ?? []) as Order[])
}

function currentLocalUserId(): string | null {
  try {
    const s = JSON.parse(localStorage.getItem('licht:demo:session') || 'null')
    return s?.id ?? null
  } catch {
    return null
  }
}

async function runQuote(input: QuoteInput): Promise<Res<{ reference: string }>> {
  const sb = getSupabase()
  if (!sb) {
    const reference = `QT-${ymd()}-${rand(4)}`
    const row: Quote = {
      id: uid(), reference, name: input.name, email: input.email.toLowerCase(), phone: input.phone, company: input.company || null,
      enquiry_type: input.enquiry_type, event_date: input.event_date || null, quantity: input.quantity ?? null, budget_range: input.budget_range || null,
      products_of_interest: input.products_of_interest || null, message: input.message || null, status: 'new', quoted_amount: null, admin_notes: null, created_at: now(),
    }
    lwrite('quotes', [row, ...lread<Quote>('quotes')])
    return ok({ reference })
  }
  const { data, error } = await sb.rpc('submit_quote', { p: input })
  return error ? fail(errMsg(error)) : ok({ reference: (data as { reference: string }).reference })
}
const submitQuote = (input: QuoteInput) =>
  guard(() => send('quote', input, () => runQuote(input), { reference: 'Pending' }))

async function runBooking(input: BookingInput): Promise<Res<{ reference: string }>> {
  const sb = getSupabase()
  if (!sb) {
    const reference = `BK-${ymd()}-${rand(4)}`
    const row: Booking = {
      id: uid(), reference, name: input.name, email: input.email.toLowerCase(), phone: input.phone, booking_type: input.booking_type, mode: input.mode,
      event_type: input.event_type || null, preferred_date: input.preferred_date, preferred_time: input.preferred_time, guests: input.guests ?? null,
      message: input.message || null, status: 'pending', admin_notes: null, created_at: now(),
    }
    lwrite('bookings', [row, ...lread<Booking>('bookings')])
    return ok({ reference })
  }
  const { data, error } = await sb.rpc('submit_booking', { p: input })
  return error ? fail(errMsg(error)) : ok({ reference: (data as { reference: string }).reference })
}
const submitBooking = (input: BookingInput) =>
  guard(() => send('booking', input, () => runBooking(input), { reference: 'Pending' }))

async function runMessage(input: MessageInput): Promise<Res<Record<string, never>>> {
  const sb = getSupabase()
  if (!sb) {
    const row: Message = {
      id: uid(), name: input.name, email: input.email.toLowerCase(), phone: input.phone || null, enquiry_type: input.enquiry_type,
      event_date: input.event_date || null, quantity: input.quantity ?? null, budget_range: input.budget_range || null, message: input.message, status: 'new', created_at: now(),
    }
    lwrite('messages', [row, ...lread<Message>('messages')])
    return ok({})
  }
  const { error } = await sb.from('messages').insert({
    name: input.name, email: input.email.toLowerCase(), phone: input.phone || null, enquiry_type: input.enquiry_type,
    event_date: input.event_date || null, quantity: input.quantity ?? null, budget_range: input.budget_range || null, message: input.message,
  })
  return error ? fail(errMsg(error)) : ok({})
}
const submitMessage = (input: MessageInput) => guard(() => send('message', input, () => runMessage(input), {}))

async function runSubscribe(email: string): Promise<Res<{ already: boolean }>> {
  const e = email.trim().toLowerCase()
  const sb = getSupabase()
  if (!sb) {
    const list = lread<Subscriber>('subscribers')
    if (list.some((s) => s.email === e)) return ok({ already: true })
    lwrite('subscribers', [{ id: uid(), email: e, created_at: now() }, ...list])
    return ok({ already: false })
  }
  const { error } = await sb.from('subscribers').insert({ email: e })
  if (error) return error.code === '23505' ? ok({ already: true }) : fail(errMsg(error))
  return ok({ already: false })
}
const subscribe = (email: string) => guard(() => send('subscribe', email, () => runSubscribe(email), { already: false }))

async function listReviews(productSlug?: string, limit = 12): Promise<Res<Review[]>> {
  const sb = getSupabase()
  if (!sb) {
    let rows = lread<Review>('reviews', () => seedReviews).filter((r) => r.approved)
    if (productSlug) rows = rows.filter((r) => r.product_slug === productSlug)
    return ok(rows.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit))
  }
  let q = sb.from('reviews').select('*').eq('approved', true).order('created_at', { ascending: false }).limit(limit)
  if (productSlug) q = q.eq('product_slug', productSlug)
  const { data, error } = await q
  return error ? fail(errMsg(error)) : ok((data ?? []) as Review[])
}

async function runReview(input: ReviewInput): Promise<Res<Record<string, never>>> {
  const sb = getSupabase()
  if (!sb) {
    const row: Review = {
      id: uid(), product_slug: input.product_slug || null, name: input.name, rating: input.rating, title: input.title || null,
      label: 'Customer', body: input.body, approved: false, created_at: now(),
    }
    lwrite('reviews', [row, ...lread<Review>('reviews', () => seedReviews)])
    return ok({})
  }
  const { error } = await sb.from('reviews').insert({
    product_slug: input.product_slug || null, name: input.name, rating: input.rating, title: input.title || null, body: input.body, label: 'Customer',
  })
  return error ? fail(errMsg(error)) : ok({})
}
const submitReview = (input: ReviewInput) => guard(() => send('review', input, () => runReview(input), {}))

/* ───────────────────────── admin ───────────────────────── */

const seeds: Partial<Record<AdminTable, () => unknown[]>> = {
  products: () => seedProducts,
  categories: () => seedCategories,
  reviews: () => seedReviews,
}
const selects: Partial<Record<AdminTable, string>> = { orders: '*, order_items(*)' }

async function adminList<T>(table: AdminTable): Promise<Res<T[]>> {
  const sb = getSupabase()
  if (!sb) {
    const rows = lread<Record<string, unknown>>(table, (seeds[table] as () => Record<string, unknown>[]) ?? (() => []))
    return ok(sortRows(table, rows) as T[])
  }
  const orderCol = table === 'products' || table === 'categories' ? 'sort_order' : 'created_at'
  const { data, error } = await sb.from(table).select(selects[table] ?? '*').order(orderCol, { ascending: orderCol === 'sort_order' })
  return error ? fail(errMsg(error)) : ok((data ?? []) as unknown as T[])
}

function sortRows(table: AdminTable, rows: Record<string, unknown>[]) {
  if (table === 'products' || table === 'categories') return [...rows].sort((a, b) => Number(a.sort_order) - Number(b.sort_order))
  return [...rows].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
}

async function adminUpsert<T extends { id?: string }>(table: AdminTable, row: T): Promise<Res<T>> {
  const sb = getSupabase()
  if (!sb) {
    const rows = lread<Record<string, unknown>>(table, (seeds[table] as () => Record<string, unknown>[]) ?? (() => []))
    const id = row.id || uid()
    const full = { created_at: now(), ...row, id, ...(table === 'orders' ? { updated_at: now() } : {}) }
    const idx = rows.findIndex((r) => r.id === id)
    if (idx >= 0) rows[idx] = { ...rows[idx], ...full }
    else rows.unshift(full)
    lwrite(table, rows)
    return ok(full as T)
  }
  const payload: Record<string, unknown> = { ...row }
  if (!payload.id) delete payload.id
  delete payload.order_items
  const { data, error } = await sb.from(table).upsert(payload).select().single()
  return error ? fail(errMsg(error)) : ok(data as T)
}

async function adminUpdate(table: AdminTable, id: string, patch: Record<string, unknown>): Promise<Res<true>> {
  const sb = getSupabase()
  if (!sb) {
    const rows = lread<Record<string, unknown>>(table, (seeds[table] as () => Record<string, unknown>[]) ?? (() => []))
    const idx = rows.findIndex((r) => r.id === id)
    if (idx < 0) return fail('That record no longer exists.')
    rows[idx] = { ...rows[idx], ...patch, ...(table === 'orders' ? { updated_at: now() } : {}) }
    lwrite(table, rows)
    return ok(true)
  }
  const { error } = await sb.from(table).update(patch).eq('id', id)
  return error ? fail(errMsg(error)) : ok(true)
}

async function adminRemove(table: AdminTable, id: string): Promise<Res<true>> {
  const sb = getSupabase()
  if (!sb) {
    const rows = lread<Record<string, unknown>>(table, (seeds[table] as () => Record<string, unknown>[]) ?? (() => []))
    lwrite(table, rows.filter((r) => r.id !== id))
    return ok(true)
  }
  const { error } = await sb.from(table).delete().eq('id', id)
  return error ? fail(errMsg(error)) : ok(true)
}

async function adminGetSettings(): Promise<Res<SiteSettings>> {
  const sb = getSupabase()
  if (!sb) return ok(lsettings())
  const { data, error } = await sb.from('settings').select('value').eq('key', 'site').maybeSingle()
  return error ? fail(errMsg(error)) : ok({ ...seedSettings, ...((data?.value as Partial<SiteSettings>) ?? {}) })
}

async function adminSaveSettings(s: SiteSettings): Promise<Res<SiteSettings>> {
  const sb = getSupabase()
  if (!sb) {
    localStorage.setItem(LS('settings'), JSON.stringify(s))
    return ok(s)
  }
  const { error } = await sb.from('settings').upsert({ key: 'site', value: s })
  return error ? fail(errMsg(error)) : ok(s)
}

async function uploadImage(file: File): Promise<Res<string>> {
  const blob = await resizeImage(file)
  const sb = getSupabase()
  if (!sb) return ok(await blobToDataUrl(blob))
  const path = `${Date.now()}-${rand(6).toLowerCase()}.jpg`
  const { error } = await sb.storage.from('product-images').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
  if (error) return fail(errMsg(error))
  return ok(sb.storage.from('product-images').getPublicUrl(path).data.publicUrl)
}

async function adminOrderEmail(order: Order): Promise<boolean> {
  return invokeEmail({ type: 'status', order_number: order.order_number, email: order.email })
}

export const api = {
  loadStorefront: () => guard(loadStorefront),
  placeOrder: (i: OrderInput) => guard(() => placeOrder(i)),
  trackOrder: (n: string, e: string) => guard(() => trackOrder(n, e)),
  myOrders: (email?: string) => guard(() => myOrders(email)),
  submitQuote,
  submitBooking,
  submitMessage,
  subscribe,
  listReviews: (slug?: string, limit?: number) => guard(() => listReviews(slug, limit)),
  submitReview,
  admin: {
    list: <T,>(t: AdminTable) => guard(() => adminList<T>(t)),
    upsert: <T extends { id?: string }>(t: AdminTable, row: T) => guard(() => adminUpsert<T>(t, row)),
    update: (t: AdminTable, id: string, patch: Record<string, unknown>) => guard(() => adminUpdate(t, id, patch)),
    remove: (t: AdminTable, id: string) => guard(() => adminRemove(t, id)),
    getSettings: () => guard(adminGetSettings),
    saveSettings: (s: SiteSettings) => guard(() => adminSaveSettings(s)),
    uploadImage: (f: File) => guard(() => uploadImage(f)),
    emailOrderUpdate: (o: Order) => adminOrderEmail(o),
  },
}

export { HAS_SUPABASE }
