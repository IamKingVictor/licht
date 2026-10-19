export type Res<T> = { ok: true; data: T } | { ok: false; error: string }

export interface PersonaliseField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date'
  required?: boolean
  maxLength?: number
  placeholder?: string
}

export interface Category {
  id: string
  slug: string
  name: string
  description: string
  image_url: string | null
  sort_order: number
  is_active: boolean
}

export interface HeroSlide {
  id: string
  eyebrow: string
  title: string
  title_em: string
  body: string
  image_url: string | null
  cta_label: string
  cta_href: string
  cta2_label: string
  cta2_href: string
  sort_order: number
  is_active: boolean
  created_at?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  short_description: string
  description: string
  price: number
  price_is_from: boolean
  category_slug: string
  images: string[]
  occasions: string[]
  is_personalisable: boolean
  personalisation_fields: PersonaliseField[]
  min_quantity: number
  stock: number | null // null = made to order / not tracked
  lead_time_days: number
  is_bestseller: boolean
  is_featured: boolean
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface SiteSettings {
  store_name: string
  announcement: string
  currency: string
  delivery_fee: number
  free_delivery_threshold: number
  delivery_note: string
  contact_email: string
  contact_phone: string
  whatsapp_number: string
  instagram_handle: string
  facebook_url: string
  tiktok_url: string
  location: string
  opening_hours: string
  bank_account_name: string
  bank_name: string
  bank_sort_code: string
  bank_account_number: string
  payment_instructions: string
  card_payment_note: string
  bulk_threshold: number
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded'
export type PaymentMethod = 'bank_transfer' | 'card_link' | 'pay_on_collection'
export type DeliveryMethod = 'delivery' | 'collection'

export interface OrderItem {
  id: string
  order_id: string
  product_slug: string
  product_name: string
  image_url: string | null
  unit_price: number
  quantity: number
  line_total: number
  personalisation: Record<string, string>
}

export interface Order {
  id: string
  order_number: string
  user_id: string | null
  customer_name: string
  email: string
  phone: string
  delivery_method: DeliveryMethod
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  country: string | null
  event_date: string | null
  customer_notes: string | null
  subtotal: number
  delivery_fee: number
  total: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  status: OrderStatus
  tracking_number: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
}

export interface Quote {
  id: string
  reference: string
  name: string
  email: string
  phone: string
  company: string | null
  enquiry_type: string
  event_date: string | null
  quantity: number | null
  budget_range: string | null
  products_of_interest: string | null
  message: string | null
  status: 'new' | 'in_progress' | 'quoted' | 'accepted' | 'declined' | 'closed'
  quoted_amount: number | null
  admin_notes: string | null
  created_at: string
}

export interface Booking {
  id: string
  reference: string
  name: string
  email: string
  phone: string
  booking_type: string
  mode: string
  event_type: string | null
  preferred_date: string
  preferred_time: string
  guests: number | null
  message: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  admin_notes: string | null
  created_at: string
}

export interface Message {
  id: string
  name: string
  email: string
  phone: string | null
  enquiry_type: string
  event_date: string | null
  quantity: number | null
  budget_range: string | null
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
}

export interface Review {
  id: string
  product_slug: string | null
  name: string
  rating: number
  title: string | null
  body: string
  label: string | null
  approved: boolean
  created_at: string
}

export interface Subscriber {
  id: string
  email: string
  created_at: string
}

export interface CartLine {
  key: string
  slug: string
  quantity: number
  personalisation: Record<string, string>
}

export interface OrderInput {
  customer_name: string
  email: string
  phone: string
  delivery_method: DeliveryMethod
  address_line1?: string
  address_line2?: string
  city?: string
  postcode?: string
  country?: string
  event_date?: string
  customer_notes?: string
  payment_method: PaymentMethod
  items: { slug: string; quantity: number; personalisation: Record<string, string> }[]
}

export interface QuoteInput {
  name: string
  email: string
  phone: string
  company?: string
  enquiry_type: string
  event_date?: string
  quantity?: number
  budget_range?: string
  products_of_interest?: string
  message?: string
}

export interface BookingInput {
  name: string
  email: string
  phone: string
  booking_type: string
  mode: string
  event_type?: string
  preferred_date: string
  preferred_time: string
  guests?: number
  message?: string
}

export interface MessageInput {
  name: string
  email: string
  phone?: string
  enquiry_type: string
  event_date?: string
  quantity?: number
  budget_range?: string
  message: string
}

export interface ReviewInput {
  name: string
  rating: number
  title?: string
  body: string
  product_slug?: string
}
