// Supabase Edge Function: order-email
// Sends order confirmation / status-update emails through Resend.
// Deploy:  supabase functions deploy order-email
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx MAIL_FROM="LICHT SIGNATURE <orders@yourdomain.com>" STORE_EMAIL=hello@yourdomain.com SITE_URL=https://yourdomain.com
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })
const gbp = (n: number) => `£${Number(n).toFixed(2)}`
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!))

const STATUS_COPY: Record<string, string> = {
  confirmed: 'Your order has been confirmed and will go into preparation shortly.',
  processing: 'Your order is now being prepared with care.',
  ready: 'Your order is ready for collection.',
  shipped: 'Your order is on its way to you.',
  delivered: 'Your order has been delivered. We hope you love it!',
  cancelled: 'Your order has been cancelled. Please get in touch if this is unexpected.',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { type, order_number, email } = await req.json()
    const key = Deno.env.get('RESEND_API_KEY')
    if (!key) return json({ sent: false, reason: 'RESEND_API_KEY not configured' })

    const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const { data: order } = await db.from('orders').select('*, order_items(*)').eq('order_number', String(order_number).toUpperCase()).maybeSingle()
    // Only ever email the address stored on the order — the function cannot be used to mail arbitrary people.
    if (!order || order.email.toLowerCase() !== String(email).toLowerCase()) return json({ sent: false, reason: 'order not found' }, 404)

    if (type === 'status') {
      const { data: auth } = await createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }).auth.getUser()
      const { data: p } = auth.user ? await db.from('profiles').select('role').eq('id', auth.user.id).maybeSingle() : { data: null }
      if (p?.role !== 'admin') return json({ sent: false, reason: 'forbidden' }, 403)
    }

    const { data: s } = await db.from('settings').select('value').eq('key', 'site').maybeSingle()
    const site = (s?.value ?? {}) as Record<string, string>
    const from = Deno.env.get('MAIL_FROM') ?? 'LICHT SIGNATURE <onboarding@resend.dev>'
    const siteUrl = Deno.env.get('SITE_URL') ?? ''
    const rows = (order.order_items ?? []).map((i: { product_name: string; quantity: number; line_total: number; personalisation: Record<string, string> }) =>
      `<tr><td style="padding:8px 0;border-bottom:1px solid #ded5c9">${esc(i.product_name)} × ${i.quantity}${Object.entries(i.personalisation ?? {}).map(([k, v]) => `<br><small style="color:#6e655d">${esc(k)}: ${esc(v)}</small>`).join('')}</td><td style="padding:8px 0;border-bottom:1px solid #ded5c9;text-align:right">${gbp(i.line_total)}</td></tr>`).join('')

    const intro = type === 'confirmation'
      ? `Thank you for your order. We have received it and will confirm it shortly.${order.payment_method === 'bank_transfer' ? `<br><br><strong>Bank transfer</strong><br>${esc(site.bank_account_name)} · ${esc(site.bank_name)}<br>Sort code ${esc(site.bank_sort_code)} · Account ${esc(site.bank_account_number)}<br>Reference: <strong>${esc(order.order_number)}</strong>` : ''}`
      : (STATUS_COPY[order.status] ?? `Your order status is now: ${esc(order.status)}.`)

    const html = `<div style="font-family:Georgia,serif;background:#f8f5ef;padding:32px;color:#241f1b"><div style="max-width:560px;margin:auto;background:#fff;padding:32px">
      <p style="letter-spacing:.25em;font-size:22px;margin:0">LICHT</p><p style="letter-spacing:.35em;font-size:8px;color:#1f3b32;margin:4px 0 24px">SIGNATURE SOUVENIRS</p>
      <h2 style="font-weight:400">Order ${esc(order.order_number)}</h2><p style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6">Hello ${esc(order.customer_name.split(' ')[0])},<br><br>${intro}</p>
      <table style="width:100%;font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">${rows}<tr><td style="padding-top:12px">Delivery</td><td style="text-align:right;padding-top:12px">${gbp(order.delivery_fee)}</td></tr><tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${gbp(order.total)}</strong></td></tr></table>
      ${siteUrl ? `<p style="font-family:Arial,sans-serif;font-size:13px;margin-top:24px"><a href="${siteUrl}/track-order" style="color:#1f3b32">Track your order</a></p>` : ''}
      <p style="font-family:Arial,sans-serif;font-size:12px;color:#6e655d;margin-top:32px">Every moment deserves a signature.</p></div></div>`

    const subject = type === 'confirmation' ? `We received your order ${order.order_number}` : `Your order ${order.order_number}: ${order.status}`
    const send = (to: string, subj: string) => fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to, subject: subj, html }) })
    const res = await send(order.email, subject)
    const storeEmail = Deno.env.get('STORE_EMAIL')
    if (type === 'confirmation' && storeEmail) await send(storeEmail, `New order ${order.order_number} — ${gbp(order.total)}`)
    return json({ sent: res.ok })
  } catch (e) {
    return json({ sent: false, reason: String(e) }, 500)
  }
})
