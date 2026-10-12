'use client'
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { api } from '@/lib/db'
import { BUDGET_RANGES, ENQUIRY_TYPES } from '@/lib/config'
import { isEmail, todayISO } from '@/lib/format'
import { Alert, Field, Honeypot, Select, Spinner, TextArea, formString, isSpam } from '@/components/ui/fields'
import { FormSuccess, type Errors } from './shared'

export default function ContactForm({ defaultType = '' }: { defaultType?: string }) {
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [serverError, setServerError] = useState('')
  const [queued, setQueued] = useState(false)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (isSpam(fd)) { setState('done'); return }
    const v = Object.fromEntries(['name', 'email', 'phone', 'enquiry_type', 'event_date', 'quantity', 'budget_range', 'message'].map((k) => [k, formString(fd, k)]))
    const err: Errors = {}
    if (!v.name) err.name = 'Please enter your name.'
    if (!isEmail(v.email)) err.email = 'Enter a valid email address.'
    if (!v.enquiry_type) err.enquiry_type = 'Choose the type of enquiry.'
    if (v.message.length < 10) err.message = 'Please tell us a little more (at least 10 characters).'
    setErrors(err)
    if (Object.keys(err).length) { (e.currentTarget.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); return }
    setServerError(''); setState('sending')
    const r = await api.submitMessage({
      name: v.name, email: v.email, phone: v.phone || undefined, enquiry_type: v.enquiry_type, event_date: v.event_date || undefined,
      quantity: v.quantity ? Number(v.quantity) : undefined, budget_range: v.budget_range || undefined, message: v.message,
    })
    if (!r.ok) { setServerError(r.error); setState('idle'); return }
    setQueued(Boolean((r.data as { queued?: boolean }).queued)); setState('done')
  }

  if (state === 'done') {
    return <FormSuccess title="Thank you — enquiry sent" queued={queued} onReset={() => setState('idle')}><p>We would love to help. You will hear from us within one working day.</p></FormSuccess>
  }

  return (
    <form onSubmit={submit} noValidate className="relative grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <Field name="name" label="Name" required autoComplete="name" error={errors.name} />
      <Field name="email" type="email" label="Email" required autoComplete="email" error={errors.email} />
      <Field name="phone" type="tel" label="Phone number" autoComplete="tel" />
      <Select name="enquiry_type" label="Type of enquiry" required defaultValue={defaultType} placeholder="Select…" options={['General question', 'Order help', ...ENQUIRY_TYPES]} error={errors.enquiry_type} />
      <Field name="event_date" type="date" label="Event date" min={todayISO()} />
      <Field name="quantity" type="number" min={1} inputMode="numeric" label="Number of items required" />
      <Select name="budget_range" label="Budget range" placeholder="Select…" options={BUDGET_RANGES} className="sm:col-span-2" />
      <TextArea name="message" label="Message" required rows={5} className="sm:col-span-2" error={errors.message} />
      {serverError && <div className="sm:col-span-2"><Alert kind="error" title="We could not send your message">{serverError}</Alert></div>}
      <div className="sm:col-span-2"><button disabled={state === 'sending'} className="btn-dark w-full sm:w-auto">{state === 'sending' ? <><Spinner /> Sending…</> : <>Send enquiry <ArrowRight size={15} /></>}</button></div>
    </form>
  )
}
