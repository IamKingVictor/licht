-- ============================================================================
-- LICHT SIGNATURE SOUVENIRS — Supabase schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query.
-- It is idempotent (safe to re-run).
-- ============================================================================

create extension if not exists pgcrypto;

-- ───────────── helpers ─────────────
create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create or replace function public.gen_ref(prefix text) returns text language sql volatile as $$
  select prefix || '-' || to_char(now(), 'YYMM') || '-' ||
    (select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '') from generate_series(1, 4))
$$;

-- ───────────── profiles & roles ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text not null default '',
  phone text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.raw_user_meta_data->>'phone', ''))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
$$;

-- Customers may edit their own name/phone but never their role.
create or replace function public.protect_role() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_admin() and auth.uid() is not null then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role before update on public.profiles for each row execute function public.protect_role();

-- ───────────── catalogue ─────────────
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text not null default '',
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  price_is_from boolean not null default false,
  category_slug text not null references public.categories(slug) on update cascade,
  images text[] not null default '{}',
  occasions text[] not null default '{}',
  is_personalisable boolean not null default false,
  personalisation_fields jsonb not null default '[]',
  min_quantity int not null default 1 check (min_quantity >= 1),
  stock int check (stock is null or stock >= 0),          -- null = made to order
  lead_time_days int not null default 5,
  is_bestseller boolean not null default false,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists products_updated on public.products;
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();
create index if not exists products_category_idx on public.products (category_slug);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ───────────── orders ─────────────
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default public.gen_ref('LS'),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  email text not null,
  phone text not null default '',
  delivery_method text not null default 'delivery' check (delivery_method in ('delivery', 'collection')),
  address_line1 text, address_line2 text, city text, postcode text, country text,
  event_date date,
  customer_notes text,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method text not null default 'bank_transfer' check (payment_method in ('bank_transfer', 'card_link', 'pay_on_collection')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid', 'refunded')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
drop trigger if exists orders_updated on public.orders;
create trigger orders_updated before update on public.orders for each row execute function public.set_updated_at();
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_slug text not null,
  product_name text not null,
  image_url text,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null,
  personalisation jsonb not null default '{}'
);
create index if not exists order_items_order_idx on public.order_items (order_id);

-- ───────────── enquiries ─────────────
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default public.gen_ref('QT'),
  user_id uuid references auth.users(id) on delete set null,
  name text not null, email text not null, phone text not null default '', company text,
  enquiry_type text not null,
  event_date date, quantity int, budget_range text, products_of_interest text, message text,
  status text not null default 'new' check (status in ('new', 'in_progress', 'quoted', 'accepted', 'declined', 'closed')),
  quoted_amount numeric(10,2),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null default public.gen_ref('BK'),
  user_id uuid references auth.users(id) on delete set null,
  name text not null, email text not null, phone text not null default '',
  booking_type text not null, mode text not null default 'video', event_type text,
  preferred_date date not null, preferred_time text not null, guests int, message text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text,
  enquiry_type text not null, event_date date, quantity int, budget_range text,
  message text not null,
  status text not null default 'new' check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text references public.products(slug) on update cascade on delete cascade,
  name text not null,
  rating int not null check (rating between 1 and 5),
  title text, body text not null, label text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);

-- ───────────── RPCs (security definer: validated server-side) ─────────────

-- Places an order. Prices, stock and delivery fees are always recalculated from the database,
-- so a customer can never tamper with totals from the browser.
create or replace function public.place_order(p_payload jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  s jsonb := coalesce((select value from public.settings where key = 'site'), '{}'::jsonb);
  fee numeric := coalesce((s->>'delivery_fee')::numeric, 6.95);
  free_over numeric := coalesce((s->>'free_delivery_threshold')::numeric, 75);
  method text := coalesce(p_payload->>'delivery_method', 'delivery');
  pay text := coalesce(p_payload->>'payment_method', 'bank_transfer');
  item jsonb; prod public.products%rowtype; qty int;
  sub numeric := 0; dfee numeric := 0; oid uuid; onum text;
begin
  if jsonb_typeof(p_payload->'items') <> 'array' or jsonb_array_length(p_payload->'items') = 0 then raise exception 'Your basket is empty.'; end if;
  if jsonb_array_length(p_payload->'items') > 100 then raise exception 'Too many items in one order — please request a quote.'; end if;
  if coalesce(trim(p_payload->>'customer_name'), '') = '' then raise exception 'Please enter your name.'; end if;
  if coalesce(p_payload->>'email', '') !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then raise exception 'Please enter a valid email address.'; end if;
  if method not in ('delivery', 'collection') then raise exception 'Invalid delivery method.'; end if;
  if pay not in ('bank_transfer', 'card_link', 'pay_on_collection') then raise exception 'Invalid payment method.'; end if;
  if pay = 'pay_on_collection' and method <> 'collection' then raise exception 'Pay on collection is only available for collection orders.'; end if;
  if method = 'delivery' and (coalesce(trim(p_payload->>'address_line1'), '') = '' or coalesce(trim(p_payload->>'city'), '') = '' or coalesce(trim(p_payload->>'postcode'), '') = '') then
    raise exception 'Please complete your delivery address.';
  end if;

  -- first pass: validate + subtotal
  for item in select * from jsonb_array_elements(p_payload->'items') loop
    qty := coalesce((item->>'quantity')::int, 0);
    select * into prod from public.products where slug = item->>'slug' and is_active for update;
    if not found then raise exception 'One of the products in your basket is no longer available.'; end if;
    if qty < prod.min_quantity then raise exception '% has a minimum order of %.', prod.name, prod.min_quantity; end if;
    if qty > 10000 then raise exception 'Please request a quote for orders this large.'; end if;
    if prod.stock is not null and prod.stock < qty then raise exception 'Only % of % are in stock.', prod.stock, prod.name; end if;
    sub := sub + prod.price * qty;
  end loop;

  if method = 'delivery' and not (free_over > 0 and sub >= free_over) then dfee := fee; end if;

  insert into public.orders (user_id, customer_name, email, phone, delivery_method, address_line1, address_line2, city, postcode, country,
    event_date, customer_notes, subtotal, delivery_fee, total, payment_method)
  values (auth.uid(), trim(p_payload->>'customer_name'), lower(trim(p_payload->>'email')), coalesce(p_payload->>'phone', ''), method,
    nullif(p_payload->>'address_line1', ''), nullif(p_payload->>'address_line2', ''), nullif(p_payload->>'city', ''), nullif(p_payload->>'postcode', ''), nullif(p_payload->>'country', ''),
    nullif(p_payload->>'event_date', '')::date, nullif(left(p_payload->>'customer_notes', 1000), ''), sub, dfee, sub + dfee, pay)
  returning id, order_number into oid, onum;

  -- second pass: items + stock
  for item in select * from jsonb_array_elements(p_payload->'items') loop
    qty := (item->>'quantity')::int;
    select * into prod from public.products where slug = item->>'slug';
    insert into public.order_items (order_id, product_slug, product_name, image_url, unit_price, quantity, line_total, personalisation)
    values (oid, prod.slug, prod.name, prod.images[1], prod.price, qty, prod.price * qty, coalesce(item->'personalisation', '{}'::jsonb));
    if prod.stock is not null then update public.products set stock = stock - qty where id = prod.id; end if;
  end loop;

  return jsonb_build_object('order_number', onum, 'total', sub + dfee, 'subtotal', sub, 'delivery_fee', dfee);
end $$;

-- Customer order lookup by order number + email (no login needed).
create or replace function public.track_order(p_order_number text, p_email text) returns jsonb
language sql stable security definer set search_path = public as $$
  select to_jsonb(o) || jsonb_build_object('order_items', coalesce((select jsonb_agg(to_jsonb(i)) from public.order_items i where i.order_id = o.id), '[]'::jsonb))
  from public.orders o
  where o.order_number = upper(trim(p_order_number)) and lower(o.email) = lower(trim(p_email))
  limit 1
$$;

create or replace function public.submit_quote(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r text;
begin
  if coalesce(trim(p->>'name'), '') = '' or coalesce(p->>'email', '') !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then raise exception 'Please provide your name and a valid email address.'; end if;
  insert into public.quotes (user_id, name, email, phone, company, enquiry_type, event_date, quantity, budget_range, products_of_interest, message)
  values (auth.uid(), left(p->>'name', 200), lower(trim(p->>'email')), left(coalesce(p->>'phone', ''), 50), nullif(left(p->>'company', 200), ''), coalesce(nullif(p->>'enquiry_type', ''), 'Other event'),
    nullif(p->>'event_date', '')::date, nullif(p->>'quantity', '')::int, nullif(p->>'budget_range', ''), nullif(left(p->>'products_of_interest', 2000), ''), nullif(left(p->>'message', 4000), ''))
  returning reference into r;
  return jsonb_build_object('reference', r);
end $$;

create or replace function public.submit_booking(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare r text;
begin
  if coalesce(trim(p->>'name'), '') = '' or coalesce(p->>'email', '') !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then raise exception 'Please provide your name and a valid email address.'; end if;
  if (p->>'preferred_date')::date <= current_date then raise exception 'Please choose a future date.'; end if;
  insert into public.bookings (user_id, name, email, phone, booking_type, mode, event_type, preferred_date, preferred_time, guests, message)
  values (auth.uid(), left(p->>'name', 200), lower(trim(p->>'email')), left(coalesce(p->>'phone', ''), 50), coalesce(p->>'booking_type', 'consultation'), coalesce(p->>'mode', 'video'),
    nullif(p->>'event_type', ''), (p->>'preferred_date')::date, coalesce(p->>'preferred_time', '10:00'), nullif(p->>'guests', '')::int, nullif(left(p->>'message', 4000), ''))
  returning reference into r;
  return jsonb_build_object('reference', r);
end $$;

grant execute on function public.place_order(jsonb), public.track_order(text, text), public.submit_quote(jsonb), public.submit_booking(jsonb) to anon, authenticated;

-- ───────────── Row Level Security ─────────────
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.quotes enable row level security;
alter table public.bookings enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.subscribers enable row level security;

-- profiles
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles for update using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- catalogue: public read of active rows, admin full control
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (is_active or public.is_admin());
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (is_active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "settings public read" on public.settings;
create policy "settings public read" on public.settings for select using (true);
drop policy if exists "settings admin write" on public.settings;
create policy "settings admin write" on public.settings for all using (public.is_admin()) with check (public.is_admin());

-- orders: customers see their own, admins see/manage all. Inserts only happen through place_order().
drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select using (user_id = auth.uid() or public.is_admin());
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders admin delete" on public.orders;
create policy "orders admin delete" on public.orders for delete using (public.is_admin());
drop policy if exists "order_items own read" on public.order_items;
create policy "order_items own read" on public.order_items for select using (public.is_admin() or exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()));
drop policy if exists "order_items admin write" on public.order_items;
create policy "order_items admin write" on public.order_items for all using (public.is_admin()) with check (public.is_admin());

-- enquiries: public may only INSERT messages; quotes/bookings are created through RPCs. Admin reads and manages.
drop policy if exists "quotes admin" on public.quotes;
create policy "quotes admin" on public.quotes for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "quotes own read" on public.quotes;
create policy "quotes own read" on public.quotes for select using (user_id = auth.uid());
drop policy if exists "bookings admin" on public.bookings;
create policy "bookings admin" on public.bookings for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "bookings own read" on public.bookings;
create policy "bookings own read" on public.bookings for select using (user_id = auth.uid());
drop policy if exists "messages public insert" on public.messages;
create policy "messages public insert" on public.messages for insert with check (status = 'new' and char_length(message) <= 4000);
drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages for all using (public.is_admin()) with check (public.is_admin());

-- reviews: anyone can submit (unapproved); only approved are public
drop policy if exists "reviews public read" on public.reviews;
create policy "reviews public read" on public.reviews for select using (approved or public.is_admin());
drop policy if exists "reviews public insert" on public.reviews;
create policy "reviews public insert" on public.reviews for insert with check (approved = false and rating between 1 and 5 and char_length(body) <= 2000);
drop policy if exists "reviews admin" on public.reviews;
create policy "reviews admin" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "subscribers public insert" on public.subscribers;
create policy "subscribers public insert" on public.subscribers for insert with check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$');
drop policy if exists "subscribers admin" on public.subscribers;
create policy "subscribers admin" on public.subscribers for all using (public.is_admin()) with check (public.is_admin());

-- ───────────── Storage: product images ─────────────
insert into storage.buckets (id, name, public) values ('product-images', 'product-images', true) on conflict (id) do nothing;
drop policy if exists "product images public read" on storage.objects;
create policy "product images public read" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "product images admin write" on storage.objects;
create policy "product images admin write" on storage.objects for insert with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete using (bucket_id = 'product-images' and public.is_admin());
