'use client'
import { Check, EyeOff, Trash2 } from 'lucide-react'
import { useAdminList } from '@/lib/useAdminList'
import { formatDate } from '@/lib/format'
import type { Review } from '@/lib/types'
import { Loading, Panel, Pill, td, th } from '@/components/admin/ui'
import { Stars } from '@/components/ui/bits'

export default function AdminReviews() {
  const { rows, loading, error, reload, update, remove } = useAdminList<Review>('reviews')
  return (
    <Panel>
      {loading || error || !rows.length ? <Loading loading={loading} error={error} empty="No reviews yet." onRetry={reload} /> : (
        <div className="overflow-x-auto"><table className="w-full min-w-[720px]"><thead><tr className="border-b border-line"><th className={th}>Rating</th><th className={th}>Review</th><th className={th}>Product</th><th className={th}>Status</th><th className={th}>Date</th><th className={th} /></tr></thead>
          <tbody className="divide-y divide-line">{rows.map((r) => (
            <tr key={r.id}><td className={td}><Stars value={r.rating} size={12} /></td><td className={`${td} max-w-md`}><p className="font-medium">{r.name}</p><p className="text-muted">{r.body}</p></td><td className={td}>{r.product_slug ?? 'General'}</td><td className={td}><Pill value={r.approved ? 'confirmed' : 'pending'} /></td><td className={td}>{formatDate(r.created_at)}</td>
              <td className={td}><div className="flex gap-2">{r.approved ? <button aria-label="Hide review" title="Hide" onClick={() => update(r.id, { approved: false }, 'Review hidden.')} className="btn-line btn-sm !px-3"><EyeOff size={14} /></button> : <button aria-label="Approve review" title="Approve" onClick={() => update(r.id, { approved: true }, 'Review published.')} className="btn-gold btn-sm !px-3"><Check size={14} /></button>}
                <button aria-label="Delete review" title="Delete" onClick={() => confirm('Delete this review?') && remove(r.id)} className="btn-line btn-sm !px-3"><Trash2 size={14} /></button></div></td></tr>))}</tbody></table></div>
      )}
    </Panel>
  )
}
