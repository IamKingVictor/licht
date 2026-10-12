'use client'
import { useCallback, useEffect, useState } from 'react'
import { api, type AdminTable } from './db'
import { useToast } from './toast'

export function useAdminList<T extends { id: string }>(table: AdminTable) {
  const [rows, setRows] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()

  const reload = useCallback(async () => {
    setLoading(true)
    const r = await api.admin.list<T>(table)
    if (r.ok) { setRows(r.data); setError('') } else setError(r.error)
    setLoading(false)
  }, [table])
  useEffect(() => { reload() }, [reload])

  const update = useCallback(async (id: string, patch: Record<string, unknown>, message = 'Saved.') => {
    const r = await api.admin.update(table, id, patch)
    if (r.ok) { setRows((cur) => cur.map((x) => (x.id === id ? { ...x, ...patch } : x))); toast(message) } else toast(r.error, { kind: 'error' })
    return r.ok
  }, [table, toast])

  const remove = useCallback(async (id: string, message = 'Deleted.') => {
    const r = await api.admin.remove(table, id)
    if (r.ok) { setRows((cur) => cur.filter((x) => x.id !== id)); toast(message) } else toast(r.error, { kind: 'error' })
    return r.ok
  }, [table, toast])

  return { rows, setRows, loading, error, reload, update, remove }
}
