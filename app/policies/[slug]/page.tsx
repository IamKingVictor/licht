import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/bits'
import { POLICIES } from '@/lib/content'

type Props = { params: Promise<{ slug: string }> }
export const dynamicParams = false
export function generateStaticParams() { return Object.keys(POLICIES).map((slug) => ({ slug })) }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return { title: POLICIES[slug]?.title ?? 'Policy' }
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const policy = POLICIES[slug]
  if (!policy) notFound()
  return (
    <>
      <PageHero eyebrow="Information" title={policy.title} text={policy.intro} crumbs={[{ label: policy.title }]} />
      <article className="mx-auto max-w-[760px] space-y-9 px-5 py-14 lg:py-20">
        {policy.sections.map((s) => (<section key={s.h}><h2 className="font-serif text-2xl">{s.h}</h2><p className="mt-2 text-[15px] leading-7 text-muted">{s.p}</p></section>))}
        <p className="border-t border-line pt-6 text-xs text-faint">Last updated October 2026. Please have this policy reviewed against your own business practices before launch.</p>
      </article>
    </>
  )
}
