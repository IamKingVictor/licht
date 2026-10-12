# LICHT SIGNATURE SOUVENIRS — PWA storefront + admin

Next.js 16 · React 19 · Tailwind 4 · Supabase (Postgres, Auth, Storage) · installable PWA.

## Run it

```bash
npm install
cp .env.example .env.local      # optional — see below
npm run dev                      # http://localhost:3000
```

**Demo mode:** with no Supabase keys the whole site works on browser storage (seeded catalogue, cart, checkout, quotes, bookings, admin). Demo admin: `admin@licht.demo` / `admin123` at `/admin`. Nothing leaves the browser, so this is for previewing only.

## Connect Supabase (real data)

1. Create a project at supabase.com.
2. **SQL Editor → run `supabase/schema.sql`** (tables, row-level security, order/quote/booking functions, image bucket). Then optionally run `supabase/seed.sql` for the sample catalogue.
3. Put the project URL and anon key in `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. **Create your admin:** register on `/account`, then in the SQL editor run  
   `update public.profiles set role = 'admin' where email = 'you@yourdomain.com';`  
   Sign in at `/admin/login`.
5. Authentication → URL Configuration: add your site URL (needed for email confirmation / password reset links).
6. Open **Admin → Site settings** and replace the placeholder contact, WhatsApp, Instagram and bank details.

### Order emails (optional)
`supabase/functions/order-email` sends confirmation and status emails via [Resend](https://resend.com):
```bash
supabase functions deploy order-email
supabase secrets set RESEND_API_KEY=re_xxx MAIL_FROM="LICHT SIGNATURE <orders@yourdomain.com>" STORE_EMAIL=hello@yourdomain.com SITE_URL=https://yourdomain.com
```
Without it, orders still work; the confirmation page simply doesn't claim an email was sent.

## What's included

| Area | Pages |
|---|---|
| Storefront | `/` · `/shop` (search, category, price, sort) · `/shop/[slug]` (personalisation, quantity, reviews) · `/about` · `/events` · `/personalised-gifts` · `/corporate-gifts` · `/gift-boxes` · `/contact` · `/faq` · `/policies/*` |
| Buying | `/cart` · `/checkout` (guest or account) · `/order/[number]` · `/track-order` · `/wishlist` · `/account` |
| Quotes & bookings | `/quote` — tabs for **quotation requests** and **consultation bookings** (also embedded on `/corporate-gifts`) |
| Admin | `/admin` dashboard · orders (confirm, mark paid, status, tracking, print slip, email/WhatsApp) · products & categories (CRUD, image upload, personalisation fields, stock) · quotations (status, quoted amount) · bookings · messages · reviews moderation · subscribers (CSV) · site settings |
| PWA | manifest + icons, service worker (offline page, cached assets/pages), install prompt, update prompt, offline banner, offline outbox for enquiries |

Every data call goes through `lib/db.ts` and returns `{ ok, data } | { ok: false, error }`, so each form/button always shows a success or error message.

## Security notes
- Order totals, delivery fees and stock are **recalculated in the database** (`place_order`), never trusted from the browser.
- Row-level security: the public can only read active catalogue + approved reviews and insert enquiries/reviews/subscribers; customers see only their own orders; everything else is admin-only (`profiles.role = 'admin'`).
- Forms include a honeypot field and server-side validation.

## Before launch
- Payments: checkout offers **bank transfer, card payment link (sent by email) and pay on collection**; admin marks orders paid. For automatic card capture, add Stripe Checkout and call it from `place_order`'s follow-up (not included).
- Replace placeholder contact/bank details, the Instagram gallery (currently product photos), and have the policy text in `lib/content.ts` reviewed.
- Currency defaults to £ (Admin → Site settings). The `Price` filter labels in `ShopView.tsx` use £.
- Set `NEXT_PUBLIC_SITE_URL` for correct SEO/sitemap, and `NEXT_PUBLIC_GA_ID` for Google Analytics.
- The service worker only registers in production builds (`npm run build && npm start`).
