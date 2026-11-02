-- Sample catalogue for LICHT SIGNATURE SOUVENIRS. Run AFTER schema.sql (optional).
-- Image paths point at files shipped in /public/images/products; replace via Admin → Products.

insert into public.categories (slug,name,description,image_url,sort_order,is_active) values
('home-appliances','Home Appliances','Useful appliances and gadgets for the home.',null,1,true),
('tech-accessories','Phone & Tech Accessories','Speakers, power banks, chargers and phone accessories.',null,2,true),
('gifts-lifestyle','Gifts & Lifestyle','Fun, giftable pieces for kids, travel and everyday life.',null,3,true)
on conflict (slug) do nothing;

insert into public.products (slug,name,short_description,description,price,price_is_from,category_slug,images,occasions,is_personalisable,personalisation_fields,min_quantity,stock,lead_time_days,is_bestseller,is_featured,is_active,sort_order) values
('portable-speaker-3-inch','Portable Speaker (3-inch)','Compact portable speaker in black.','A compact 3-inch portable speaker in black with a carry handle. A practical gift for music lovers, travel and everyday listening.',23.4,false,'tech-accessories',array[]::text[],array['birthdays','special']::text[],false,'[]'::jsonb,1,100,3,true,true,true,1),
('handheld-steam-iron-cream','Handheld Steam Iron (Cream)','Handheld steam iron in cream.','A handheld steam iron in cream, sized to store easily at home or pack for travel. Dimensions: 28 x 11 x 11.5 cm.',24.2,false,'home-appliances',array[]::text[],array['birthdays']::text[],false,'[]'::jsonb,1,100,3,true,true,true,2),
('aroma-diffuser-wood','Aroma Diffuser (Wood Finish)','Aroma diffuser with a wood-effect base.','An aroma diffuser with a wood-effect finish that suits bedrooms, living rooms and offices. Dimensions: 11.6 x 11.6 x 10.2 cm.',7.8,false,'home-appliances',array[]::text[],array['birthdays','anniversaries']::text[],false,'[]'::jsonb,1,100,3,true,false,true,3),
('phone-holder-grey','Phone Holder (Grey)','Slim, portable phone holder in grey.','A slim, portable phone holder in grey. Dimensions: 19 x 6 x 2.5 cm.',7.2,false,'tech-accessories',array[]::text[],array['corporate']::text[],false,'[]'::jsonb,1,100,3,false,false,true,4),
('slim-power-bank-black','Slim Power Bank (Black)','Slim power bank in black.','A slim power bank in black for charging on the go. Dimensions: 6.7 x 10.5 x 1 cm.',25.6,false,'tech-accessories',array[]::text[],array['corporate','birthdays']::text[],false,'[]'::jsonb,1,100,3,true,true,true,5),
('portable-cleaner-black','Portable Cleaner (Black)','Portable cleaning machine in black.','A portable cleaning machine in black for household use.',160.0,false,'home-appliances',array[]::text[],array[]::text[],false,'[]'::jsonb,1,100,3,false,false,true,6),
('kettle-2-5l-red','Kettle 2.5L (Red)','2.5-litre kettle in red.','A 2.5-litre kettle in red with a polished finish.',30.0,false,'home-appliances',array[]::text[],array['birthdays']::text[],false,'[]'::jsonb,1,100,3,true,false,true,7),
('glass-cleaner-grey','Glass Cleaner (Grey)','Glass cleaner in grey.','A glass cleaner in grey. Dimensions: 23 x 23 x 10 cm.',155.6,false,'home-appliances',array[]::text[],array['corporate']::text[],false,'[]'::jsonb,1,100,3,false,false,true,8),
('car-charger-black','Car Charger (Black)','Car charger in black.','A car charger in black for keeping your phone powered on the road. Dimensions: 9 x 7 x 4 cm.',13.8,false,'tech-accessories',array[]::text[],array['corporate']::text[],false,'[]'::jsonb,1,100,3,true,false,true,9),
('mag-power-bank-black','Mag Power Bank (Black)','Compact magnetic power bank in black.','A compact "Mag" power bank in black. Dimensions: 9.5 x 6.4 x 1.4 cm.',7.8,false,'tech-accessories',array[]::text[],array['corporate','birthdays']::text[],false,'[]'::jsonb,1,100,3,false,false,true,10),
('lint-remover-black','Lint Remover (Black)','Lint remover in black.','A lint remover in black for refreshing clothes, throws and upholstery. Dimensions: 7 x 7 x 14.5 cm.',5.0,false,'home-appliances',array[]::text[],array['birthdays']::text[],false,'[]'::jsonb,1,100,3,false,false,true,11),
('diamond-flask','Diamond Flask','Flask with a sparkling diamond finish and chain.','A flask with a sparkling diamond finish and a carry chain, available in assorted colours. Dimensions: 8 x 8 x 14.5 cm.',11.8,false,'gifts-lifestyle',array[]::text[],array['birthdays','anniversaries']::text[],false,'[]'::jsonb,1,100,3,false,true,true,12),
('diamond-mini-fan','Diamond Mini Fan','Compact fan with a diamond finish.','A compact fan with a sparkling diamond finish, available in assorted colours. Dimensions: 3.8 x 4.4 x 9.8 cm.',9.8,false,'gifts-lifestyle',array[]::text[],array['birthdays']::text[],false,'[]'::jsonb,1,100,3,false,false,true,13),
('handheld-gimbal-camera','Handheld Gimbal Camera','Handheld gimbal camera with accessories.','A handheld gimbal camera supplied with accessories, available in assorted colours.',100.0,false,'tech-accessories',array[]::text[],array['corporate','special']::text[],false,'[]'::jsonb,1,100,3,true,true,true,14),
('kids-backpack','Kids'' Backpack','Kids'' backpack with fun badges.','A kids'' backpack with fun badges, available in assorted colours. Dimensions: 34 x 25 x 20 cm.',9.8,false,'gifts-lifestyle',array[]::text[],array['birthdays']::text[],false,'[]'::jsonb,1,100,3,true,false,true,15)
on conflict (slug) do nothing;

insert into public.settings (key,value) values ('site', '{
  "store_name": "LICHT SIGNATURE SOUVENIRS",
  "announcement": "Thoughtfully made for your moments",
  "currency": "$",
  "usd_to_gbp": 0.746,
  "usd_to_ngn": 1330,
  "espees_ngn": 2050,
  "delivery_fee": 9,
  "free_delivery_threshold": 100,
  "delivery_note": "Standard delivery takes 2–4 working days after your order is prepared. Personalised and bulk orders are confirmed with you individually.",
  "contact_email": "hello@lichtsignature.com",
  "contact_phone": "+44 7000 000000",
  "whatsapp_number": "+44 7000 000000",
  "instagram_handle": "@lichtsignature",
  "facebook_url": "https://facebook.com/",
  "tiktok_url": "https://tiktok.com/",
  "location": "United Kingdom — visits by appointment",
  "opening_hours": "Mon–Fri 9:00–17:00 · Sat by appointment",
  "bank_account_name": "LICHT SIGNATURE SOUVENIRS",
  "bank_name": "Your Bank",
  "bank_sort_code": "00-00-00",
  "bank_account_number": "00000000",
  "payment_instructions": "Please use your order number as the payment reference. Your order is prepared once payment is confirmed.",
  "card_payment_note": "We''ll email you a secure card payment link shortly after your order is received.",
  "bulk_threshold": 20
}'::jsonb)
on conflict (key) do nothing;

insert into public.reviews (product_slug,name,rating,body,label,approved) values
(null,'Wedding client',5,'The gifts were absolutely beautiful and our guests loved them. Everything was packaged perfectly.','Wedding client',true),
(null,'Customer',5,'It was even more beautiful than I expected.','Customer',true),
(null,'Corporate client',5,'Our clients were genuinely impressed. The presentation was flawless, and delivery was right on schedule.','Corporate client',true);
