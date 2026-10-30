'use client'
import { useMemo, useState, type ReactNode } from 'react'
import { Mail, MessageCircle, Search, Trash2 } from 'lucide-react'
import { useAdminList } from '@/lib/useAdminList'
import type { AdminTable } from '@/lib/db'
import { digits, formatDateTime, humanise, whatsappLink } from '@/lib/format'
import { Drawer, Loading, Panel, Pill, Toolbar, td, th } from './ui'
import { Select, TextArea } from '@/components/ui/fields'

interface Rec { id: string; status: string; name: string; email: string; phone?: string | null; admin_notes?: string | null; created_at: string; reference?: string }

export default function RecordsPage<T extends Rec>({ table, statuses, columns, details, extra, whatsappText, subject, noNotes }: {
  table: AdminTable; statuses: string[]; columns: { label: string; render: (r: T) => ReactNode }[]
  details: (r: T) => [string, ReactNode][]; extra?: (r: T, update: (patch: Record<string, unknown>) => void) => ReactNode
  whatsappText: (r: T) => string; subject: (r: T) => string; noNotes?: boolean
}) {
  const { rows, loading, error, reload, update, remove } = useAdminList<T>(table)
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const open = rows.find((r) => r.id === openId) ?? null
  const list = useMemo(() => rows.filter((r) => (!status || r.status === status) && (!q || `${r.name} ${r.email} ${r.reference ?? ''}`.toLowerCase().includes(q.toLowerCase()))), [rows, status, q])

  const show = (r: T) => { setOpenId(r.id); setNotes(r.admin_notes ?? ''); if (table === 'messages' && r.status === 'new') update(r.id, { status: 'read' }, 'Marked as read.') }

  return (
    <div>
      <Toolbar>
        <div className="flex min-w-[220px] flex-1 items-center gap-2 border border-line bg-white/60 px-4 py-3"><Search size={15} className="text-forest" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or reference" aria-label="Search" className="w-full bg-transparent text-sm outline-none" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="field !w-auto"><option value="">All statuses</option>{statuses.map((s) => <option key={s} value={s}>{humanise(s)}</option>)}</select>
        <button onClick={reload} className="btn-line btn-sm">Refresh</button>
      </Toolbar>
      <Panel>
        {loading || error || !list.length ? <Loading loading={loading} error={error} empty="Nothing here yet." onRetry={reload} /> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[720px]"><thead><tr className="border-b border-line">{columns.map((c) => <th key={c.label} className={th}>{c.label}</th>)}<th className={th}>Status</th><th className={th}>Received</th><th className={th} /></tr></thead>
            <tbody className="divide-y divide-line">{list.map((r) => (
              <tr key={r.id} className="hover:bg-sand/50">{columns.map((c) => <td key={c.label} className={td}>{c.render(r)}</td>)}<td className={td}><Pill value={r.status} /></td><td className={td}>{formatDateTime(r.created_at)}</td><td className={td}><button onClick={() => show(r)} className="btn-line btn-sm !px-3">Open</button></td></tr>))}</tbody></table></div>
        )}
      </Panel>
      <Drawer open={!!open} onClose={() => setOpenId(null)} title={open ? String(open.reference ?? open.name) : ''}>
        {open && (
          <div className="space-y-6">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">{details(open).map(([k, v]) => <div key={k} className={k === 'Message' || k === 'Products of interest' ? 'sm:col-span-2' : ''}><dt className="lbl">{k}</dt><dd className="whitespace-pre-wrap break-words">{v || '—'}</dd></div>)}</dl>
            <div className="flex flex-wrap gap-3">
              <a href={`mailto:${open.email}?subject=${encodeURIComponent(subject(open))}`} className="btn-line btn-sm" onClick={() => table === 'messages' && update(open.id, { status: 'replied' }, 'Marked as replied.')}><Mail size={14} /> Reply by email</a>
              {open.phone && digits(String(open.phone)).length >= 7 && <a target="_blank" rel="noopener noreferrer" href={whatsappLink(String(open.phone), whatsappText(open))} className="btn-line btn-sm"><MessageCircle size={14} /> WhatsApp</a>}
            </div>
            <div className="space-y-4 border-t border-line pt-6">
              <Select label="Status" value={open.status} onChange={(e) => update(open.id, { status: e.target.value }, 'Status updated.')} options={statuses.map((s) => ({ value: s, label: humanise(s) }))} />
              {extra?.(open, (patch) => update(open.id, patch))}
              {!noNotes && <><TextArea label="Internal notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} /><button className="btn-dark btn-sm" onClick={() => update(open.id, { admin_notes: notes.trim() || null }, 'Notes saved.')}>Save notes</button></>}
            </div>
            <button onClick={async () => { if (confirm('Delete this record permanently?')) { await remove(open.id); setOpenId(null) } }} className="flex items-center gap-2 text-xs text-[#a3412e]"><Trash2 size={14} /> Delete record</button>
          </div>
        )}
      </Drawer>
    </div>
  )
}
