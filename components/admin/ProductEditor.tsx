'use client'
import { useRef, useState } from 'react'
import { ImagePlus, Plus, Trash2, X } from 'lucide-react'
import { api } from '@/lib/db'
import { useToast } from '@/lib/toast'
import { slugify } from '@/lib/format'
import type { Category, PersonaliseField, Product } from '@/lib/types'
import { Alert, Field, Select, Spinner, TextArea } from '@/components/ui/fields'

export const blankProduct = (sort: number): Product => ({
  id: '', slug: '', name: '', short_description: '', description: '', price: 0, price_is_from: false, category_slug: '', images: [], occasions: [],
  is_personalisable: false, personalisation_fields: [], min_quantity: 1, stock: null, lead_time_days: 5, is_bestseller: false, is_featured: false, is_active: true, sort_order: sort, created_at: new Date().toISOString(),
})

export default function ProductEditor({ initial, categories, existingSlugs, onSaved, onCancel }: { initial: Product; categories: Category[]; existingSlugs: string[]; onSaved: () => void; onCancel: () => void }) {
  const [p, setP] = useState<Product>(initial)
  const [trackStock, setTrackStock] = useState(initial.stock !== null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [url, setUrl] = useState('')
  const file = useRef<HTMLInputElement>(null)
  const toast = useToast()
  const isNew = !initial.id
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP((x) => ({ ...x, [k]: v }))

  const upload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    for (const f of Array.from(files)) {
      const r = await api.admin.uploadImage(f)
      if (r.ok) setP((x) => ({ ...x, images: [...x.images, r.data] })); else toast(r.error, { kind: 'error' })
    }
    setUploading(false)
    if (file.current) file.current.value = ''
  }
  const moveFirst = (i: number) => set('images', [p.images[i], ...p.images.filter((_, n) => n !== i)])
  const setField = (i: number, patch: Partial<PersonaliseField>) => set('personalisation_fields', p.personalisation_fields.map((f, n) => (n === i ? { ...f, ...patch } : f)))

  const save = async () => {
    const slug = slugify(p.slug || p.name)
    if (!p.name.trim()) return setError('Please enter a product name.')
    if (!slug) return setError('A URL slug is required.')
    if (isNew && existingSlugs.includes(slug)) return setError('Another product already uses this URL slug.')
    if (!(p.price >= 0)) return setError('Enter a valid price.')
    if (!p.category_slug) return setError('Choose a category.')
    setError(''); setSaving(true)
    const fields = p.personalisation_fields.filter((f) => f.label.trim()).map((f) => ({ ...f, key: slugify(f.key || f.label).replace(/-/g, '_') }))
    const row = { ...p, slug, name: p.name.trim(), personalisation_fields: p.is_personalisable ? fields : [], stock: trackStock ? Math.max(0, Number(p.stock ?? 0)) : null, min_quantity: Math.max(1, Number(p.min_quantity) || 1) } as Partial<Product>
    if (isNew) { delete row.id; delete row.created_at }
    const r = await api.admin.upsert('products', row as Product)
    setSaving(false)
    if (!r.ok) return setError(r.error)
    toast(`${row.name} saved.`)
    onSaved()
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" required value={p.name} onChange={(e) => set('name', e.target.value)} className="sm:col-span-2" />
        <Field label="URL slug" value={p.slug} onChange={(e) => set('slug', e.target.value)} placeholder={slugify(p.name) || 'auto-generated'} disabled={!isNew} hint={isNew ? 'Used in the product link' : 'Cannot be changed after creation'} />
        <Select label="Category" required value={p.category_slug} onChange={(e) => set('category_slug', e.target.value)} placeholder="Select…" options={categories.map((c) => ({ value: c.slug, label: c.name }))} />
        <Field label="Price" required type="number" min={0} step="0.01" value={p.price} onChange={(e) => set('price', Number(e.target.value))} />
        <Field label="Lead time (working days)" type="number" min={0} value={p.lead_time_days} onChange={(e) => set('lead_time_days', Number(e.target.value))} />
        <Field label="Minimum order quantity" type="number" min={1} value={p.min_quantity} onChange={(e) => set('min_quantity', Number(e.target.value))} />
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={trackStock} onChange={(e) => { setTrackStock(e.target.checked); if (e.target.checked && p.stock === null) set('stock', 10) }} className="accent-[#9a7644]" /> Track stock</label>
          {trackStock ? <Field label="Units in stock" type="number" min={0} value={p.stock ?? 0} onChange={(e) => set('stock', Number(e.target.value))} /> : <p className="text-xs text-muted">Made to order — unlimited.</p>}
        </div>
        <Field label="Short description" value={p.short_description} onChange={(e) => set('short_description', e.target.value)} className="sm:col-span-2" />
        <TextArea label="Full description" rows={5} value={p.description} onChange={(e) => set('description', e.target.value)} className="sm:col-span-2" />
        <Field label="Occasions (comma separated)" value={p.occasions.join(', ')} onChange={(e) => set('occasions', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="weddings, birthdays" className="sm:col-span-2" />
      </div>

      <div>
        <p className="lbl">Images — first image is the main photo</p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {p.images.map((src, i) => (
            <div key={src.slice(-40) + i} className="group relative aspect-square bg-sand">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button aria-label="Remove image" onClick={() => set('images', p.images.filter((_, n) => n !== i))} className="absolute right-1 top-1 bg-ink/80 p-1 text-white"><X size={12} /></button>
              {i > 0 && <button onClick={() => moveFirst(i)} className="absolute inset-x-1 bottom-1 bg-cream/90 py-1 text-[9px] uppercase tracking-wider">Make main</button>}
            </div>
          ))}
          <button type="button" onClick={() => file.current?.click()} disabled={uploading} className="flex aspect-square flex-col items-center justify-center gap-1 border border-dashed border-gold-soft text-xs text-gold">{uploading ? <Spinner /> : <ImagePlus size={20} />} Upload</button>
        </div>
        <input ref={file} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
        <div className="mt-3 flex gap-2"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="…or paste an image URL" aria-label="Image URL" className="field" /><button type="button" className="btn-line btn-sm" onClick={() => { if (/^(https?:\/\/|\/)/.test(url.trim())) { set('images', [...p.images, url.trim()]); setUrl('') } else toast('Enter a valid image URL.', { kind: 'error' }) }}>Add</button></div>
      </div>

      <div className="space-y-4 border border-line bg-white/50 p-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={p.is_personalisable} onChange={(e) => set('is_personalisable', e.target.checked)} className="accent-[#9a7644]" /> Customers can personalise this product</label>
        {p.is_personalisable && (
          <div className="space-y-3">
            {p.personalisation_fields.map((f, i) => (
              <div key={i} className="grid gap-3 border border-line bg-cream p-3 sm:grid-cols-[1.4fr_1fr_90px_auto]">
                <Field label="Field label" value={f.label} onChange={(e) => setField(i, { label: e.target.value, key: f.key || slugify(e.target.value).replace(/-/g, '_') })} />
                <Select label="Type" value={f.type} onChange={(e) => setField(i, { type: e.target.value as PersonaliseField['type'] })} options={[{ value: 'text', label: 'Short text' }, { value: 'textarea', label: 'Long text' }, { value: 'date', label: 'Date' }]} />
                <Field label="Max chars" type="number" min={0} value={f.maxLength ?? ''} onChange={(e) => setField(i, { maxLength: e.target.value ? Number(e.target.value) : undefined })} />
                <div className="flex items-end gap-3 pb-3"><label className="flex items-center gap-1.5 text-xs"><input type="checkbox" checked={!!f.required} onChange={(e) => setField(i, { required: e.target.checked })} className="accent-[#9a7644]" /> Required</label><button aria-label="Remove field" onClick={() => set('personalisation_fields', p.personalisation_fields.filter((_, n) => n !== i))}><Trash2 size={15} className="text-faint hover:text-[#a3412e]" /></button></div>
              </div>
            ))}
            <button type="button" className="btn-line btn-sm" onClick={() => set('personalisation_fields', [...p.personalisation_fields, { key: '', label: '', type: 'text' }])}><Plus size={14} /> Add field</button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_active} onChange={(e) => set('is_active', e.target.checked)} className="accent-[#9a7644]" /> Visible in shop</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_bestseller} onChange={(e) => set('is_bestseller', e.target.checked)} className="accent-[#9a7644]" /> Bestseller</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={p.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="accent-[#9a7644]" /> Featured first</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={p.price_is_from} onChange={(e) => set('price_is_from', e.target.checked)} className="accent-[#9a7644]" /> Show “From” price</label>
      </div>
      <Field label="Sort order" type="number" value={p.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} className="max-w-[160px]" />

      {error && <Alert kind="error">{error}</Alert>}
      <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-line bg-cream px-6 py-4">
        <button onClick={save} disabled={saving} className="btn-dark">{saving ? <><Spinner /> Saving…</> : isNew ? 'Create product' : 'Save changes'}</button>
        <button onClick={onCancel} className="btn-line">Cancel</button>
      </div>
    </div>
  )
}
