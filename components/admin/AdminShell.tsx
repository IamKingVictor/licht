'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { BarChart3, CalendarCheck, ExternalLink, FileText, Images, LogOut, Mail, Menu, MessageSquare, Package, Settings, ShoppingBag, Star, Users, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { HAS_SUPABASE } from '@/lib/config'
import { Spinner } from '@/components/ui/fields'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/carousel', label: 'Carousel', icon: Images },
  { href: '/admin/quotes', label: 'Quotations', icon: FileText },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/reviews', label: 'Reviews', icon: Star },
  { href: '/admin/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/admin/settings', label: 'Site settings', icon: Settings },
]

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const isLogin = pathname === '/admin/login'

  useEffect(() => { setOpen(false) }, [pathname])
  useEffect(() => { if (!loading && !isLogin && (!user || !isAdmin)) router.replace('/admin/login') }, [loading, user, isAdmin, isLogin, router])

  if (isLogin) return <div className="min-h-screen bg-cream">{children}</div>
  if (loading || !user || !isAdmin) return <div className="flex min-h-screen items-center justify-center bg-cream"><Spinner className="text-gold" /></div>

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col bg-ink-deep text-cream">
      <div className="px-6 py-6"><span className="block font-serif text-xl tracking-[0.23em]">LICHT</span><span className="mt-1 block text-[8px] tracking-[0.39em] text-champagne">ADMIN</span></div>
      <ul className="flex-1 space-y-1 overflow-y-auto px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const on = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return <li key={href}><Link href={href} className={`flex items-center gap-3 px-3 py-3 text-[11px] uppercase tracking-[0.16em] transition-colors ${on ? 'bg-ink text-champagne' : 'text-[#c3b9ae] hover:bg-ink hover:text-cream'}`}><Icon size={16} strokeWidth={1.5} />{label}</Link></li>
        })}
      </ul>
      <div className="space-y-1 border-t border-[#3a3029] p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-3 text-[11px] uppercase tracking-[0.16em] text-[#c3b9ae] hover:text-cream"><ExternalLink size={16} /> View site</Link>
        <button onClick={async () => { await signOut(); router.replace('/admin/login') }} className="flex w-full items-center gap-3 px-3 py-3 text-[11px] uppercase tracking-[0.16em] text-[#c3b9ae]"><LogOut size={16} /> Sign out</button>
        <p className="truncate px-3 pt-2 text-[10px] text-[#8d8378]">{user.email}</p>
      </div>
    </nav>
  )

  return (
    <div className="min-h-screen bg-cream text-[#241f1b] lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="no-print hidden lg:block"><div className="sticky top-0 h-screen">{sidebar}</div></aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><button aria-label="Close menu" className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} /><div className="absolute inset-y-0 left-0 w-72">{sidebar}</div></div>}
      <div className="min-w-0">
        <header className="no-print sticky top-0 z-30 flex items-center gap-3 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur lg:px-8">
          <button aria-label="Open menu" className="p-2 lg:hidden" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
          <p className="font-serif text-xl">{NAV.find((n) => (n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)))?.label ?? 'Admin'}</p>
          {!HAS_SUPABASE && <span className="ml-auto hidden bg-[#f4e8c9] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#6b5314] sm:block">Demo mode · data saved in this browser</span>}
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
