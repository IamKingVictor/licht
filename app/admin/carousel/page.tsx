'use client'
import { useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/db'
import { useAdminList } from '@/lib/useAdminList'
import { useToast } from '@/lib/toast'
import type { HeroSlide } from '@/lib/types'
import { Drawer, Loading, Panel, Toolbar } from '@/components/admin/ui'
import { Alert, Field, Spinner, TextArea } from '@/components/ui/fields'
import { ProductImage } from '@/components/shop/ProductCard'
import { SLIDE_MS } from '@/components/home/HeroCarousel'

const blank = (order: number): HeroSlide => ({ id: '', eyebrow: '', title: '', title_em: '', body: '', image_url: null, cta_label: '', cta_href: '', cta2_label: '', cta2_href: '', sort_order: order, is_active: true })
const goodHref = (h: string) => !h.trim() || /^(\/|#|https?:\/\/)/.test(h.trim())

export default function AdminCarousel() {
  const slides = useAdminList<HeroSlide>('hero_slides')
  const toast = useToast()
  const [edit, setEdit] = useState<HeroSlide | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const file = useRef<HTMLInputElement>(null)
  const missingTable = /hero_slides|schema cache|does not exist/i.test(slides.error)

  const upload = async (files: FileList | null) => {
    if (!files?.length || !edit) return
    setUploading(true)
    const r = await api.admin.uploadImage(files[0])
    setUploading(false)
    if (file.current) file.current.value = ''
    if (r.ok) setEdit((e) => (e ? { ...e, image_url: r.data } : e)); else toast(r.error, { kind: 'error' })
  }

  const save = async () => {
    if (!edit) return
    if (!edit.title.trim()) return toast('Enter the slide heading.', { kind: 'error' })
    if (!goodHref(edit.cta_href) || !goodHref(edit.cta2_href)) return toast('Button links must start with / (a page on your site), # or https://', { kind: 'error' })
    if ((edit.cta_label.trim() && !edit.cta_href.trim()) || (edit.cta2_label.trim() && !edit.cta2_href.trim())) return toast('A button with a label needs a link.', { kind: 'error' })
    setSaving(true)
    const row: Partial<HeroSlide> = { ...edit, title: edit.title.trim(), title_em: edit.title_em.trim(), eyebrow: edit.eyebrow.trim(), body: edit.body.trim(), cta_label: edit.cta_label.trim(), cta_href: edit.cta_href.trim(), cta2_label: edit.cta2_label.trim(), cta2_href: edit.cta2_href.trim() }
    if (!row.id) delete row.id
    const r = await api.admin.upsert('hero_slides', row as HeroSlide)
    setSaving(false)
    if (!r.ok) return toast(r.error, { kind: 'error' })
    toast('Slide saved.'); setEdit(null); slides.reload()
  }

  const move = async (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= slides.rows.length) return
    const next = [...slides.rows]; [next[i], next[j]] = [next[j], next[i]]
    const changed = next.map((s, n) => ({ s, order: n + 1 })).filter(({ s, order }) => s.sort_order !== order)
    const results = await Promise.all(changed.map(({ s, order }) => api.admin.update('hero_slides', s.id, { sort_order: order })))
    const bad = results.find((r) => !r.ok)
    if (bad && !bad.ok) toast(bad.error, { kind: 'error' }); else toast('Order updated.')
    slides.reload()
  }

  return (
    <div>
      <p className="mb-5 max-w-2xl text-sm text-muted">These are the slides on your homepage. Each one shows for {SLIDE_MS / 1000} seconds, in the order below. Hidden slides are kept but not shown to customers.</p>
      {missingTable && <div className="mb-5"><Alert kind="error" title="The carousel table is missing">Run <code>supabase/migration-hero-slides.sql</code> in the Supabase SQL Editor, then refresh this page.</Alert></div>}
      <Toolbar>
        <button onClick={() => setEdit(blank(slides.rows.length + 1))} className="btn-dark btn-sm"><Plus size={14} /> Add slide</button>
      </Toolbar>
      <Panel>
        {slides.loading || slides.error || !slides.rows.length ? <Loading loading={slides.loading} error={missingTable ? '' : slides.error} empty="No slides yet. The homepage shows its default slides until you add one." onRetry={slides.reload} /> : (
          <ul className="divide-y divide-line">
            {slides.rows.map((s, i) => (
              <li key={s.id} className="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-sand"><ProductImage src={s.image_url} alt="" sizes="112px" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif text-lg leading-tight">{s.title} <span className="text-rose">{s.title_em}</span></p>
                  <p className="mt-1 truncate text-xs text-muted">{s.eyebrow || 'No label'} · {s.cta_label ? `Button: ${s.cta_label}` : 'No button'}</p>
                  <span className={`mt-2 inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${s.is_active ? 'bg-[#dcebd3] text-[#3a5a26]' : 'bg-nude text-ink'}`}>{s.is_active ? 'Visible' : 'Hidden'}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button aria-label="Move up" title="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="btn-line btn-sm !px-3"><ArrowUp size={14} /></button>
                  <button aria-label="Move down" title="Move down" disabled={i === slides.rows.length - 1} onClick={() => move(i, 1)} className="btn-line btn-sm !px-3"><ArrowDown size={14} /></button>
                  <button aria-label={s.is_active ? 'Hide slide' : 'Show slide'} title={s.is_active ? 'Hide' : 'Show'} onClick={() => slides.update(s.id, { is_active: !s.is_active }, s.is_active ? 'Slide hidden.' : 'Slide visible.')} className="btn-line btn-sm !px-3">{s.is_active ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                  <button aria-label="Edit slide" title="Edit" onClick={() => setEdit(s)} className="btn-line btn-sm !px-3"><Pencil size={14} /></button>
                  <button aria-label="Delete slide" title="Delete" onClick={() => confirm('Delete this slide?') && slides.remove(s.id)} className="btn-line btn-sm !px-3"><Trash2 size={14} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Drawer open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit slide' : 'New slide'} wide>
        {edit && (
          <div className="space-y-5">
            <div>
              <span className="lbl">Slide image</span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative h-32 w-44 overflow-hidden rounded-2xl bg-sand"><ProductImage src={edit.image_url} alt="" sizes="176px" /></div>
                <div>
                  <input ref={file} type="file" accept="image/*" className="sr-only" aria-label="Upload slide image" onChange={(e) => upload(e.target.files)} />
                  <button type="button" onClick={() => file.current?.click()} disabled={uploading} className="btn-line btn-sm">{uploading ? <Spinner /> : <ImagePlus size={14} />} {edit.image_url ? 'Replace image' : 'Upload image'}</button>
                  <p className="mt-2 max-w-xs text-xs text-muted">Wide or square photos work best (at least 1000 px). Keep the main subject near the centre.</p>
                </div>
              </div>
            </div>
            <Field label="Small label above the heading" value={edit.eyebrow} onChange={(e) => setEdit({ ...edit, eyebrow: e.target.value })} placeholder="e.g. Corporate gifting" />
            <Field label="Heading" required value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="e.g. Make every client" />
            <Field label="Heading, second line (shown in colour)" value={edit.title_em} onChange={(e) => setEdit({ ...edit, title_em: e.target.value })} placeholder="e.g. feel remembered." />
            <TextArea label="Short text" rows={3} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Main button text" value={edit.cta_label} onChange={(e) => setEdit({ ...edit, cta_label: e.target.value })} placeholder="Shop now" />
              <Field label="Main button link" value={edit.cta_href} onChange={(e) => setEdit({ ...edit, cta_href: e.target.value })} placeholder="/shop" hint="A page like /shop, or a full https:// link" />
              <Field label="Second link text" value={edit.cta2_label} onChange={(e) => setEdit({ ...edit, cta2_label: e.target.value })} placeholder="Request a quote" />
              <Field label="Second link" value={edit.cta2_href} onChange={(e) => setEdit({ ...edit, cta2_href: e.target.value })} placeholder="/quote" />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={edit.is_active} onChange={(e) => setEdit({ ...edit, is_active: e.target.checked })} className="accent-[#c2557a]" /> Show this slide on the homepage</label>
            <button onClick={save} disabled={saving || uploading} className="btn-dark">{saving ? 'Saving…' : 'Save slide'}</button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
