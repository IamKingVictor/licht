'use client'
import { useEffect, useState } from 'react'
import { api, resetDemoData } from '@/lib/db'
import { HAS_SUPABASE } from '@/lib/config'
import { useStore } from '@/lib/store'
import { useToast } from '@/lib/toast'
import type { SiteSettings } from '@/lib/types'
import { Alert, Field, Spinner, TextArea } from '@/components/ui/fields'
import { Loading, Panel } from '@/components/admin/ui'

export default function AdminSettings() {
  const [s, setS] = useState<SiteSettings | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const { reload } = useStore()
  const toast = useToast()

  useEffect(() => { api.admin.getSettings().then((r) => (r.ok ? setS(r.data) : setError(r.error))) }, [])
  if (!s) return <Loading loading={!error} error={error} />

  const str = (k: keyof SiteSettings) => ({ value: String(s[k] ?? ''), onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setS({ ...s, [k]: e.target.value }) })
  const num = (k: keyof SiteSettings) => ({ type: 'number' as const, min: 0, step: '0.01', value: Number(s[k] ?? 0), onChange: (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: Number(e.target.value) }) })

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    const r = await api.admin.saveSettings(s)
    setSaving(false)
    if (r.ok) { toast('Settings saved — the live site is updated.'); reload() } else toast(r.error, { kind: 'error' })
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-8">
      <Panel title="Storefront">
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <TextArea label="Announcement bar" rows={2} {...str('announcement')} className="sm:col-span-2" hint="Leave blank to hide" />
          <Field label="Currency symbol" {...str('currency')} maxLength={4} />
          <span />
          <Field label="Delivery fee" {...num('delivery_fee')} />
          <Field label="Free delivery over (0 = never)" {...num('free_delivery_threshold')} />
          <Field label="Suggest bulk quote at (items)" {...num('bulk_threshold')} />
          <TextArea label="Delivery note" rows={2} {...str('delivery_note')} className="sm:col-span-2" />
        </div>
      </Panel>
      <Panel title="Contact & social">
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label="Email" type="email" {...str('contact_email')} />
          <Field label="Phone" {...str('contact_phone')} />
          <Field label="WhatsApp number" {...str('whatsapp_number')} hint="International format, e.g. +447000000000. Blank hides the button." />
          <Field label="Instagram handle" {...str('instagram_handle')} />
          <Field label="Facebook URL" {...str('facebook_url')} />
          <Field label="TikTok URL" {...str('tiktok_url')} />
          <Field label="Location" {...str('location')} />
          <Field label="Opening hours" {...str('opening_hours')} />
        </div>
      </Panel>
      <Panel title="Payments">
        <div className="grid gap-5 p-5 sm:grid-cols-2">
          <Field label="Account name" {...str('bank_account_name')} />
          <Field label="Bank" {...str('bank_name')} />
          <Field label="Sort code" {...str('bank_sort_code')} />
          <Field label="Account number" {...str('bank_account_number')} />
          <TextArea label="Bank transfer instructions" rows={2} {...str('payment_instructions')} className="sm:col-span-2" />
          <TextArea label="Card payment note" rows={2} {...str('card_payment_note')} className="sm:col-span-2" />
        </div>
      </Panel>
      <button disabled={saving} className="btn-dark">{saving ? <><Spinner /> Saving…</> : 'Save settings'}</button>

      {!HAS_SUPABASE && (
        <Panel title="Demo data">
          <div className="space-y-3 p-5"><Alert kind="info">Demo mode stores everything in this browser. Connect Supabase (see README) to receive real data.</Alert>
            <button type="button" className="btn-line btn-sm" onClick={() => { if (confirm('Reset all demo data (products, orders, enquiries)?')) { resetDemoData(); location.reload() } }}>Reset demo data</button></div>
        </Panel>
      )}
    </form>
  )
}
