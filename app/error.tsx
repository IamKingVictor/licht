'use client'
import Link from 'next/link'
import { useEffect } from 'react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <section className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-4 font-serif text-5xl">We hit a <em className="font-light text-gold">snag.</em></h1>
      <p className="lead mt-5">Please try again. If the problem continues, contact us and we will help right away.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={reset} className="btn-dark">Try again</button><Link href="/contact" className="btn-line">Contact us</Link></div>
    </section>
  )
}
