'use client'
import Link from 'next/link'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

type Kind = 'success' | 'error' | 'info'
interface ToastItem { id: number; message: string; kind: Kind; action?: { label: string; href: string } }
type ToastFn = (message: string, opts?: { kind?: Kind; action?: { label: string; href: string } }) => void

const Ctx = createContext<ToastFn>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const idRef = useRef(0)
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), [])
  const toast = useCallback<ToastFn>((message, opts) => {
    const id = ++idRef.current
    setItems((l) => [...l.slice(-2), { id, message, kind: opts?.kind ?? 'success', action: opts?.action }])
    setTimeout(() => dismiss(id), opts?.kind === 'error' ? 7000 : 4200)
  }, [dismiss])
  const value = useMemo(() => toast, [toast])
  return (
    <Ctx.Provider value={value}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 pb-[env(safe-area-inset-bottom)]">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex w-full max-w-md items-start gap-3 border border-line bg-ink px-4 py-3 text-sm text-cream shadow-xl animate-in fade-in slide-in-from-bottom-2">
            {t.kind === 'error' ? <AlertCircle size={18} className="mt-0.5 shrink-0 text-[#e0a090]" /> : <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-champagne" />}
            <p className="flex-1 leading-6">{t.message}</p>
            {t.action && <Link href={t.action.href} onClick={() => dismiss(t.id)} className="shrink-0 border-b border-champagne pb-0.5 text-[10px] uppercase tracking-[0.18em] text-champagne">{t.action.label}</Link>}
            <button aria-label="Dismiss" onClick={() => dismiss(t.id)} className="shrink-0 text-[#b9ada0]"><X size={16} /></button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
