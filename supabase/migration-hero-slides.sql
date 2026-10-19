-- ============================================================================
-- Homepage hero carousel slides (editable in Admin → Carousel).
-- Run once in: Supabase Dashboard → SQL Editor → New query. Safe to re-run.
-- ============================================================================

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  eyebrow text not null default '',
  title text not null,
  title_em text not null default '',
  body text not null default '',
  image_url text,
  cta_label text not null default '',
  cta_href text not null default '',
  cta2_label text not null default '',
  cta2_href text not null default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.hero_slides enable row level security;

-- The public sees active slides; admins see and manage all of them.
drop policy if exists "hero slides public read" on public.hero_slides;
create policy "hero slides public read" on public.hero_slides for select using (is_active or public.is_admin());
drop policy if exists "hero slides admin write" on public.hero_slides;
create policy "hero slides admin write" on public.hero_slides for all using (public.is_admin()) with check (public.is_admin());

-- Starter slides (only added when the table is empty).
insert into public.hero_slides (eyebrow, title, title_em, body, image_url, cta_label, cta_href, cta2_label, cta2_href, sort_order)
select * from (values
  ('Premium gifting, thoughtfully made', 'Memorable moments.', 'Beautifully preserved.', 'From elegant event souvenirs to personalised gifts, we help you celebrate life''s special moments with gifts worth remembering.', '/images/products/led-vanity-mirror.jpg', 'Shop now', '/shop', 'Explore collection', '#collections', 1),
  ('Personalised gifts', 'Gifts that carry', 'their name.', 'Add a name, a date or a heartfelt message. We make each piece unmistakably theirs.', '/images/products/customizable-smart-light-bulbs.jpg', 'Personalise a gift', '/personalised-gifts', 'Browse all gifts', '/shop', 2),
  ('Corporate gifting', 'Make every client', 'feel remembered.', 'Elegant gifts for clients, teams and partners, with bulk pricing and branded presentation.', '/images/products/portable-uv-phone-sanitizer.jpg', 'Corporate gifts', '/corporate-gifts', 'Request a quote', '/quote', 3),
  ('Souvenirs & keepsakes', 'Bring a piece of', 'the moment home.', 'Curated souvenirs and gift boxes, beautifully packed and ready to give.', '/images/products/signature-open.jpg', 'Browse souvenirs', '/shop', 'Plan an event', '/events', 4)
) as v(eyebrow, title, title_em, body, image_url, cta_label, cta_href, cta2_label, cta2_href, sort_order)
where not exists (select 1 from public.hero_slides);
