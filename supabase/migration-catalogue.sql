-- ============================================================================
-- LICHT catalogue update: the 15 products from the Foshan HKBM "Final" purchase list,
-- priced in US dollars at 2x the supplier (EXW) price, plus the multi-currency settings.
-- Run in: Supabase Dashboard > SQL Editor > New query. Run the steps IN ORDER.
-- Safe to re-run: existing rows are left alone.
-- ============================================================================

-- STEP 1 - Currency settings (US$ is the stored currency; customers can view USD, GBP or Espees).
-- Rates are editable later in Admin > Site settings. The delivery fee and free-delivery
-- threshold are now in US$: 9 and 100 are placeholders, so set the figures you want.
update public.settings
set value = value || jsonb_build_object(
  'currency', '$',
  'usd_to_gbp', 0.746,
  'usd_to_ngn', 1330,
  'espees_ngn', 2050,
  'delivery_fee', 9,
  'free_delivery_threshold', 100,
  'announcement', 'Thoughtfully made for your moments'
)
where key = 'site';

-- STEP 2 - New categories.
insert into public.categories (slug, name, description, image_url, sort_order, is_active) values
  ('home-appliances', 'Home Appliances', 'Useful appliances and gadgets for the home.', null, 1, true),
  ('tech-accessories', 'Phone & Tech Accessories', 'Speakers, power banks, chargers and phone accessories.', null, 2, true),
  ('gifts-lifestyle', 'Gifts & Lifestyle', 'Fun, giftable pieces for kids, travel and everyday life.', null, 3, true)
on conflict (slug) do nothing;
-- (The category photos are added in Admin > Products > Categories. Until then the cards show a green background.)

-- STEP 3 - Products, added as DRAFTS (is_active = false) so nothing appears in the shop until it has photos.
-- Selling price = supplier cost x multiplier. Change `mult` below if you want a different markup.
-- Supplier cost is used here only and is NOT stored in the database, so customers can never see it.
with m as (select 2.0::numeric as mult),
cost(slug, name, short_description, description, cost_usd, category_slug, occasions, is_bestseller, is_featured, sort_order) as (values
  ('portable-speaker-3-inch', 'Portable Speaker (3-inch)', 'Compact portable speaker in black.', 'A compact 3-inch portable speaker in black with a carry handle. A practical gift for music lovers, travel and everyday listening.', 11.70, 'tech-accessories', array['birthdays','special']::text[], true, true, 1),
  ('handheld-steam-iron-cream', 'Handheld Steam Iron (Cream)', 'Handheld steam iron in cream.', 'A handheld steam iron in cream, sized to store easily at home or pack for travel. Dimensions: 28 x 11 x 11.5 cm.', 12.10, 'home-appliances', array['birthdays']::text[], true, true, 2),
  ('aroma-diffuser-wood', 'Aroma Diffuser (Wood Finish)', 'Aroma diffuser with a wood-effect base.', 'An aroma diffuser with a wood-effect finish that suits bedrooms, living rooms and offices. Dimensions: 11.6 x 11.6 x 10.2 cm.', 3.90, 'home-appliances', array['birthdays','anniversaries']::text[], true, false, 3),
  ('phone-holder-grey', 'Phone Holder (Grey)', 'Slim, portable phone holder in grey.', 'A slim, portable phone holder in grey. Dimensions: 19 x 6 x 2.5 cm.', 3.60, 'tech-accessories', array['corporate']::text[], false, false, 4),
  ('slim-power-bank-black', 'Slim Power Bank (Black)', 'Slim power bank in black.', 'A slim power bank in black for charging on the go. Dimensions: 6.7 x 10.5 x 1 cm.', 12.80, 'tech-accessories', array['corporate','birthdays']::text[], true, true, 5),
  ('portable-cleaner-black', 'Portable Cleaner (Black)', 'Portable cleaning machine in black.', 'A portable cleaning machine in black for household use.', 80.00, 'home-appliances', array[]::text[], false, false, 6),
  ('kettle-2-5l-red', 'Kettle 2.5L (Red)', '2.5-litre kettle in red.', 'A 2.5-litre kettle in red with a polished finish.', 15.00, 'home-appliances', array['birthdays']::text[], true, false, 7),
  ('glass-cleaner-grey', 'Glass Cleaner (Grey)', 'Glass cleaner in grey.', 'A glass cleaner in grey. Dimensions: 23 x 23 x 10 cm.', 77.80, 'home-appliances', array['corporate']::text[], false, false, 8),
  ('car-charger-black', 'Car Charger (Black)', 'Car charger in black.', 'A car charger in black for keeping your phone powered on the road. Dimensions: 9 x 7 x 4 cm.', 6.90, 'tech-accessories', array['corporate']::text[], true, false, 9),
  ('mag-power-bank-black', 'Mag Power Bank (Black)', 'Compact magnetic power bank in black.', 'A compact "Mag" power bank in black. Dimensions: 9.5 x 6.4 x 1.4 cm.', 3.90, 'tech-accessories', array['corporate','birthdays']::text[], false, false, 10),
  ('lint-remover-black', 'Lint Remover (Black)', 'Lint remover in black.', 'A lint remover in black for refreshing clothes, throws and upholstery. Dimensions: 7 x 7 x 14.5 cm.', 2.50, 'home-appliances', array['birthdays']::text[], false, false, 11),
  ('diamond-flask', 'Diamond Flask', 'Flask with a sparkling diamond finish and chain.', 'A flask with a sparkling diamond finish and a carry chain, available in assorted colours. Dimensions: 8 x 8 x 14.5 cm.', 5.90, 'gifts-lifestyle', array['birthdays','anniversaries']::text[], false, true, 12),
  ('diamond-mini-fan', 'Diamond Mini Fan', 'Compact fan with a diamond finish.', 'A compact fan with a sparkling diamond finish, available in assorted colours. Dimensions: 3.8 x 4.4 x 9.8 cm.', 4.90, 'gifts-lifestyle', array['birthdays']::text[], false, false, 13),
  ('handheld-gimbal-camera', 'Handheld Gimbal Camera', 'Handheld gimbal camera with accessories.', 'A handheld gimbal camera supplied with accessories, available in assorted colours.', 50.00, 'tech-accessories', array['corporate','special']::text[], true, true, 14),
  ('kids-backpack', 'Kids'' Backpack', 'Kids'' backpack with fun badges.', 'A kids'' backpack with fun badges, available in assorted colours. Dimensions: 34 x 25 x 20 cm.', 4.90, 'gifts-lifestyle', array['birthdays']::text[], true, false, 15)
)
insert into public.products (slug, name, short_description, description, price, price_is_from, category_slug, images, occasions,
  is_personalisable, personalisation_fields, min_quantity, stock, lead_time_days, is_bestseller, is_featured, is_active, sort_order)
select c.slug, c.name, c.short_description, c.description, round(c.cost_usd * m.mult, 2), false, c.category_slug, array[]::text[], c.occasions,
  false, '[]'::jsonb, 1, 100, 3, c.is_bestseller, c.is_featured, false, c.sort_order
from cost c, m
on conflict (slug) do nothing;

-- STEP 4 (optional) - Hide the old sample catalogue. This is reversible: nothing is deleted.
update public.products set is_active = false where slug in ('decorative-mirror', 'marble-shelf', 'luxe-velvet-vanity-chair', 'led-vanity-mirror', 'advanced-robot-vacuum-cleaner', 'automatic-paper-towel-dispenser', 'wireless-soap-dispenser', 'portable-uv-phone-sanitizer', 'customizable-smart-light-bulbs', 'foldable-towel-warmer', 'towel-warmer-with-3d-fireplace', 'pura-4-smart-fragrance-diffuser', 'automatic-bagging-trash-can');
update public.categories set is_active = false where slug in ('wedding-souvenirs','birthday-gifts','corporate-gifts','personalised-gifts','gift-boxes');

-- STEP 4b (optional, permanent) - Delete the old sample catalogue instead of hiding it. Remove the leading -- to run.
-- delete from public.products where slug in ('decorative-mirror', 'marble-shelf', 'luxe-velvet-vanity-chair', 'led-vanity-mirror', 'advanced-robot-vacuum-cleaner', 'automatic-paper-towel-dispenser', 'wireless-soap-dispenser', 'portable-uv-phone-sanitizer', 'customizable-smart-light-bulbs', 'foldable-towel-warmer', 'towel-warmer-with-3d-fireplace', 'pura-4-smart-fragrance-diffuser', 'automatic-bagging-trash-can');
-- delete from public.categories where slug in ('wedding-souvenirs','birthday-gifts','corporate-gifts','personalised-gifts','gift-boxes');

-- STEP 5 (needed only if you delete the old image files) - Point the starter homepage slides at images that stay in the code.
update public.hero_slides set image_url = '/images/occasions/special.jpg' where image_url like '%led-vanity-mirror%';
update public.hero_slides set image_url = '/images/occasions/anniversaries.jpg' where image_url like '%customizable-smart-light-bulbs%';
update public.hero_slides set image_url = '/images/occasions/corporate.jpg' where image_url like '%portable-uv-phone-sanitizer%';
update public.hero_slides set image_url = '/images/occasions/birthdays.jpg' where image_url like '%signature-open%';

-- STEP 6 - After you have uploaded photos in Admin > Products, publish. You can publish one product at a time
-- in the admin, or all 15 at once by running this:
-- update public.products set is_active = true where slug in ('portable-speaker-3-inch', 'handheld-steam-iron-cream', 'aroma-diffuser-wood', 'phone-holder-grey', 'slim-power-bank-black', 'portable-cleaner-black', 'kettle-2-5l-red', 'glass-cleaner-grey', 'car-charger-black', 'mag-power-bank-black', 'lint-remover-black', 'diamond-flask', 'diamond-mini-fan', 'handheld-gimbal-camera', 'kids-backpack');
