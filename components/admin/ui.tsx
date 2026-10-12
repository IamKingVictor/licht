'use client'
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { Alert, Spinner } from '@/components/ui/fields'
import { humanise } from '@/lib/format'

const tone: Record<string, string> = {
  pending: 'bg-[#f4e8c9] text-[#6b5314]', new: 'bg-[#f4e8c9] text-[#6b5314]', unpaid: 'bg-[#f4e8c9] text-[#6b5314]',
  confirmed: 'bg-[#dbe7f3] text-[#27496b]', in_progress: 'bg-[#dbe7f3] text-[#27496b]', processing: 'bg-[#dbe7f3] text-[#27496b]', read: 'bg-[#dbe7f3] text-[#27496b]', quoted: 'bg-[#dbe7f3] text-[#27496b]',
  ready: 'bg-[#e6dff3] text-[#4a3a6b]', shipped: 'bg-[#e6dff3] text-[#4a3a6b]',
  delivered: 'bg-[#dcebd3] text-[#3a5a26]', paid: 'bg-[#dcebd3] text-[#3a5a26]', completed: 'bg-[#dcebd3] text-[#3a5a26]', accepted: 'bg-[#dcebd3] text-[#3a5a26]', replied: 'bg-[#dcebd3] text-[#3a5a26]',
  cancelled: 'bg-[#f3d9d2] text-[#7a2f20]', declined: 'bg-[#f3d9d2] text-[#7a2f20]', refunded: 'bg-[#f3d9d2] text-[#7a2f20]',
  closed: 'bg-nude text-ink', archived: 'bg-nude text-ink',
}
export const Pill = ({ value }: { value: string }) => <span className={`inline-block whitespace-nowrap px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${tone[value] ?? 'bg-nude text-ink'}`}>{humanise(value)}</span>

export function Drawer({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', k)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = '' }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" className="absolute inset-0 bg-ink/50" onClick={onClose} />
      <div className={`absolute inset-y-0 right-0 flex w-full flex-col bg-cream shadow-2xl animate-in slide-in-from-right duration-200 ${wide ? 'max-w-3xl' : 'max-w-xl'}`}>
        <div className="flex items-center justify-between border-b border-line px-6 py-4"><h2 className="font-serif text-2xl">{title}</h2><button aria-label="Close" onClick={onClose} className="p-1"><X size={20} /></button></div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </div>
    </div>
  )
}

export function Panel({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="border border-line bg-white/60">
      {(title || action) && <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4"><h2 className="font-serif text-xl">{title}</h2>{action}</div>}
      {children}
    </section>
  )
}

export function Loading({ error, loading, empty, onRetry }: { error?: string; loading?: boolean; empty?: string; onRetry?: () => void }) {
  if (loading) return <div className="flex items-center justify-center gap-3 p-10 text-sm text-muted"><Spinner /> Loading…</div>
  if (error) return <div className="p-5"><Alert kind="error" title="Could not load data">{error} {onRetry && <button onClick={onRetry} className="ml-2 underline">Retry</button>}</Alert></div>
  if (empty) return <p className="p-10 text-center text-sm text-muted">{empty}</p>
  return null
}

export function Toolbar({ children }: { children: ReactNode }) { return <div className="mb-5 flex flex-wrap items-center gap-3">{children}</div> }
export const th = 'px-4 py-3 text-left text-[10px] font-medium uppercase tracking-[0.14em] text-muted whitespace-nowrap'
export const td = 'px-4 py-3 align-top text-sm'

export function downloadCsv(name: string, rows: Record<string, unknown>[]) {
  if (!rows.length) return
  const keys = Object.keys(rows[0])
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map((r) => keys.map((k) => esc(r[k])).join(','))].join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  a.download = name
  a.click()
  URL.revokeObjectURL(a.href)
}
