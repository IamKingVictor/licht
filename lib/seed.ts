import type { Category, Product, Review, SiteSettings, PersonaliseField } from './types'

const IMG = {
  hero: '/images/hero-gift-boxes.jpg',
  signature: '/images/signature-box.jpg',
  wedding: '/images/wedding-souvenirs.jpg',
  boxesWide: '/images/products/gift-boxes-wide.jpg',
  boxesTissue: '/images/products/gift-boxes-tissue.jpg',
  sigOpen: '/images/products/signature-open.jpg',
  sigDetail: '/images/products/signature-detail.jpg',
  wedCluster: '/images/products/wedding-cluster.jpg',
  wedCard: '/images/products/wedding-card.jpg',
}

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

export const seedCategories: Category[] = [
  { id: 'cat-wedding', slug: 'wedding-souvenirs', name: 'Wedding Souvenirs', description: 'Beautiful keepsakes designed to make your wedding celebration unforgettable.', image_url: IMG.wedding, sort_order: 1, is_active: true },
  { id: 'cat-birthday', slug: 'birthday-gifts', name: 'Birthday Gifts', description: 'Thoughtful gifts for birthdays and milestone celebrations.', image_url: IMG.boxesWide, sort_order: 2, is_active: true },
  { id: 'cat-corporate', slug: 'corporate-gifts', name: 'Corporate Gifts', description: 'Elegant and professional gifts for clients, employees and business partners.', image_url: IMG.sigOpen, sort_order: 3, is_active: true },
  { id: 'cat-personalised', slug: 'personalised-gifts', name: 'Personalised Gifts', description: 'Make your gift truly special with names, dates, messages and customised designs.', image_url: IMG.signature, sort_order: 4, is_active: true },
  { id: 'cat-boxes', slug: 'gift-boxes', name: 'Gift Boxes', description: 'Beautifully curated gift boxes designed for every occasion.', image_url: IMG.hero, sort_order: 5, is_active: true },
]

const nameField: PersonaliseField = { key: 'name', label: 'Name or initials', type: 'text', required: true, maxLength: 30, placeholder: 'e.g. Amara & Tunde' }
const dateField: PersonaliseField = { key: 'date', label: 'Date', type: 'date' }
const msgField: PersonaliseField = { key: 'message', label: 'Special message', type: 'textarea', maxLength: 120, placeholder: 'A short message for the card (optional)' }
const logoField: PersonaliseField = { key: 'logo_note', label: 'Logo / branding details', type: 'textarea', maxLength: 200, placeholder: 'Describe your logo or send it to us after ordering' }

let n = 0
function p(x: Partial<Product> & Pick<Product, 'slug' | 'name' | 'short_description' | 'price' | 'category_slug' | 'images'>): Product {
  n += 1
  return {
    id: `prod-${x.slug}`,
    description: '',
    price_is_from: false,
    occasions: [],
    is_personalisable: false,
    personalisation_fields: [],
    min_quantity: 1,
    stock: null,
    lead_time_days: 5,
    is_bestseller: false,
    is_featured: false,
    is_active: true,
    sort_order: n,
    created_at: new Date(Date.UTC(2026, 8, 1, 9, n)).toISOString(),
    ...x,
  }
}

export const seedProducts: Product[] = [
  p({
    slug: 'the-signature-box', name: 'The Signature Box', price: 58, category_slug: 'gift-boxes',
    short_description: 'A refined edit of beautiful little luxuries.',
    description: 'Our house gift box: a rigid black presentation box lined with ivory tissue and filled with a premium selection of carefully chosen keepsakes, finished with a satin ribbon and a gold-foiled card. Ready to give the moment it arrives.',
    images: [IMG.signature, IMG.sigOpen, IMG.sigDetail], occasions: ['birthdays', 'anniversaries', 'weddings'],
    is_personalisable: true, personalisation_fields: [nameField, msgField], is_bestseller: true, is_featured: true, lead_time_days: 4,
  }),
  p({
    slug: 'wedding-favour-set', name: 'Wedding Favour Set', price: 4.5, price_is_from: true, category_slug: 'wedding-souvenirs',
    short_description: 'Elegant keepsakes for your guests to treasure.',
    description: 'Ivory favour boxes tied with a champagne ribbon and a gold wax seal, finished with a name or "with love" card. Price shown is per favour for orders of 20+; personalised tags and bespoke ribbon colours available.',
    images: [IMG.wedding, IMG.wedCluster, IMG.wedCard], occasions: ['weddings', 'anniversaries'], min_quantity: 20,
    is_personalisable: true, personalisation_fields: [{ ...nameField, label: 'Couple names', placeholder: 'e.g. Amara & Tunde' }, dateField, msgField],
    is_bestseller: true, is_featured: true, lead_time_days: 14,
  }),
  p({
    slug: 'the-celebration-box', name: 'The Celebration Box', price: 48, category_slug: 'birthday-gifts',
    short_description: 'A beautiful way to mark their special day.',
    description: 'A champagne-ivory gift box with a satin bow, filled with a curated set of treats and keepsakes for birthdays and milestone moments. Add a name and message to make it theirs.',
    images: [IMG.hero, IMG.boxesWide, IMG.boxesTissue], occasions: ['birthdays', 'graduations'],
    is_personalisable: true, personalisation_fields: [nameField, msgField], is_bestseller: true, is_featured: true,
  }),
  p({
    slug: 'the-wedding-box', name: 'The Wedding Box', price: 72, category_slug: 'gift-boxes',
    short_description: 'Elegant gifts for couples, bridesmaids and groomsmen.',
    description: 'A luxury keepsake box for the people who matter most on your wedding day. Choose names and a date, and we will present it with gold detailing and a handwritten-style card.',
    images: [IMG.boxesWide, IMG.wedCard, IMG.hero], occasions: ['weddings'],
    is_personalisable: true, personalisation_fields: [nameField, dateField, msgField], is_bestseller: true, lead_time_days: 7,
  }),
  p({
    slug: 'the-corporate-box', name: 'The Corporate Box', price: 65, category_slug: 'corporate-gifts',
    short_description: 'Premium gifting for clients and business partners.',
    description: 'A polished presentation box designed to make a lasting impression. Add your logo and a personal note. Volume pricing is available — request a quote for 20+ boxes.',
    images: [IMG.sigOpen, IMG.signature, IMG.sigDetail], occasions: ['corporate'],
    is_personalisable: true, personalisation_fields: [{ ...nameField, label: 'Recipient or company name', required: false }, logoField, msgField], is_bestseller: true, lead_time_days: 10,
  }),
  p({
    slug: 'the-luxury-box', name: 'The Luxury Box', price: 120, category_slug: 'gift-boxes',
    short_description: 'Our premium gifting experience.',
    description: 'The very best of LICHT SIGNATURE: an oversized rigid box, layered tissue, hand-tied ribbon and our most indulgent selection of keepsakes. For the gift that is remembered.',
    images: [IMG.sigOpen, IMG.hero, IMG.signature], occasions: ['weddings', 'anniversaries', 'corporate'],
    is_personalisable: true, personalisation_fields: [nameField, msgField], is_bestseller: true, is_featured: true, lead_time_days: 7,
  }),
  p({
    slug: 'personalised-luxury-gift-box', name: 'Personalised Luxury Gift Box', price: 62, price_is_from: true, category_slug: 'personalised-gifts',
    short_description: 'Elegant gift box customised with a name or special message.',
    description: 'Start with our luxury box and make it entirely yours: names, initials, dates, a message and a gold-foil monogram. Every detail is approved with you before we begin.',
    images: [IMG.signature, IMG.sigDetail, IMG.sigOpen], occasions: ['birthdays', 'anniversaries', 'weddings', 'baby-showers'],
    is_personalisable: true, personalisation_fields: [nameField, dateField, msgField], is_bestseller: true, is_featured: true, lead_time_days: 6,
  }),
  p({
    slug: 'guest-favour-gift-box', name: 'Guest Favour Gift Box', price: 6.9, category_slug: 'wedding-souvenirs',
    short_description: 'Individually boxed guest gifts with a name tag.',
    description: 'Small, beautifully presented gift boxes with a personalised tag for each guest — perfect for place settings. Minimum order of 20.',
    images: [IMG.wedCluster, IMG.wedding, IMG.wedCard], occasions: ['weddings', 'christenings'], min_quantity: 20,
    is_personalisable: true, personalisation_fields: [{ ...nameField, label: 'Tag wording', placeholder: 'e.g. Thank you for celebrating with us' }, dateField],
    is_bestseller: true, lead_time_days: 14,
  }),
  p({
    slug: 'birthday-keepsake-box', name: 'Birthday Keepsake Box', price: 42, category_slug: 'birthday-gifts',
    short_description: 'A keepsake box for children, teens and adults.',
    description: 'A gift box with room for little treasures — add a name, age and message and we will dress it for the occasion.',
    images: [IMG.boxesTissue, IMG.hero, IMG.boxesWide], occasions: ['birthdays'],
    is_personalisable: true, personalisation_fields: [nameField, { key: 'age', label: 'Age / milestone', type: 'text', maxLength: 10 }, msgField],
  }),
  p({
    slug: 'anniversary-memory-set', name: 'Anniversary Memory Set', price: 54, category_slug: 'personalised-gifts',
    short_description: 'A beautiful keepsake for couples and loved ones.',
    description: 'A gold-foiled keepsake presented in an ivory box, personalised with names and the date you celebrate.',
    images: [IMG.wedCard, IMG.wedCluster, IMG.signature], occasions: ['anniversaries'],
    is_personalisable: true, personalisation_fields: [{ ...nameField, label: 'Names' }, dateField, msgField],
  }),
  p({
    slug: 'christening-keepsake-set', name: 'Christening Keepsake Set', price: 36, category_slug: 'personalised-gifts',
    short_description: 'Elegant keepsakes for a meaningful occasion.',
    description: 'A soft ivory keepsake set to commemorate a christening or dedication — personalised with the child’s name and date.',
    images: [IMG.wedding, IMG.wedCard, IMG.boxesTissue], occasions: ['christenings', 'baby-showers'],
    is_personalisable: true, personalisation_fields: [{ ...nameField, label: "Child's name" }, dateField, msgField],
  }),
  p({
    slug: 'staff-appreciation-gift', name: 'Staff Appreciation Gift', price: 28, category_slug: 'corporate-gifts',
    short_description: 'A considered thank-you for your team.',
    description: 'A neat presentation box with a premium selection and a personalised thank-you card. Minimum order of 10; ask us about branding.',
    images: [IMG.sigDetail, IMG.sigOpen, IMG.signature], occasions: ['corporate'], min_quantity: 10,
    is_personalisable: true, personalisation_fields: [{ ...nameField, label: 'Company name' }, logoField, msgField], lead_time_days: 10,
  }),
]

export const seedReviews: Review[] = [
  { id: 'rev-1', product_slug: null, name: 'Wedding client', rating: 5, title: null, label: 'Wedding client', body: 'The souvenirs were absolutely beautiful and our guests loved them. Everything was packaged perfectly.', approved: true, created_at: '2026-09-02T10:00:00Z' },
  { id: 'rev-2', product_slug: 'personalised-luxury-gift-box', name: 'Customer', rating: 5, title: null, label: 'Customer', body: 'The personalised gift box was even more beautiful than I expected.', approved: true, created_at: '2026-09-12T10:00:00Z' },
  { id: 'rev-3', product_slug: null, name: 'Corporate client', rating: 5, title: null, label: 'Corporate client', body: 'Our clients were genuinely impressed. The branding and presentation were flawless, and delivery was right on schedule.', approved: true, created_at: '2026-09-20T10:00:00Z' },
]
