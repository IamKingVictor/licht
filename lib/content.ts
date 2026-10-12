export const OCCASIONS = [
  { id: 'weddings', title: 'Weddings', text: 'Elegant wedding souvenirs and guest gifts.', category: 'wedding-souvenirs' },
  { id: 'birthdays', title: 'Birthdays', text: 'Personalised gifts for children, teenagers and adults.', category: 'birthday-gifts' },
  { id: 'anniversaries', title: 'Anniversaries', text: 'Beautiful keepsakes for couples and loved ones.', category: 'personalised-gifts' },
  { id: 'baby-showers', title: 'Baby showers', text: 'Thoughtful gifts and souvenirs for celebrating new beginnings.', category: 'personalised-gifts' },
  { id: 'christenings', title: 'Christenings & religious celebrations', text: 'Elegant keepsakes for meaningful occasions.', category: 'personalised-gifts' },
  { id: 'graduations', title: 'Graduations', text: 'Celebrate achievements with memorable gifts.', category: 'birthday-gifts' },
  { id: 'corporate', title: 'Corporate events', text: 'Professional gifts for conferences, launches, celebrations and client appreciation.', category: 'corporate-gifts' },
  { id: 'special', title: 'Special events', text: 'We also cater for parties, celebrations and special occasions.', category: '' },
]

export const USPS = [
  { title: 'Beautifully curated', text: 'We carefully select and create products that are both beautiful and meaningful.' },
  { title: 'Personalised', text: 'Add names, dates, messages and special details to make your gift unique.' },
  { title: 'Premium presentation', text: 'We believe presentation is part of the gift.' },
  { title: 'Made for memories', text: 'Our products are designed to be remembered long after the celebration.' },
  { title: 'Professional service', text: 'From individual orders to large event requirements, a smooth and professional experience.' },
]

export const STEPS = [
  { n: '01', title: 'Choose', text: 'Browse our collections and select your preferred product.' },
  { n: '02', title: 'Personalise', text: 'Add names, dates, logos or special messages where available.' },
  { n: '03', title: 'Confirm', text: 'Review your order and approve the details.' },
  { n: '04', title: 'Receive', text: 'Your beautifully packaged order is prepared and delivered to you.' },
]

export const PERSONALISE_OPTIONS = ['Names', 'Dates', 'Initials', 'Messages', 'Logos', 'Event details', 'Special designs']
export const CORPORATE_FOR = ['Companies', 'Organisations', 'Conferences', 'Seminars', 'Staff appreciation', 'Client gifts', 'Business partners', 'Corporate celebrations', 'Promotional events', 'Corporate orders']
export const BULK_HELP = ['Product selection', 'Personalisation', 'Branding', 'Packaging', 'Bulk orders', 'Event souvenirs', 'Corporate gifts', 'Custom gift boxes']

export const BOXES = [
  { slug: 'the-signature-box', name: 'The Signature Box', text: 'A premium selection of carefully chosen gifts.' },
  { slug: 'the-celebration-box', name: 'The Celebration Box', text: 'Perfect for birthdays and special occasions.' },
  { slug: 'the-wedding-box', name: 'The Wedding Box', text: 'Elegant gifts for couples, bridesmaids, groomsmen or wedding guests.' },
  { slug: 'the-corporate-box', name: 'The Corporate Box', text: 'Premium gifting for clients and business partners.' },
  { slug: 'the-luxury-box', name: 'The Luxury Box', text: 'Our premium gifting experience.' },
]

export const FAQS = [
  { q: 'Do you offer personalised souvenirs?', a: 'Yes. Selected products can be personalised with names, dates, messages, logos and event details.' },
  { q: 'Do you accept bulk orders?', a: 'Yes. We welcome bulk orders for weddings, corporate events, parties and other occasions.' },
  { q: 'Can I order custom souvenirs?', a: 'Yes. Customers can contact us with their requirements for custom orders.' },
  { q: 'How far in advance should I order?', a: 'For personalised and bulk orders, we recommend ordering as early as possible, particularly for large events. Each product page shows its usual preparation time.' },
  { q: 'Do you deliver?', a: 'Yes. Delivery options are shown at checkout, or confirmed with you for bulk and custom orders. You can also choose to collect your order.' },
  { q: 'Do you offer corporate gifting?', a: 'Yes. We offer corporate gifting and bulk gifting solutions, including branding and custom packaging.' },
  { q: 'Can I request a quote?', a: 'Yes. Customers can submit a quote request through our Quotes & Bookings page and we will reply with a tailored quotation.' },
  { q: 'How do I pay?', a: 'At checkout choose bank transfer, a secure card payment link sent by email, or pay on collection. Your order is prepared once payment is confirmed.' },
  { q: 'Can I track my order?', a: 'Yes. Use your order number and email address on the Track order page at any time.' },
]

export const POLICIES: Record<string, { title: string; intro: string; sections: { h: string; p: string }[] }> = {
  delivery: {
    title: 'Delivery information',
    intro: 'How and when your LICHT SIGNATURE order reaches you.',
    sections: [
      { h: 'Delivery options', p: 'Choose home or event-venue delivery, or collect your order from us by appointment. Delivery charges are shown at checkout; orders over the free-delivery threshold ship free.' },
      { h: 'Preparation time', p: 'Ready-to-ship items are usually dispatched within 2–3 working days. Personalised products are made to order — the preparation time is shown on each product page and confirmed when we approve your details.' },
      { h: 'Bulk and event orders', p: 'Delivery for large orders is arranged with you individually, so that your souvenirs arrive safely and in good time for your event.' },
      { h: 'Tracking', p: 'Track any order with your order number and email on the Track order page. We will also share a tracking reference where a courier is used.' },
    ],
  },
  returns: {
    title: 'Returns & refunds',
    intro: 'We want you to love what you receive.',
    sections: [
      { h: 'Ready-made products', p: 'If something is not right, contact us within 14 days of delivery. Items must be unused and in their original packaging.' },
      { h: 'Personalised and custom items', p: 'Because personalised products are made specifically for you, they cannot be returned unless they arrive damaged or differ from the details you approved. If that happens we will remake or refund them.' },
      { h: 'Damaged or incorrect orders', p: 'Please contact us within 48 hours of delivery with your order number and a photo so that we can put it right quickly.' },
      { h: 'Refunds', p: 'Approved refunds are returned to your original payment method within 5–10 working days.' },
    ],
  },
  terms: {
    title: 'Terms & conditions',
    intro: 'The terms that apply when you order from LICHT SIGNATURE SOUVENIRS.',
    sections: [
      { h: 'Orders', p: 'An order is confirmed when we send you written confirmation. We may contact you to approve personalisation details before production begins.' },
      { h: 'Pricing and payment', p: 'Prices are shown in the store currency and include no delivery unless stated. Orders are prepared once payment has been received or agreed.' },
      { h: 'Personalisation', p: 'You are responsible for checking the spelling and accuracy of the details you submit. We will reproduce them exactly as provided.' },
      { h: 'Quotations and bookings', p: 'Quotations are valid for 14 days unless stated otherwise. Bookings are confirmed by us in writing and can be rescheduled with 24 hours’ notice.' },
      { h: 'Liability', p: 'Nothing in these terms limits your statutory rights. Our liability for any order is limited to the value of that order.' },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    intro: 'How we collect, use and protect your information.',
    sections: [
      { h: 'What we collect', p: 'Details you give us when you order, request a quote, make a booking, contact us or subscribe: name, email, phone, delivery address and order details.' },
      { h: 'How we use it', p: 'To fulfil your orders, respond to enquiries, send order updates and — only if you subscribe — send occasional gifting inspiration. We never sell your data.' },
      { h: 'Storage and security', p: 'Your data is stored securely with our database provider and is accessible only to authorised staff. Payment card details are never stored by us.' },
      { h: 'Your rights', p: 'You can ask to see, correct or delete your data, or unsubscribe at any time by contacting us.' },
      { h: 'Cookies and storage', p: 'We use local storage to remember your basket and wishlist, and optional analytics to understand how the site is used.' },
    ],
  },
}
