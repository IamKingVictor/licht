'use client'
import { useEffect, useState } from 'react'
import { Download, WifiOff, X, RefreshCw } from 'lucide-react'
import { useToast } from '@/lib/toast'

interface BIPEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

/** Registers the service worker, shows an offline banner and an "Add to home screen" prompt. */
export default function PwaClient() {
  const toast = useToast()
  const [offline, setOffline] = useState(false)
  const [installEvent, setInstallEvent] = useState<BIPEvent | null>(null)
  const [dismissed, setDismissed] = useState(true)
  const [update, setUpdate] = useState<ServiceWorkerRegistration | null>(null)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    setOffline(!navigator.onLine)
    const on = () => { setOffline(false); toast('You are back online.', { kind: 'info' }) }
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)

    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone
    const wasDismissed = localStorage.getItem('licht:install-dismissed') === '1'
    setDismissed(Boolean(standalone) || wasDismissed)
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent) && !standalone)
    const before = (e: Event) => { e.preventDefault(); setInstallEvent(e as BIPEvent) }
    window.addEventListener('beforeinstallprompt', before)
    window.addEventListener('appinstalled', () => { setInstallEvent(null); toast('LICHT SIGNATURE was added to your device.') })

    if ('serviceWorker' in navigator && (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_SW_DEV === '1')) {
      navigator.serviceWorker.register('/sw.js').then((reg) => {
        reg.addEventListener('updatefound', () => {
          const w = reg.installing
          w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) setUpdate(reg) })
        })
      }).catch(() => { /* PWA features are optional; the site works without them */ })
    }
    return () => {
      window.removeEventListener('online', on); window.removeEventListener('offline', off); window.removeEventListener('beforeinstallprompt', before)
    }
  }, [toast])

  const install = async () => {
    if (!installEvent) return
    await installEvent.prompt()
    const { outcome } = await installEvent.userChoice
    if (outcome === 'dismissed') { localStorage.setItem('licht:install-dismissed', '1'); setDismissed(true) }
    setInstallEvent(null)
  }
  const dismiss = () => { localStorage.setItem('licht:install-dismissed', '1'); setDismissed(true) }
  const showInstall = !dismissed && (installEvent || ios)

  return (
    <>
      {offline && (
        <div role="alert" className="no-print fixed inset-x-0 top-0 z-[90] flex items-center justify-center gap-2 bg-[#5a3a2a] px-4 py-2 text-xs text-cream safe-top">
          <WifiOff size={14} /> You are offline — you can still browse, but ordering and enquiries need a connection (enquiries are sent when you reconnect).
        </div>
      )}
      {update && (
        <div className="no-print fixed inset-x-4 bottom-4 z-[95] mx-auto flex max-w-md items-center gap-3 border border-line bg-cream p-4 shadow-xl">
          <RefreshCw size={18} className="shrink-0 text-gold" />
          <p className="flex-1 text-sm">A new version of the site is ready.</p>
          <button className="btn-dark btn-sm" onClick={() => { update.waiting?.postMessage('SKIP_WAITING'); window.location.reload() }}>Refresh</button>
        </div>
      )}
      {showInstall && !update && (
        <div className="no-print fixed inset-x-4 bottom-20 z-[85] mx-auto max-w-md border border-line bg-cream p-4 shadow-xl sm:bottom-6 sm:left-6 sm:mx-0">
          <button aria-label="Dismiss" onClick={dismiss} className="absolute right-3 top-3 text-faint"><X size={16} /></button>
          <p className="font-serif text-xl">Keep LICHT on your home screen</p>
          {installEvent ? (
            <>
              <p className="mt-1 text-xs leading-5 text-muted">Install the app for faster browsing and offline access to the collection.</p>
              <button onClick={install} className="btn-dark btn-sm mt-3"><Download size={14} /> Install app</button>
            </>
          ) : (
            <p className="mt-1 text-xs leading-5 text-muted">On iPhone or iPad tap the Share icon, then “Add to Home Screen”.</p>
          )}
        </div>
      )}
    </>
  )
}
