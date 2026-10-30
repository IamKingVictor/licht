-- Sample catalogue for LICHT SIGNATURE SOUVENIRS. Run AFTER schema.sql (optional).
-- Image paths point at files shipped in /public/images/products; replace via Admin → Products.

insert into public.categories (slug,name,description,image_url,sort_order,is_active) values
('wedding-souvenirs','Wedding Souvenirs','Beautiful keepsakes designed to make your wedding celebration unforgettable.','/images/products/decorative-mirror.jpg',1,true),
('birthday-gifts','Birthday Gifts','Thoughtful gifts for birthdays and milestone celebrations.','/images/products/luxe-velvet-vanity-chair.jpg',2,true),
('corporate-gifts','Corporate Gifts','Elegant and professional gifts for clients, employees and business partners.','/images/products/portable-uv-phone-sanitizer.jpg',3,true),
('personalised-gifts','Personalised Gifts','Make your gift truly special with names, dates, messages and customised designs.','/images/products/customizable-smart-light-bulbs.jpg',4,true),
('gift-boxes','Gift Boxes','Beautifully curated gift boxes designed for every occasion.','/images/products/pura-4-smart-fragrance-diffuser.jpg',5,true)
on conflict (slug) do nothing;

insert into public.products (slug,name,short_description,description,price,price_is_from,category_slug,images,occasions,is_personalisable,personalisation_fields,min_quantity,stock,lead_time_days,is_bestseller,is_featured,is_active,sort_order) values
('decorative-mirror','Decorative Mirror','Ornate gold-framed oval wall mirror.','An oval wall mirror in an ornate, sculpted gold frame — a statement piece for a hallway, bathroom or bedroom and a gift that lasts long after the celebration.',129,false,'wedding-souvenirs',array['/images/products/decorative-mirror.jpg']::text[],array['weddings','anniversaries']::text[],false,'[]'::jsonb,1,null,5,true,true,true,1),
('marble-shelf','Marble Shelf','Marble-topped wall shelf with gold brackets.','A wall shelf with a pale marble top and slim gold brackets. Ideal for plants, candles and keepsakes.',49,false,'wedding-souvenirs',array['/images/products/marble-shelf.jpg']::text[],array['weddings','anniversaries']::text[],false,'[]'::jsonb,1,null,3,false,false,true,2),
('luxe-velvet-vanity-chair','Luxe Velvet Vanity Chair','Blush velvet chair with gold legs.','A petal-backed vanity chair in soft blush velvet, set on slim gold-finish legs. A beautiful finishing touch for a dressing table or bedroom.',79,false,'birthday-gifts',array['/images/products/luxe-velvet-vanity-chair.jpg']::text[],array['birthdays','graduations']::text[],false,'[]'::jsonb,1,null,5,true,true,true,3),
('led-vanity-mirror','LED Vanity Mirror','Round backlit mirror with built-in magnifier.','A round wall mirror with a glowing crescent LED light and a built-in magnifying circle — a luxury bathroom or dressing-room upgrade.',159,false,'birthday-gifts',array['/images/products/led-vanity-mirror.jpg']::text[],array['birthdays','anniversaries']::text[],false,'[]'::jsonb,1,null,5,true,true,true,4),
('advanced-robot-vacuum-cleaner','Advanced Robot Vacuum Cleaner','Robot vacuum with self-emptying dock.','A robot vacuum cleaner with a self-emptying base station for effortless, hands-free floor cleaning. A standout gift for executives and valued clients.',249,false,'corporate-gifts',array['/images/products/advanced-robot-vacuum-cleaner.jpg']::text[],array['corporate']::text[],false,'[]'::jsonb,1,null,3,true,true,true,5),
('automatic-paper-towel-dispenser','Automatic Paper Towel Dispenser','Touch-free wall-mounted towel dispenser.','A wall-mounted automatic paper towel dispenser (285 × 390 mm) for clean, touch-free hand drying in offices, restaurants and washrooms.',54.99,false,'corporate-gifts',array['/images/products/automatic-paper-towel-dispenser.jpg']::text[],array['corporate']::text[],false,'[]'::jsonb,1,null,3,false,false,true,6),
('wireless-soap-dispenser','Wireless Soap Dispenser','Touch-free foaming soap dispenser.','A sleek, wireless automatic soap dispenser that keeps hands clean without touching a pump — suited to the home, the office and healthcare spaces.',24.99,false,'corporate-gifts',array['/images/products/wireless-soap-dispenser.jpg']::text[],array['corporate']::text[],false,'[]'::jsonb,1,null,3,false,false,true,7),
('portable-uv-phone-sanitizer','Portable UV Phone Sanitizer','Sanitises and charges your phone.','A compact UV sanitising case that cleans your phone while it charges, with a lifetime bulb warranty. A practical, premium gift for clients and staff.',59,false,'corporate-gifts',array['/images/products/portable-uv-phone-sanitizer.jpg']::text[],array['corporate','graduations']::text[],false,'[]'::jsonb,1,null,3,true,false,true,8),
('customizable-smart-light-bulbs','Customizable Smart Light Bulbs','App-controlled colour-changing smart bulbs.','Colour-changing smart bulbs you control from your phone, compatible with Amazon Alexa and Google Assistant. Add a gift message and we will include a card.',14.99,true,'personalised-gifts',array['/images/products/customizable-smart-light-bulbs.jpg']::text[],array['birthdays','anniversaries']::text[],true,'[{"key":"message","label":"Gift message","type":"textarea","maxLength":120,"placeholder":"A short message for the gift card (optional)"}]'::jsonb,1,null,3,true,false,true,9),
('foldable-towel-warmer','Foldable Towel Warmer','Fold-away warmer for cosy, spa-warm towels.','A foldable towel warmer that stores flat when not in use — wrap your towels in warmth after a bath or shower. Add a gift message for a thoughtful finish.',44.99,false,'personalised-gifts',array['/images/products/foldable-towel-warmer.jpg']::text[],array['birthdays','baby-showers']::text[],true,'[{"key":"message","label":"Gift message","type":"textarea","maxLength":120,"placeholder":"A short message for the gift card (optional)"}]'::jsonb,1,null,3,false,false,true,10),
('towel-warmer-with-3d-fireplace','Towel Warmer with 3D Fireplace','Towel warmer bucket with realistic flame effect.','A large towel warmer bucket with a 3D flame display, digital LED display, flip-top lid, fragrance disc holder, child safety lock and removable legs. Add a gift message to make it personal.',89,false,'personalised-gifts',array['/images/products/towel-warmer-with-3d-fireplace.jpg']::text[],array['birthdays','anniversaries']::text[],true,'[{"key":"message","label":"Gift message","type":"textarea","maxLength":120,"placeholder":"A short message for the gift card (optional)"}]'::jsonb,1,null,5,true,true,true,11),
('pura-4-smart-fragrance-diffuser','Pura 4 Smart Fragrance Diffuser','Wi-Fi smart diffuser for effortless home fragrance.','A smart fragrance diffuser you control from an app and with voice assistants, filling your space with a signature scent.',69,false,'gift-boxes',array['/images/products/pura-4-smart-fragrance-diffuser.jpg']::text[],array['birthdays','anniversaries','weddings']::text[],false,'[]'::jsonb,1,null,3,true,true,true,12),
('automatic-bagging-trash-can','Automatic Bagging Trash Can','Smart sensor bin that lays its own bag (7L / 9L).','A slim smart trash can with a motion-sensor lid and automatic bag laying, in 7L and 9L sizes. Quiet, tidy and ideal for bathrooms and small spaces.',39.99,false,'gift-boxes',array['/images/products/automatic-bagging-trash-can.jpg']::text[],array['birthdays']::text[],false,'[]'::jsonb,1,null,3,false,false,true,13)
on conflict (slug) do nothing;

insert into public.settings (key,value) values ('site', '{
  "store_name": "LICHT SIGNATURE SOUVENIRS",
  "announcement": "Complimentary delivery on orders over £75 · Thoughtfully made for your moments",
  "currency": "£",
  "delivery_fee": 6.95,
  "free_delivery_threshold": 75,
  "delivery_note": "Standard delivery takes 2–4 working days after your order is prepared. Personalised and bulk orders are confirmed with you individually.",
  "contact_email": "info@lichtsignaturesouvenirs.store",
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
