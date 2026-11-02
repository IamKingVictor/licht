import type { Category, HeroSlide, Product, Review, SiteSettings, PersonaliseField } from './types'

/** Bump this when the sample catalogue changes so demo-mode browsers pick up the new products. */
export const SEED_VERSION = '3'

export const seedSettings: SiteSettings = {
  store_name: 'LICHT SIGNATURE SOUVENIRS',
  announcement: 'Thoughtfully made for your moments',
  currency: '$',
  usd_to_gbp: 0.746,
  usd_to_ngn: 1330,
  espees_ngn: 2050,
  delivery_fee: 9,
  free_delivery_threshold: 100,
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
  { id: 'slide-1', eyebrow: 'Premium gifting, thoughtfully made', title: 'Memorable moments.', title_em: 'Beautifully preserved.', body: "From elegant event souvenirs to personalised gifts, we help you celebrate life's special moments with gifts worth remembering.", image_url: '/images/occasions/special.jpg', cta_label: 'Shop now', cta_href: '/shop', cta2_label: 'Explore collection', cta2_href: '#collections', sort_order: 1, is_active: true },
  { id: 'slide-2', eyebrow: 'Personalised gifts', title: 'Gifts that carry', title_em: 'their name.', body: 'Add a name, a date or a heartfelt message. We make each piece unmistakably theirs.', image_url: '/images/occasions/anniversaries.jpg', cta_label: 'Personalise a gift', cta_href: '/personalised-gifts', cta2_label: 'Browse all gifts', cta2_href: '/shop', sort_order: 2, is_active: true },
  { id: 'slide-3', eyebrow: 'Corporate gifting', title: 'Make every client', title_em: 'feel remembered.', body: 'Elegant gifts for clients, teams and partners, with bulk pricing and branded presentation.', image_url: '/images/occasions/corporate.jpg', cta_label: 'Corporate gifts', cta_href: '/corporate-gifts', cta2_label: 'Request a quote', cta2_href: '/quote', sort_order: 3, is_active: true },
  { id: 'slide-4', eyebrow: 'Souvenirs & keepsakes', title: 'Bring a piece of', title_em: 'the moment home.', body: 'Curated souvenirs and gift boxes, beautifully packed and ready to give.', image_url: '/images/occasions/birthdays.jpg', cta_label: 'Browse souvenirs', cta_href: '/shop', cta2_label: 'Plan an event', cta2_href: '/events', sort_order: 4, is_active: true },
]

export const seedCategories: Category[] = [
  { id: 'cat-home', slug: 'home-appliances', name: "Home Appliances", description: "Useful appliances and gadgets for the home.", image_url: null, sort_order: 1, is_active: true },
  { id: 'cat-tech', slug: 'tech-accessories', name: "Phone & Tech Accessories", description: "Speakers, power banks, chargers and phone accessories.", image_url: null, sort_order: 2, is_active: true },
  { id: 'cat-gifts', slug: 'gifts-lifestyle', name: "Gifts & Lifestyle", description: "Fun, giftable pieces for kids, travel and everyday life.", image_url: null, sort_order: 3, is_active: true },
]

const giftMessage: PersonaliseField = { key: 'message', label: 'Gift message', type: 'textarea', maxLength: 120, placeholder: 'A short message for the gift card (optional)' }

let n = 0
function p(x: Partial<Product> & Pick<Product, 'slug' | 'name' | 'short_description' | 'description' | 'price' | 'category_slug'>): Product {
  n += 1
  return {
    price_is_from: false,
    images: [],
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
  p({ slug: 'portable-speaker-3-inch', name: "Portable Speaker (3-inch)", price: 23.4, category_slug: 'tech-accessories', images: [], stock: 100,
    short_description: "Compact portable speaker in black.",
    description: "A compact 3-inch portable speaker in black with a carry handle. A practical gift for music lovers, travel and everyday listening.",
    occasions: ['birthdays', 'special'], is_bestseller: true, is_featured: true, lead_time_days: 3 }),
  p({ slug: 'handheld-steam-iron-cream', name: "Handheld Steam Iron (Cream)", price: 24.2, category_slug: 'home-appliances', images: [], stock: 100,
    short_description: "Handheld steam iron in cream.",
    description: "A handheld steam iron in cream, sized to store easily at home or pack for travel. Dimensions: 28 x 11 x 11.5 cm.",
    occasions: ['birthdays'], is_bestseller: true, is_featured: true, lead_time_days: 3 }),
  p({ slug: 'aroma-diffuser-wood', name: "Aroma Diffuser (Wood Finish)", price: 7.8, category_slug: 'home-appliances', images: [], stock: 100,
    short_description: "Aroma diffuser with a wood-effect base.",
    description: "An aroma diffuser with a wood-effect finish that suits bedrooms, living rooms and offices. Dimensions: 11.6 x 11.6 x 10.2 cm.",
    occasions: ['birthdays', 'anniversaries'], is_bestseller: true, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'phone-holder-grey', name: "Phone Holder (Grey)", price: 7.2, category_slug: 'tech-accessories', images: [], stock: 100,
    short_description: "Slim, portable phone holder in grey.",
    description: "A slim, portable phone holder in grey. Dimensions: 19 x 6 x 2.5 cm.",
    occasions: ['corporate'], is_bestseller: false, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'slim-power-bank-black', name: "Slim Power Bank (Black)", price: 25.6, category_slug: 'tech-accessories', images: [], stock: 100,
    short_description: "Slim power bank in black.",
    description: "A slim power bank in black for charging on the go. Dimensions: 6.7 x 10.5 x 1 cm.",
    occasions: ['corporate', 'birthdays'], is_bestseller: true, is_featured: true, lead_time_days: 3 }),
  p({ slug: 'portable-cleaner-black', name: "Portable Cleaner (Black)", price: 160.0, category_slug: 'home-appliances', images: [], stock: 100,
    short_description: "Portable cleaning machine in black.",
    description: "A portable cleaning machine in black for household use.",
    occasions: [], is_bestseller: false, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'kettle-2-5l-red', name: "Kettle 2.5L (Red)", price: 30.0, category_slug: 'home-appliances', images: [], stock: 100,
    short_description: "2.5-litre kettle in red.",
    description: "A 2.5-litre kettle in red with a polished finish.",
    occasions: ['birthdays'], is_bestseller: true, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'glass-cleaner-grey', name: "Glass Cleaner (Grey)", price: 155.6, category_slug: 'home-appliances', images: [], stock: 100,
    short_description: "Glass cleaner in grey.",
    description: "A glass cleaner in grey. Dimensions: 23 x 23 x 10 cm.",
    occasions: ['corporate'], is_bestseller: false, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'car-charger-black', name: "Car Charger (Black)", price: 13.8, category_slug: 'tech-accessories', images: [], stock: 100,
    short_description: "Car charger in black.",
    description: "A car charger in black for keeping your phone powered on the road. Dimensions: 9 x 7 x 4 cm.",
    occasions: ['corporate'], is_bestseller: true, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'mag-power-bank-black', name: "Mag Power Bank (Black)", price: 7.8, category_slug: 'tech-accessories', images: [], stock: 100,
    short_description: "Compact magnetic power bank in black.",
    description: "A compact \"Mag\" power bank in black. Dimensions: 9.5 x 6.4 x 1.4 cm.",
    occasions: ['corporate', 'birthdays'], is_bestseller: false, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'lint-remover-black', name: "Lint Remover (Black)", price: 5.0, category_slug: 'home-appliances', images: [], stock: 100,
    short_description: "Lint remover in black.",
    description: "A lint remover in black for refreshing clothes, throws and upholstery. Dimensions: 7 x 7 x 14.5 cm.",
    occasions: ['birthdays'], is_bestseller: false, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'diamond-flask', name: "Diamond Flask", price: 11.8, category_slug: 'gifts-lifestyle', images: [], stock: 100,
    short_description: "Flask with a sparkling diamond finish and chain.",
    description: "A flask with a sparkling diamond finish and a carry chain, available in assorted colours. Dimensions: 8 x 8 x 14.5 cm.",
    occasions: ['birthdays', 'anniversaries'], is_bestseller: false, is_featured: true, lead_time_days: 3 }),
  p({ slug: 'diamond-mini-fan', name: "Diamond Mini Fan", price: 9.8, category_slug: 'gifts-lifestyle', images: [], stock: 100,
    short_description: "Compact fan with a diamond finish.",
    description: "A compact fan with a sparkling diamond finish, available in assorted colours. Dimensions: 3.8 x 4.4 x 9.8 cm.",
    occasions: ['birthdays'], is_bestseller: false, is_featured: false, lead_time_days: 3 }),
  p({ slug: 'handheld-gimbal-camera', name: "Handheld Gimbal Camera", price: 100.0, category_slug: 'tech-accessories', images: [], stock: 100,
    short_description: "Handheld gimbal camera with accessories.",
    description: "A handheld gimbal camera supplied with accessories, available in assorted colours.",
    occasions: ['corporate', 'special'], is_bestseller: true, is_featured: true, lead_time_days: 3 }),
  p({ slug: 'kids-backpack', name: "Kids' Backpack", price: 9.8, category_slug: 'gifts-lifestyle', images: [], stock: 100,
    short_description: "Kids' backpack with fun badges.",
    description: "A kids' backpack with fun badges, available in assorted colours. Dimensions: 34 x 25 x 20 cm.",
    occasions: ['birthdays'], is_bestseller: true, is_featured: false, lead_time_days: 3 }),
]

export const seedReviews: Review[] = [
  { id: 'rev-1', product_slug: null, name: 'Wedding client', rating: 5, title: null, label: 'Wedding client', body: 'The gifts were absolutely beautiful and our guests loved them. Everything was packaged perfectly.', approved: true, created_at: '2026-09-02T10:00:00Z' },
  { id: 'rev-2', product_slug: null, name: 'Customer', rating: 5, title: null, label: 'Customer', body: 'It was even more beautiful than I expected.', approved: true, created_at: '2026-09-12T10:00:00Z' },
  { id: 'rev-3', product_slug: null, name: 'Corporate client', rating: 5, title: null, label: 'Corporate client', body: 'Our clients were genuinely impressed. The presentation was flawless, and delivery was right on schedule.', approved: true, created_at: '2026-09-20T10:00:00Z' },
]
