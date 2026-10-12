'use client'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { api } from '@/lib/db'
import { BUDGET_RANGES, ENQUIRY_TYPES } from '@/lib/config'
import { isEmail, isPhone, todayISO } from '@/lib/format'
import { Alert, Field, Honeypot, Select, Spinner, TextArea, formString, isSpam } from '@/components/ui/fields'
import { FormSuccess, type Errors } from './shared'

export default function QuoteForm({ defaultType = '', defaultMessage = '' }: { defaultType?: string; defaultMessage?: string }) {
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [serverError, setServerError] = useState('')
  const [result, setResult] = useState<{ reference: string; queued?: boolean } | null>(null)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (isSpam(fd)) { setState('done'); setResult({ reference: 'QT-0000' }); return }
    const v = Object.fromEntries(['name', 'email', 'phone', 'company', 'enquiry_type', 'event_date', 'quantity', 'budget_range', 'products_of_interest', 'message'].map((k) => [k, formString(fd, k)]))
    const err: Errors = {}
    if (!v.name) err.name = 'Please enter your name.'
    if (!isEmail(v.email)) err.email = 'Enter a valid email address.'
    if (!isPhone(v.phone)) err.phone = 'Enter a phone or WhatsApp number we can reach you on.'
    if (!v.enquiry_type) err.enquiry_type = 'Choose the type of quote you need.'
    if (!v.quantity || Number(v.quantity) < 1) err.quantity = 'Tell us roughly how many items you need.'
    if (v.event_date && v.event_date < todayISO()) err.event_date = 'Choose a date in the future.'
    setErrors(err)
    if (Object.keys(err).length) { (e.currentTarget.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); return }
    setServerError(''); setState('sending')
    const r = await api.submitQuote({
      name: v.name, email: v.email, phone: v.phone, company: v.company, enquiry_type: v.enquiry_type, event_date: v.event_date || undefined,
      quantity: Number(v.quantity), budget_range: v.budget_range || undefined, products_of_interest: v.products_of_interest || undefined, message: v.message || undefined,
    })
    if (!r.ok) { setServerError(r.error); setState('idle'); return }
    setResult(r.data); setState('done')
  }

  if (state === 'done' && result) {
    return (
      <FormSuccess title="Quote request received" reference={result.reference} queued={result.queued} onReset={() => { setState('idle'); setResult(null) }} whatsappText={`Hello, I just requested a quote (${result.reference}).`}>
        <p>Thank you — our team will review your requirements and reply with a tailored quotation, usually within one working day.</p>
      </FormSuccess>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <Field name="name" label="Full name" required autoComplete="name" error={errors.name} />
      <Field name="company" label="Company / organisation" autoComplete="organization" hint="For corporate orders" />
      <Field name="email" type="email" label="Email" required autoComplete="email" error={errors.email} />
      <Field name="phone" type="tel" label="Phone / WhatsApp" required autoComplete="tel" error={errors.phone} />
      <Select name="enquiry_type" label="Type of quote" required defaultValue={defaultType} placeholder="Select…" options={ENQUIRY_TYPES} error={errors.enquiry_type} />
      <Field name="event_date" type="date" label="Event date" min={todayISO()} error={errors.event_date} hint="Leave blank if not fixed yet" />
      <Field name="quantity" type="number" inputMode="numeric" min={1} label="Number of items required" required placeholder="e.g. 100" error={errors.quantity} />
      <Select name="budget_range" label="Budget range" placeholder="Select…" options={BUDGET_RANGES} />
      <TextArea name="products_of_interest" label="Products or style you have in mind" rows={3} className="sm:col-span-2" placeholder="e.g. favour boxes with gold seal, name tags, custom ribbon colour" />
      <TextArea name="message" label="Anything else we should know?" defaultValue={defaultMessage} className="sm:col-span-2" placeholder="Branding, packaging, delivery location, timelines…" />
      {serverError && <div className="sm:col-span-2"><Alert kind="error" title="We could not send your request">{serverError}</Alert></div>}
      <div className="sm:col-span-2">
        <button disabled={state === 'sending'} className="btn-dark w-full sm:w-auto">{state === 'sending' ? <><Spinner /> Sending…</> : <>Request a quote <ArrowRight size={15} /></>}</button>
      </div>
    </form>
  )
}
