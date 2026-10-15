'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Heart, Minus, Plus, Truck, Clock, ShieldCheck } from 'lucide-react'
import { useStore } from '@/lib/store'
import { useCart } from '@/lib/cart'
import { useWishlist } from '@/lib/wishlist'
import { api } from '@/lib/db'
import { money, formatDate } from '@/lib/format'
import type { Product, Review } from '@/lib/types'
import { Field, TextArea } from '@/components/ui/fields'
import { EmptyState, SectionHead, Skeleton, Stars } from '@/components/ui/bits'
import ProductCard, { ProductImage } from './ProductCard'
import ReviewForm from '@/components/forms/ReviewForm'
import { useRouter } from 'next/navigation'

export default function ProductView({ slug }: { slug: string }) {
  const { bySlug, products, ready, settings } = useStore()
  const product = bySlug(slug)
  if (!ready && !product) return <div className="mx-auto grid max-w-[1360px] gap-10 px-5 py-14 md:grid-cols-2 lg:px-10"><Skeleton className="aspect-[0.9]" /><Skeleton className="h-96" /></div>
  if (!product) return <div className="mx-auto max-w-[1360px] px-5 py-20 lg:px-10"><EmptyState title="We couldn’t find that product" text="It may have been renamed or is no longer available." action={<Link href="/shop" className="btn-dark">Back to the shop</Link>} /></div>
  const related = products.filter((p) => p.slug !== product.slug && p.category_slug === product.category_slug).slice(0, 4)
  return <Detail key={product.slug} product={product} related={related} settings={settings} />
}

function Detail({ product, related, settings }: { product: Product; related: Product[]; settings: ReturnType<typeof useStore>['settings'] }) {
  const { add } = useCart()
  const { has, toggle } = useWishlist()
  const { categories } = useStore()
  const router = useRouter()
  const [img, setImg] = useState(0)
  const [qty, setQty] = useState(product.min_quantity)
  const [values, setValues] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [reviews, setReviews] = useState<Review[]>([])
  const soldOut = product.stock !== null && product.stock <= 0
  const maxQty = product.stock ?? 9999
  const category = categories.find((c) => c.slug === product.category_slug)
  const avg = useMemo(() => (reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0), [reviews])

  useEffect(() => { api.listReviews(product.slug, 20).then((r) => r.ok && setReviews(r.data)) }, [product.slug])

  const validate = () => {
    const err: Record<string, string> = {}
    product.personalisation_fields.forEach((f) => { if (f.required && !(values[f.key] ?? '').trim()) err[f.key] = `Please enter ${f.label.toLowerCase()}.` })
    if (qty < product.min_quantity) err.qty = `Minimum order is ${product.min_quantity}.`
    setErrors(err)
    return Object.keys(err).length === 0
  }
  const addToCart = (goCheckout = false) => {
    if (!validate()) { document.getElementById('personalise')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    add(product, qty, values)
    if (goCheckout) router.push('/cart')
  }

  const ld = { '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: product.short_description, image: product.images, offers: { '@type': 'Offer', priceCurrency: 'GBP', price: product.price, availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock' } }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="mx-auto max-w-[1360px] px-5 py-8 lg:px-10 lg:py-12">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted">
          <Link href="/" className="hover:text-gold">Home</Link><span>/</span><Link href="/shop" className="hover:text-gold">Shop</Link>
          {category && <><span>/</span><Link href={`/shop?category=${category.slug}`} className="hover:text-gold">{category.name}</Link></>}
          <span>/</span><span className="text-ink">{product.name}</span>
        </nav>
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <div className="relative aspect-[0.9] overflow-hidden bg-sand"><ProductImage src={product.images[img]} alt={product.name} priority sizes="(max-width: 768px) 100vw, 55vw" /></div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {product.images.map((src, i) => (
                  <button key={src + i} onClick={() => setImg(i)} aria-label={`Show image ${i + 1}`} aria-current={i === img} className={`relative aspect-square overflow-hidden bg-sand ring-offset-2 ${i === img ? 'ring-1 ring-gold' : 'opacity-80'}`}><ProductImage src={src} alt="" sizes="120px" /></button>
                ))}
              </div>
            )}
          </div>

          <div className="md:sticky md:top-28 md:self-start">
            {product.is_bestseller && <p className="eyebrow mb-3">Bestseller</p>}
            <h1 className="font-serif text-4xl leading-[1.02] tracking-[-0.03em] sm:text-5xl">{product.name}</h1>
            {reviews.length > 0 && <a href="#reviews" className="mt-3 flex items-center gap-2 text-xs text-muted"><Stars value={avg} /> {avg.toFixed(1)} ({reviews.length})</a>}
            <p className="mt-4 font-serif text-3xl text-gold">{product.price_is_from ? <span className="mr-1 text-base font-sans text-muted">From</span> : null}{money(product.price)}</p>
            <p className="mt-5 text-[15px] leading-7 text-muted">{product.description || product.short_description}</p>

            {product.is_personalisable && (
              <fieldset id="personalise" className="mt-8 space-y-4 border border-line bg-white/50 p-5">
                <legend className="px-2 text-[10px] uppercase tracking-[0.22em] text-gold">Make it personal</legend>
                {product.personalisation_fields.map((f) => f.type === 'textarea' ? (
                  <TextArea key={f.key} name={f.key} label={f.label} required={f.required} rows={3} maxLength={f.maxLength} placeholder={f.placeholder} value={values[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} error={errors[f.key]} hint={f.maxLength ? `${(values[f.key] ?? '').length}/${f.maxLength}` : undefined} />
                ) : (
                  <Field key={f.key} name={f.key} type={f.type} label={f.label} required={f.required} maxLength={f.maxLength} placeholder={f.placeholder} value={values[f.key] ?? ''} onChange={(e) => setValues({ ...values, [f.key]: e.target.value })} error={errors[f.key]} />
                ))}
                <p className="text-xs leading-5 text-muted">We will confirm your personalisation details with you before production begins.</p>
              </fieldset>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <div className="flex items-center border border-line bg-white/60" role="group" aria-label="Quantity">
                <button aria-label="Decrease quantity" onClick={() => setQty(Math.max(product.min_quantity, qty - (product.min_quantity > 10 ? 5 : 1)))} className="p-3.5"><Minus size={14} /></button>
                <input aria-label="Quantity" inputMode="numeric" value={qty} onChange={(e) => setQty(Math.min(maxQty, Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1)))} onBlur={() => setQty(Math.max(product.min_quantity, qty))} className="w-14 bg-transparent text-center text-sm outline-none" />
                <button aria-label="Increase quantity" onClick={() => setQty(Math.min(maxQty, qty + (product.min_quantity > 10 ? 5 : 1)))} className="p-3.5"><Plus size={14} /></button>
              </div>
              <button onClick={() => addToCart()} disabled={soldOut} className="btn-dark flex-1 sm:flex-none sm:px-10">{soldOut ? 'Sold out' : `Add to cart · ${money(product.price * qty)}`}</button>
              <button aria-label={has(product.slug) ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={has(product.slug)} onClick={() => toggle(product.slug, product.name)} className="border border-line p-3.5"><Heart size={16} strokeWidth={1.5} fill={has(product.slug) ? '#9a7644' : 'none'} className={has(product.slug) ? 'text-gold' : ''} /></button>
            </div>
            {errors.qty && <p className="err-text">{errors.qty}</p>}
            {product.min_quantity > 1 && <p className="mt-3 text-xs text-muted">Minimum order of {product.min_quantity}. Need hundreds? <Link href={`/quote?type=bulk&product=${product.slug}`} className="border-b border-gold text-gold">Request a bulk quote</Link>.</p>}
            {product.stock !== null && product.stock > 0 && product.stock <= 10 && <p className="mt-3 text-xs text-[#a3412e]">Only {product.stock} left in stock.</p>}
            <button onClick={() => addToCart(true)} disabled={soldOut} className="link-line mt-5">Add &amp; view basket</button>

            <ul className="mt-9 space-y-3 border-t border-line pt-6 text-xs text-muted">
              <li className="flex items-center gap-3"><Clock size={16} className="text-gold" /> Usually prepared in {product.lead_time_days} working days</li>
              <li className="flex items-center gap-3"><Truck size={16} className="text-gold" /> {settings.free_delivery_threshold > 0 ? `Free delivery over ${money(settings.free_delivery_threshold)}` : 'Delivery or collection available'}</li>
              <li className="flex items-center gap-3"><ShieldCheck size={16} className="text-gold" /> Presented in premium gift packaging</li>
            </ul>
          </div>
        </div>

        <section id="reviews" className="mt-20 border-t border-line pt-12">
          <SectionHead eyebrow="Reviews" title="What customers" em="say" />
          {reviews.length === 0 ? <p className="mb-6 text-sm text-muted">No reviews yet — be the first to share your experience.</p> : (
            <div className="mb-8 grid gap-6 md:grid-cols-2">
              {reviews.map((r) => (
                <article key={r.id} className="border border-line bg-white/50 p-6">
                  <Stars value={r.rating} />
                  {r.title && <h3 className="mt-3 font-serif text-xl">{r.title}</h3>}
                  <p className="mt-2 text-sm leading-6 text-muted">{r.body}</p>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-faint">{r.name} · {formatDate(r.created_at)}</p>
                </article>
              ))}
            </div>
          )}
          <ReviewForm productSlug={product.slug} />
        </section>

        {related.length > 0 && (
          <section className="mt-20">
            <SectionHead eyebrow="You may also like" title="More from" em={category?.name ?? 'the collection'} />
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </section>
        )}
      </div>
    </>
  )
}
