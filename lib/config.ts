export const SITE = {
  name: 'LICHT SIGNATURE SOUVENIRS',
  short: 'LICHT',
  tagline: 'Memorable Moments. Beautifully Preserved.',
  description:
    "Premium souvenirs, personalised gifts and beautifully curated gift boxes for life's special moments — weddings, birthdays, corporate events and more.",
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
}

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
/** When Supabase env vars are missing the whole site runs in demo mode on browser storage. */
export const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || ''

export const NAV_LINKS = [
  { href: '/shop', label: 'Shop' },
  { href: '/about', label: 'About us' },
  { href: '/events', label: 'Events & occasions' },
  { href: '/personalised-gifts', label: 'Personalised gifts' },
  { href: '/corporate-gifts', label: 'Corporate gifts' },
  { href: '/gift-boxes', label: 'Gift boxes' },
]

export const ENQUIRY_TYPES = [
  'Wedding souvenirs',
  'Birthday gifts',
  'Anniversary',
  'Baby shower',
  'Christening / religious celebration',
  'Graduation',
  'Corporate gifts',
  'Custom gift boxes',
  'Other event',
]

export const BUDGET_RANGES = ['Under £250', '£250 – £500', '£500 – £1,000', '£1,000 – £2,500', '£2,500 – £5,000', '£5,000+', 'Not sure yet']

export const BOOKING_TYPES = [
  { value: 'consultation', label: 'Gifting consultation', text: 'Plan your souvenirs, packaging and personalisation with our team.' },
  { value: 'sample', label: 'Sample & packaging viewing', text: 'See and handle our products and presentation before you order.' },
  { value: 'event', label: 'Event planning session', text: 'For weddings, launches and large celebrations of 100+ guests.' },
]

export const BOOKING_MODES = [
  { value: 'video', label: 'Video call' },
  { value: 'phone', label: 'Phone call' },
  { value: 'in_person', label: 'In person' },
]

export const TIME_SLOTS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']

export const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled'] as const
