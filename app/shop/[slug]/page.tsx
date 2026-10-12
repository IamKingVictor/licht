import type { Metadata } from 'next'
import ProductView from '@/components/shop/ProductView'
import { seedProducts } from '@/lib/seed'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return seedProducts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = seedProducts.find((x) => x.slug === slug)
  if (!p) return { title: 'Product' }
  return { title: p.name, description: p.short_description, openGraph: { images: [p.images[0]] } }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params
  return <ProductView slug={slug} />
}
