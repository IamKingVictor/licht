-- ============================================================================
-- Saved cart + wishlist for signed-in customers.
-- Run once in: Supabase Dashboard → SQL Editor → New query. Safe to re-run.
-- ============================================================================

create table if not exists public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  line_key text not null,
  product_slug text not null,
  quantity int not null check (quantity between 1 and 10000),
  personalisation jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, line_key)
);

create table if not exists public.wishlist_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_slug)
);

alter table public.cart_items enable row level security;
alter table public.wishlist_items enable row level security;

drop policy if exists "cart own" on public.cart_items;
create policy "cart own" on public.cart_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "wishlist own" on public.wishlist_items;
create policy "wishlist own" on public.wishlist_items for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
