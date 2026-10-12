"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react"
import Logo from "./Logo"
import { NAV_LINKS } from "@/lib/config"
import { useCart } from "@/lib/cart"
import { useStore } from "@/lib/store"
import { useWishlist } from "@/lib/wishlist"
import { useAuth } from "@/lib/auth"
import { money } from "@/lib/format"

const MOBILE_LINKS = [
  { href: "/", label: "Home" },
  ...NAV_LINKS,
  { href: "/quote", label: "Quotes & bookings" },
  { href: "/contact", label: "Contact us" },
  { href: "/track-order", label: "Track order" },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const [q, setQ] = useState("")
  const pathname = usePathname()
  const router = useRouter()
  const { count } = useCart()
  const { products, settings } = useStore()
  const { slugs } = useWishlist()
  const { user } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setOpen(false)
    setSearching(false)
  }, [pathname])
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])
  useEffect(() => {
    if (searching) inputRef.current?.focus()
  }, [searching])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        setSearching(false)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const suggestions = useMemo(() => {
    const t = q.trim().toLowerCase()
    if (t.length < 2) return []
    return products
      .filter((p) =>
        `${p.name} ${p.short_description} ${p.category_slug}`
          .toLowerCase()
          .includes(t),
      )
      .slice(0, 5)
  }, [q, products])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = q.trim()
    router.push(t ? `/shop?q=${encodeURIComponent(t)}` : "/shop")
    setSearching(false)
    setQ("")
  }

  return (
    <>
      {settings.announcement && (
        <div className="bg-ink-deep px-4 py-2 text-center text-[10px] font-medium uppercase leading-5 tracking-[0.25em] text-[#e8c995]">
          {settings.announcement}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-4 px-5 py-4 lg:px-10 lg:py-5">
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="-ml-2 p-2 xl:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
          <Logo className="text-center xl:text-left" />
          <nav
            aria-label="Main"
            className="hidden items-center gap-6 text-[10px] uppercase tracking-[0.18em] xl:flex"
          >
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`transition-colors hover:text-gold ${pathname.startsWith(l.href) ? "text-gold" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className={`transition-colors hover:text-gold ${pathname === "/contact" ? "text-gold" : ""}`}
            >
              Contact us
            </Link>
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              aria-label="Search"
              className="p-2"
              onClick={() => setSearching(!searching)}
            >
              <Search size={18} strokeWidth={1.5} />
            </button>
            <Link
              href="/wishlist"
              aria-label={`Wishlist, ${slugs.length} saved`}
              className="relative hidden p-2 sm:block"
            >
              <Heart size={18} strokeWidth={1.5} />
              {slugs.length > 0 && (
                <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-gold-soft text-[9px] text-white">
                  {slugs.length}
                </span>
              )}
            </Link>
            <Link
              href="/account"
              aria-label={user ? "My account" : "Sign in"}
              className="hidden p-2 sm:block"
            >
              <User size={18} strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              aria-label={`Shopping basket, ${count} items`}
              className="relative p-2"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-soft px-1 text-[9px] text-white">
                  {count}
                </span>
              )}
            </Link>
            <Link
              href="/shop"
              className="btn-shop btn-sm ml-1 hidden lg:inline-flex"
            >
              Shop now
            </Link>
          </div>
        </div>

        {searching && (
          <div className="border-t border-line bg-cream px-5 py-4">
            <form
              onSubmit={submit}
              role="search"
              className="mx-auto max-w-[600px]"
            >
              <div className="flex items-center gap-2 border-b border-gold pb-2">
                <Search size={15} />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label="Search our collection"
                  placeholder="Search our collection"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-faint"
                />
                {q && (
                  <button
                    type="button"
                    aria-label="Clear"
                    onClick={() => setQ("")}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {suggestions.length > 0 && (
                <ul className="mt-2 divide-y divide-line border border-line bg-white">
                  {suggestions.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/shop/${p.slug}`}
                        className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-sand"
                      >
                        <span>{p.name}</span>
                        <span className="text-xs text-gold">
                          {p.price_is_from ? "From " : ""}
                          {money(p.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {q.trim().length >= 2 && suggestions.length === 0 && (
                <p className="mt-3 text-xs text-muted">
                  No matches yet — press enter to search the full shop.
                </p>
              )}
            </form>
          </div>
        )}
      </header>

      {open && (
        <div
          className="fixed inset-0 z-30 xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setOpen(false)}
          />
          <nav className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col overflow-y-auto bg-cream px-6 pb-8 pt-24 shadow-2xl animate-in slide-in-from-left duration-200">
            <ul className="divide-y divide-line text-[11px] uppercase tracking-[0.18em]">
              {MOBILE_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`flex items-center justify-between py-4 ${pathname === l.href ? "text-gold" : ""}`}
                  >
                    {l.label}
                    <ArrowRight size={14} className="text-gold" />
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex gap-3">
              <Link href="/account" className="btn-line btn-sm flex-1">
                <User size={14} /> {user ? "Account" : "Sign in"}
              </Link>
              <Link href="/wishlist" className="btn-line btn-sm flex-1">
                <Heart size={14} /> Wishlist
              </Link>
            </div>
            <Link href="/shop" className="btn-shop mt-3">
              Shop now <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
