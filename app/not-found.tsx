import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 font-serif text-5xl">This page has <em className="font-light text-gold">wandered off.</em></h1>
      <p className="lead mt-5">The page you are looking for may have moved or no longer exists.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/" className="btn-dark">Back home</Link><Link href="/shop" className="btn-line">Shop the collection</Link></div>
    </section>
  )
}
