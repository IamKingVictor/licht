'use client'
import { ChevronDown } from 'lucide-react'
import { CURRENCIES, useCurrency, type CurrencyCode } from '@/lib/currency'

/** Lets the visitor view every price in US dollars, British pounds or Espees. */
export default function CurrencySwitcher() {
  const { code, setCode } = useCurrency()
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Currency</span>
      <select
        value={code}
        onChange={(e) => setCode(e.target.value as CurrencyCode)}
        title="Choose the currency prices are shown in"
        className="cursor-pointer appearance-none rounded-full border border-line bg-white/70 py-1.5 pl-3 pr-7 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink outline-none transition-all hover:border-forest focus:border-forest focus:ring-2 focus:ring-forest/20"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>{c.code === 'ESP' ? 'ESP' : `${c.code} ${c.symbol}`}</option>
        ))}
      </select>
      <ChevronDown size={12} className="pointer-events-none absolute right-2.5 text-muted" />
    </label>
  )
}
