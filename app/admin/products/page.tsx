'use client'
import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { api } from '@/lib/db'
import { useAdminList } from '@/lib/useAdminList'
import { useToast } from '@/lib/toast'
import { money, slugify } from '@/lib/format'
import type { Category, Product } from '@/lib/types'
import { Drawer, Loading, Panel, Pill, Toolbar, td, th } from '@/components/admin/ui'
import ProductEditor, { blankProduct } from '@/components/admin/ProductEditor'
import { Field, TextArea } from '@/components/ui/fields'

export default function AdminProducts() {
  const products = useAdminList<Product>('products')
  const cats = useAdminList<Category>('categories')
  const toast = useToast()
  const [tab, setTab] = useState<'products' | 'categories'>('products')
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [cat, setCat] = useState<Category | null>(null)
  const list = useMemo(() => products.rows.filter((p) => !q || `${p.name} ${p.category_slug}`.toLowerCase().includes(q.toLowerCase())), [products.rows, q])

  const saveCategory = async () => {
    if (!cat) return
    if (!cat.name.trim()) return toast('Enter a category name.', { kind: 'error' })
    const slug = cat.slug || slugify(cat.name)
    const row = { ...cat, slug, name: cat.name.trim(), sort_order: Number(cat.sort_order) || 0 } as Partial<Category>
    if (!row.id) delete row.id
    const r = await api.admin.upsert('categories', row as Category)
    if (!r.ok) return toast(r.error, { kind: 'error' })
    toast('Category saved.'); setCat(null); cats.reload()
  }

  return (
    <div>
      <div className="mb-6 flex gap-6 border-b border-line text-[11px] uppercase tracking-[0.16em]">
        {(['products', 'categories'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 pb-3 ${tab === t ? 'border-gold text-gold' : 'border-transparent text-muted'}`}>{t}</button>)}
      </div>

      {tab === 'products' ? (
        <>
          <Toolbar>
            <div className="flex min-w-[220px] flex-1 items-center gap-2 border border-line bg-white/60 px-4 py-3"><Search size={15} className="text-gold" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" className="w-full bg-transparent text-sm outline-none" /></div>
            <button onClick={() => setEditing(blankProduct(products.rows.length + 1))} className="btn-dark btn-sm"><Plus size={14} /> Add product</button>
          </Toolbar>
          <Panel>
            {products.loading || products.error || !list.length ? <Loading loading={products.loading} error={products.error} empty="No products found." onRetry={products.reload} /> : (
              <div className="overflow-x-auto"><table className="w-full min-w-[700px]"><thead><tr className="border-b border-line"><th className={th}>Product</th><th className={th}>Category</th><th className={th}>Price</th><th className={th}>Stock</th><th className={th}>Visible</th><th className={th} /></tr></thead>
                <tbody className="divide-y divide-line">{list.map((p) => (
                  <tr key={p.id} className="hover:bg-sand/50"><td className={td}><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}{p.images[0] ? <img src={p.images[0]} alt="" className="h-12 w-10 object-cover" /> : <span className="h-12 w-10 bg-sand" />}<div><p className="font-medium">{p.name}</p><p className="text-xs text-muted">{p.is_personalisable ? 'Personalisable' : 'Standard'}{p.is_bestseller ? ' · Bestseller' : ''}</p></div></div></td>
                    <td className={td}>{p.category_slug}</td><td className={td}>{p.price_is_from ? 'From ' : ''}{money(p.price)}</td><td className={td}>{p.stock === null ? <span className="text-muted">Made to order</span> : <span className={p.stock <= 5 ? 'text-[#a3412e]' : ''}>{p.stock}</span>}</td>
                    <td className={td}><button onClick={() => products.update(p.id, { is_active: !p.is_active }, p.is_active ? 'Product hidden.' : 'Product visible.')} aria-label="Toggle visibility"><Pill value={p.is_active ? 'delivered' : 'closed'} /></button></td>
                    <td className={td}><div className="flex gap-2"><button aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)} className="btn-line btn-sm !px-3"><Pencil size={14} /></button><button aria-label={`Delete ${p.name}`} onClick={() => confirm(`Delete “${p.name}”? This cannot be undone.`) && products.remove(p.id, 'Product deleted.')} className="btn-line btn-sm !px-3"><Trash2 size={14} /></button></div></td></tr>))}</tbody></table></div>
            )}
          </Panel>
        </>
      ) : (
        <>
          <Toolbar><button onClick={() => setCat({ id: '', slug: '', name: '', description: '', image_url: null, sort_order: cats.rows.length + 1, is_active: true })} className="btn-dark btn-sm"><Plus size={14} /> Add category</button></Toolbar>
          <Panel>
            {cats.loading || cats.error || !cats.rows.length ? <Loading loading={cats.loading} error={cats.error} empty="No categories." onRetry={cats.reload} /> : (
              <table className="w-full"><thead><tr className="border-b border-line"><th className={th}>Name</th><th className={th}>Slug</th><th className={th}>Visible</th><th className={th} /></tr></thead>
                <tbody className="divide-y divide-line">{cats.rows.map((c) => (<tr key={c.id}><td className={td}>{c.name}</td><td className={td}>{c.slug}</td><td className={td}><Pill value={c.is_active ? 'delivered' : 'closed'} /></td>
                  <td className={td}><div className="flex gap-2"><button aria-label="Edit category" onClick={() => setCat(c)} className="btn-line btn-sm !px-3"><Pencil size={14} /></button><button aria-label="Delete category" onClick={() => { if (products.rows.some((p) => p.category_slug === c.slug)) toast('Move or delete this category’s products first.', { kind: 'error' }); else if (confirm(`Delete ${c.name}?`)) cats.remove(c.id) }} className="btn-line btn-sm !px-3"><Trash2 size={14} /></button></div></td></tr>))}</tbody></table>
            )}
          </Panel>
        </>
      )}

      <Drawer open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit product' : 'New product'} wide>
        {editing && <ProductEditor key={editing.id || 'new'} initial={editing} categories={cats.rows} existingSlugs={products.rows.map((p) => p.slug)} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); products.reload() }} />}
      </Drawer>
      <Drawer open={!!cat} onClose={() => setCat(null)} title={cat?.id ? 'Edit category' : 'New category'}>
        {cat && (
          <div className="space-y-5">
            <Field label="Name" required value={cat.name} onChange={(e) => setCat({ ...cat, name: e.target.value })} />
            <Field label="Slug" value={cat.slug} disabled={!!cat.id} placeholder={slugify(cat.name)} onChange={(e) => setCat({ ...cat, slug: e.target.value })} />
            <TextArea label="Description" rows={3} value={cat.description} onChange={(e) => setCat({ ...cat, description: e.target.value })} />
            <Field label="Image URL" value={cat.image_url ?? ''} onChange={(e) => setCat({ ...cat, image_url: e.target.value || null })} hint="Path or full URL; upload images via a product and copy its URL" />
            <Field label="Sort order" type="number" value={cat.sort_order} onChange={(e) => setCat({ ...cat, sort_order: Number(e.target.value) })} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={cat.is_active} onChange={(e) => setCat({ ...cat, is_active: e.target.checked })} className="accent-[#9a7644]" /> Visible</label>
            <button onClick={saveCategory} className="btn-dark">Save category</button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
