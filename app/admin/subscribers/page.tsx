'use client'
import { Download, Trash2 } from 'lucide-react'
import { useAdminList } from '@/lib/useAdminList'
import { formatDateTime } from '@/lib/format'
import type { Subscriber } from '@/lib/types'
import { Loading, Panel, Toolbar, downloadCsv, td, th } from '@/components/admin/ui'

export default function AdminSubscribers() {
  const { rows, loading, error, reload, remove } = useAdminList<Subscriber>('subscribers')
  return (
    <div>
      <Toolbar><p className="text-sm text-muted">{rows.length} subscriber{rows.length === 1 ? '' : 's'}</p><button disabled={!rows.length} onClick={() => downloadCsv('subscribers.csv', rows.map((r) => ({ email: r.email, subscribed: r.created_at })))} className="btn-line btn-sm ml-auto"><Download size={14} /> Export CSV</button></Toolbar>
      <Panel>
        {loading || error || !rows.length ? <Loading loading={loading} error={error} empty="No subscribers yet." onRetry={reload} /> : (
          <table className="w-full"><thead><tr className="border-b border-line"><th className={th}>Email</th><th className={th}>Subscribed</th><th className={th} /></tr></thead>
            <tbody className="divide-y divide-line">{rows.map((r) => (<tr key={r.id}><td className={td}>{r.email}</td><td className={td}>{formatDateTime(r.created_at)}</td><td className={`${td} text-right`}><button aria-label={`Remove ${r.email}`} onClick={() => confirm(`Remove ${r.email}?`) && remove(r.id)} className="text-faint"><Trash2 size={15} /></button></td></tr>))}</tbody></table>
        )}
      </Panel>
    </div>
  )
}
