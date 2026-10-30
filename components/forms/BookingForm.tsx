'use client'
import { useState } from 'react'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { api } from '@/lib/db'
import { BOOKING_MODES, BOOKING_TYPES, ENQUIRY_TYPES, TIME_SLOTS } from '@/lib/config'
import { isEmail, isPhone } from '@/lib/format'
import { Alert, Field, Honeypot, Select, Spinner, TextArea, formString, isSpam } from '@/components/ui/fields'
import { FormSuccess, type Errors } from './shared'

const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10) }

export default function BookingForm() {
  const [type, setType] = useState(BOOKING_TYPES[0].value)
  const [errors, setErrors] = useState<Errors>({})
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle')
  const [serverError, setServerError] = useState('')
  const [result, setResult] = useState<{ reference: string; queued?: boolean; date: string; time: string } | null>(null)

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (isSpam(fd)) { setState('done'); setResult({ reference: 'BK-0000', date: '', time: '' }); return }
    const v = Object.fromEntries(['name', 'email', 'phone', 'mode', 'event_type', 'preferred_date', 'preferred_time', 'guests', 'message'].map((k) => [k, formString(fd, k)]))
    const err: Errors = {}
    if (!v.name) err.name = 'Please enter your name.'
    if (!isEmail(v.email)) err.email = 'Enter a valid email address.'
    if (!isPhone(v.phone)) err.phone = 'Enter a phone or WhatsApp number we can reach you on.'
    if (!v.preferred_date) err.preferred_date = 'Choose your preferred date.'
    else if (v.preferred_date < tomorrow()) err.preferred_date = 'Bookings open from tomorrow onwards.'
    else if (new Date(v.preferred_date).getDay() === 0) err.preferred_date = 'We are closed on Sundays — please choose another day.'
    if (!v.preferred_time) err.preferred_time = 'Choose a time.'
    setErrors(err)
    if (Object.keys(err).length) { (e.currentTarget.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); return }
    setServerError(''); setState('sending')
    const r = await api.submitBooking({
      name: v.name, email: v.email, phone: v.phone, booking_type: type, mode: v.mode || 'video', event_type: v.event_type || undefined,
      preferred_date: v.preferred_date, preferred_time: v.preferred_time, guests: v.guests ? Number(v.guests) : undefined, message: v.message || undefined,
    })
    if (!r.ok) { setServerError(r.error); setState('idle'); return }
    setResult({ ...r.data, date: v.preferred_date, time: v.preferred_time }); setState('done')
  }

  if (state === 'done' && result) {
    return (
      <FormSuccess title="Booking request received" reference={result.reference} queued={result.queued} onReset={() => { setState('idle'); setResult(null) }} whatsappText={`Hello, I requested a booking (${result.reference}).`}>
        <p>{result.date && <>You asked for <strong>{new Date(result.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</strong> at <strong>{result.time}</strong>. </>}We will confirm your slot by email or WhatsApp shortly — nothing is final until you hear from us.</p>
      </FormSuccess>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="relative space-y-8">
      <Honeypot />
      <fieldset>
        <legend className="lbl">What would you like to book?</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {BOOKING_TYPES.map((b) => (
            <label key={b.value} className={`cursor-pointer border p-4 ${type === b.value ? 'border-gold bg-white' : 'border-line bg-white/40'}`}>
              <input type="radio" name="booking_type" value={b.value} checked={type === b.value} onChange={() => setType(b.value)} className="sr-only" />
              <span className="block font-serif text-xl">{b.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted">{b.text}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field name="preferred_date" type="date" label="Preferred date" required min={tomorrow()} error={errors.preferred_date} />
        <Select name="preferred_time" label="Preferred time" required placeholder="Select a time…" options={TIME_SLOTS} error={errors.preferred_time} />
        <Select name="mode" label="How would you like to meet?" defaultValue="video" options={BOOKING_MODES} />
        <Select name="event_type" label="Occasion" placeholder="Select…" options={ENQUIRY_TYPES} />
        <Field name="guests" type="number" min={1} inputMode="numeric" label="Approx. number of guests / gifts" placeholder="Optional" />
        <span className="hidden sm:block" />
        <Field name="name" label="Full name" required autoComplete="name" error={errors.name} />
        <Field name="email" type="email" label="Email" required autoComplete="email" error={errors.email} />
        <Field name="phone" type="tel" label="Phone / WhatsApp" required autoComplete="tel" error={errors.phone} className="sm:col-span-2" />
        <TextArea name="message" label="What would you like to discuss?" className="sm:col-span-2" placeholder="Theme, colours, ideas, deadlines…" />
      </div>
      <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted"><span className="flex items-center gap-2"><Calendar size={14} className="text-forest" />Monday – Saturday</span><span className="flex items-center gap-2"><Clock size={14} className="text-forest" />Sessions last about 30 minutes</span></p>
      {serverError && <Alert kind="error" title="We could not send your booking">{serverError}</Alert>}
      <button disabled={state === 'sending'} className="btn-dark w-full sm:w-auto">{state === 'sending' ? <><Spinner /> Sending…</> : <>Request booking <ArrowRight size={15} /></>}</button>
    </form>
  )
}
