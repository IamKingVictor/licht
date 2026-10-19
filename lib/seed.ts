import type { Category, HeroSlide, Product, Review, SiteSettings, PersonaliseField } from './types'

/** Bump this when the sample catalogue changes so demo-mode browsers pick up the new products. */
export const SEED_VERSION = '2'

const IMG = (slug: string) => `/images/products/${slug}.jpg`

export const seedSettings: SiteSettings = {
  store_name: 'LICHT SIGNATURE SOUVENIRS',
  announcement: 'Complimentary delivery on orders over £75 · Thoughtfully made for your moments',
  currency: '£',
  delivery_fee: 6.95,
  free_delivery_threshold: 75,
  delivery_note: 'Standard delivery takes 2–4 working days after your order is prepared. Personalised and bulk orders are confirmed with you individually.',
  contact_email: 'hello@lichtsignature.com',
  contact_phone: '+44 7000 000000',
  whatsapp_number: '+44 7000 000000',
  instagram_handle: '@lichtsignature',
  facebook_url: 'https://facebook.com/',
  tiktok_url: 'https://tiktok.com/',
  location: 'United Kingdom — visits by appointment',
  opening_hours: 'Mon–Fri 9:00–17:00 · Sat by appointment',
  bank_account_name: 'LICHT SIGNATURE SOUVENIRS',
  bank_name: 'Your Bank',
  bank_sort_code: '00-00-00',
  bank_account_number: '00000000',
  payment_instructions: 'Please use your order number as the payment reference. Your order is prepared once payment is confirmed.',
  card_payment_note: "We'll email you a secure card payment link shortly after your order is received.",
  bulk_threshold: 20,
}

/** Demo-mode slides, and the fallback shown when no slides have been created yet. */
export const seedSlides: HeroSlide[] = [
  { id: 'slide-1', eyebrow: 'Premium gifting, thoughtfully made', title: 'Memorable moments.', title_em: 'Beautifully preserved.', body: "From elegant event souvenirs to personalised gifts, we help you celebrate life's special moments with gifts worth remembering.", image_url: IMG('led-vanity-mirror'), cta_label: 'Shop now', cta_href: '/shop', cta2_label: 'Explore collection', cta2_href: '#collections', sort_order: 1, is_active: true },
  { id: 'slide-2', eyebrow: 'Personalised gifts', title: 'Gifts that carry', title_em: 'their name.', body: 'Add a name, a date or a heartfelt message. We make each piece unmistakably theirs.', image_url: IMG('customizable-smart-light-bulbs'), cta_label: 'Personalise a gift', cta_href: '/personalised-gifts', cta2_label: 'Browse all gifts', cta2_href: '/shop', sort_order: 2, is_active: true },
  { id: 'slide-3', eyebrow: 'Corporate gifting', title: 'Make every client', title_em: 'feel remembered.', body: 'Elegant gifts for clients, teams and partners, with bulk pricing and branded presentation.', image_url: IMG('portable-uv-phone-sanitizer'), cta_label: 'Corporate gifts', cta_href: '/corporate-gifts', cta2_label: 'Request a quote', cta2_href: '/quote', sort_order: 3, is_active: true },
  { id: 'slide-4', eyebrow: 'Souvenirs & keepsakes', title: 'Bring a piece of', title_em: 'the moment home.', body: 'Curated souvenirs and gift boxes, beautifully packed and ready to give.', image_url: IMG('signature-open'), cta_label: 'Browse souvenirs', cta_href: '/shop', cta2_label: 'Plan an event', cta2_href: '/events', sort_order: 4, is_active: true },
]

export const seedCategories: Category[] = [
  { id: 'cat-wedding', slug: 'wedding-souvenirs', name: 'Wedding Souvenirs', description: 'Beautiful keepsakes designed to make your wedding celebration unforgettable.', image_url: IMG('decorative-mirror'), sort_order: 1, is_active: true },
  { id: 'cat-birthday', slug: 'birthday-gifts', name: 'Birthday Gifts', description: 'Thoughtful gifts for birthdays and milestone celebrations.', image_url: IMG('luxe-velvet-vanity-chair'), sort_order: 2, is_active: true },
  { id: 'cat-corporate', slug: 'corporate-gifts', name: 'Corporate Gifts', description: 'Elegant and professional gifts for clients, employees and business partners.', image_url: IMG('portable-uv-phone-sanitizer'), sort_order: 3, is_active: true },
  { id: 'cat-personalised', slug: 'personalised-gifts', name: 'Personalised Gifts', description: 'Make your gift truly special with names, dates, messages and customised designs.', image_url: IMG('customizable-smart-light-bulbs'), sort_order: 4, is_active: true },
  { id: 'cat-boxes', slug: 'gift-boxes', name: 'Gift Boxes', description: 'Beautifully curated gift boxes designed for every occasion.', image_url: IMG('pura-4-smart-fragrance-diffuser'), sort_order: 5, is_active: true },
]

const giftMessage: PersonaliseField = { key: 'message', label: 'Gift message', type: 'textarea', maxLength: 120, placeholder: 'A short message for the gift card (optional)' }

let n = 0
function p(x: Partial<Product> & Pick<Product, 'slug' | 'name' | 'short_description' | 'description' | 'price' | 'category_slug'>): Product {
  n += 1
  return {
    price_is_from: false,
    images: [IMG(x.slug)],
    occasions: [],
    is_personalisable: false,
    personalisation_fields: [],
    min_quantity: 1,
    stock: null,
    lead_time_days: 3,
    is_bestseller: false,
    is_featured: false,
    is_active: true,
    sort_order: n,
    created_at: new Date(Date.UTC(2026, 8, 1, 9, n)).toISOString(),
    id: `prod-${x.slug}`,
    ...x,
  }
}

export const seedProducts: Product[] = [
  p({ slug: 'decorative-mirror', name: 'Decorative Mirror', price: 129, category_slug: 'wedding-souvenirs',
    short_description: 'Ornate gold-framed oval wall mirror.',
    description: 'An oval wall mirror in an ornate, sculpted gold frame — a statement piece for a hallway, bathroom or bedroom and a gift that lasts long after the celebration.',
    occasions: ['weddings', 'anniversaries'], is_bestseller: true, is_featured: true, lead_time_days: 5 }),
  p({ slug: 'marble-shelf', name: 'Marble Shelf', price: 49, category_slug: 'wedding-souvenirs',
    short_description: 'Marble-topped wall shelf with gold brackets.',
    description: 'A wall shelf with a pale marble top and slim gold brackets. Ideal for plants, candles and keepsakes.',
    occasions: ['weddings', 'anniversaries'] }),
  p({ slug: 'luxe-velvet-vanity-chair', name: 'Luxe Velvet Vanity Chair', price: 79, category_slug: 'birthday-gifts',
    short_description: 'Blush velvet chair with gold legs.',
    description: 'A petal-backed vanity chair in soft blush velvet, set on slim gold-finish legs. A beautiful finishing touch for a dressing table or bedroom.',
    occasions: ['birthdays', 'graduations'], is_bestseller: true, is_featured: true, lead_time_days: 5 }),
  p({ slug: 'led-vanity-mirror', name: 'LED Vanity Mirror', price: 159, category_slug: 'birthday-gifts',
    short_description: 'Round backlit mirror with built-in magnifier.',
    description: 'A round wall mirror with a glowing crescent LED light and a built-in magnifying circle — a luxury bathroom or dressing-room upgrade.',
    occasions: ['birthdays', 'anniversaries'], is_bestseller: true, is_featured: true, lead_time_days: 5 }),
  p({ slug: 'advanced-robot-vacuum-cleaner', name: 'Advanced Robot Vacuum Cleaner', price: 249, category_slug: 'corporate-gifts',
    short_description: 'Robot vacuum with self-emptying dock.',
    description: 'A robot vacuum cleaner with a self-emptying base station for effortless, hands-free floor cleaning. A standout gift for executives and valued clients.',
    occasions: ['corporate'], is_bestseller: true, is_featured: true }),
  p({ slug: 'automatic-paper-towel-dispenser', name: 'Automatic Paper Towel Dispenser', price: 54.99, category_slug: 'corporate-gifts',
    short_description: 'Touch-free wall-mounted towel dispenser.',
    description: 'A wall-mounted automatic paper towel dispenser (285 × 390 mm) for clean, touch-free hand drying in offices, restaurants and washrooms.',
    occasions: ['corporate'] }),
  p({ slug: 'wireless-soap-dispenser', name: 'Wireless Soap Dispenser', price: 24.99, category_slug: 'corporate-gifts',
    short_description: 'Touch-free foaming soap dispenser.',
    description: 'A sleek, wireless automatic soap dispenser that keeps hands clean without touching a pump — suited to the home, the office and healthcare spaces.',
    occasions: ['corporate'] }),
  p({ slug: 'portable-uv-phone-sanitizer', name: 'Portable UV Phone Sanitizer', price: 59, category_slug: 'corporate-gifts',
    short_description: 'Sanitises and charges your phone.',
    description: 'A compact UV sanitising case that cleans your phone while it charges, with a lifetime bulb warranty. A practical, premium gift for clients and staff.',
    occasions: ['corporate', 'graduations'], is_bestseller: true }),
  p({ slug: 'customizable-smart-light-bulbs', name: 'Customizable Smart Light Bulbs', price: 14.99, price_is_from: true, category_slug: 'personalised-gifts',
    short_description: 'App-controlled colour-changing smart bulbs.',
    description: 'Colour-changing smart bulbs you control from your phone, compatible with Amazon Alexa and Google Assistant. Add a gift message and we will include a card.',
    occasions: ['birthdays', 'anniversaries'], is_personalisable: true, personalisation_fields: [giftMessage], is_bestseller: true }),
  p({ slug: 'foldable-towel-warmer', name: 'Foldable Towel Warmer', price: 44.99, category_slug: 'personalised-gifts',
    short_description: 'Fold-away warmer for cosy, spa-warm towels.',
    description: 'A foldable towel warmer that stores flat when not in use — wrap your towels in warmth after a bath or shower. Add a gift message for a thoughtful finish.',
    occasions: ['birthdays', 'baby-showers'], is_personalisable: true, personalisation_fields: [giftMessage] }),
  p({ slug: 'towel-warmer-with-3d-fireplace', name: 'Towel Warmer with 3D Fireplace', price: 89, category_slug: 'personalised-gifts',
    short_description: 'Towel warmer bucket with realistic flame effect.',
    description: 'A large towel warmer bucket with a 3D flame display, digital LED display, flip-top lid, fragrance disc holder, child safety lock and removable legs. Add a gift message to make it personal.',
    occasions: ['birthdays', 'anniversaries'], is_personalisable: true, personalisation_fields: [giftMessage], is_bestseller: true, is_featured: true, lead_time_days: 5 }),
  p({ slug: 'pura-4-smart-fragrance-diffuser', name: 'Pura 4 Smart Fragrance Diffuser', price: 69, category_slug: 'gift-boxes',
    short_description: 'Wi-Fi smart diffuser for effortless home fragrance.',
    description: 'A smart fragrance diffuser you control from an app and with voice assistants, filling your space with a signature scent.',
    occasions: ['birthdays', 'anniversaries', 'weddings'], is_bestseller: true, is_featured: true }),
  p({ slug: 'automatic-bagging-trash-can', name: 'Automatic Bagging Trash Can', price: 39.99, category_slug: 'gift-boxes',
    short_description: 'Smart sensor bin that lays its own bag (7L / 9L).',
    description: 'A slim smart trash can with a motion-sensor lid and automatic bag laying, in 7L and 9L sizes. Quiet, tidy and ideal for bathrooms and small spaces.',
    occasions: ['birthdays'] }),
]

export const seedReviews: Review[] = [
  { id: 'rev-1', product_slug: null, name: 'Wedding client', rating: 5, title: null, label: 'Wedding client', body: 'The gifts were absolutely beautiful and our guests loved them. Everything was packaged perfectly.', approved: true, created_at: '2026-09-02T10:00:00Z' },
  { id: 'rev-2', product_slug: null, name: 'Customer', rating: 5, title: null, label: 'Customer', body: 'It was even more beautiful than I expected.', approved: true, created_at: '2026-09-12T10:00:00Z' },
  { id: 'rev-3', product_slug: null, name: 'Corporate client', rating: 5, title: null, label: 'Corporate client', body: 'Our clients were genuinely impressed. The presentation was flawless, and delivery was right on schedule.', approved: true, created_at: '2026-09-20T10:00:00Z' },
]
