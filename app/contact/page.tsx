import type { Metadata } from 'next'
import { PageHero } from '@/components/ui/bits'
import ContactForm from '@/components/forms/ContactForm'
import ContactDetails from '@/components/site/ContactDetails'

export const metadata: Metadata = { title: 'Contact us', description: 'Have a question or planning a special event? Get in touch with LICHT SIGNATURE SOUVENIRS.' }

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact us" title="Let’s create" em="something memorable" text="Have a question or planning a special event? We would love to hear from you." crumbs={[{ label: 'Contact us' }]} />
      <div className="mx-auto grid max-w-[1180px] gap-14 px-5 py-14 lg:grid-cols-[1.5fr_1fr] lg:px-10 lg:py-20">
        <ContactForm />
        <div><h2 className="mb-5 font-serif text-3xl">Contact details</h2><ContactDetails /></div>
      </div>
    </>
  )
}
