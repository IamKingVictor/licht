import { useSyncExternalStore } from 'react'

/**
 * Prices are stored in US dollars (the base currency). Customers can view them in
 * US dollars, British pounds or Espees. 1 Espees is worth `espees_ngn` naira (default 2,050),
 * so Espees = USD x usd_to_ngn / espees_ngn. The rates live in Admin > Site settings.
 */
export type CurrencyCode = 'USD' | 'GBP' | 'ESP'
export const BASE: CurrencyCode = 'USD'
export const CURRENCIES: { code: CurrencyCode; symbol: string; name: string }[] = [
  { code: 'USD', symbol: '$', name: 'US dollars' },
  { code: 'GBP', symbol: '£', name: 'British pounds' },
  { code: 'ESP', symbol: 'ESP\u00a0', name: 'Espees' },
]

export interface Rates { usd_to_gbp: number; usd_to_ngn: number; espees_ngn: number }
export const DEFAULT_RATES: Rates = { usd_to_gbp: 0.746, usd_to_ngn: 1330, espees_ngn: 2050 }

interface Snapshot { code: CurrencyCode; rates: Rates }
const KEY = 'licht:currency'
const SERVER: Snapshot = { code: BASE, rates: DEFAULT_RATES }
let snap: Snapshot = { code: BASE, rates: DEFAULT_RATES }
const subs = new Set<() => void>()

if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'USD' || saved === 'GBP' || saved === 'ESP') snap = { ...snap, code: saved }
  } catch { /* storage unavailable */ }
}

const emit = () => subs.forEach((f) => f())
const good = (n: unknown, fallback: number) => (typeof n === 'number' && Number.isFinite(n) && n > 0 ? n : fallback)

export function setRates(r: Partial<Rates>) {
  const next: Rates = {
    usd_to_gbp: good(r.usd_to_gbp, DEFAULT_RATES.usd_to_gbp),
    usd_to_ngn: good(r.usd_to_ngn, DEFAULT_RATES.usd_to_ngn),
    espees_ngn: good(r.espees_ngn, DEFAULT_RATES.espees_ngn),
  }
  const cur = snap.rates
  if (cur.usd_to_gbp === next.usd_to_gbp && cur.usd_to_ngn === next.usd_to_ngn && cur.espees_ngn === next.espees_ngn) return
  snap = { ...snap, rates: next }
  emit()
}

export function setCurrencyCode(code: CurrencyCode) {
  if (snap.code === code) return
  snap = { ...snap, code }
  try { localStorage.setItem(KEY, code) } catch { /* ignore */ }
  emit()
}

/** Converts an amount in US dollars into the given currency. */
export function convert(usd: number, code: CurrencyCode, rates: Rates): number {
  if (code === 'GBP') return usd * rates.usd_to_gbp
  if (code === 'ESP') return (usd * rates.usd_to_ngn) / rates.espees_ngn
  return usd
}

export function formatIn(usd: number | null | undefined, code: CurrencyCode, rates: Rates, whole = false): string {
  const v = convert(Number(usd ?? 0), code, rates)
  const d = whole ? 0 : 2
  const sym = CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
  return `${sym}${v.toLocaleString('en-GB', { minimumFractionDigits: d, maximumFractionDigits: d })}`
}

const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }
const getSnapshot = () => snap
const getServerSnapshot = () => SERVER

/** Customer-facing price formatting in the currency the visitor has chosen. */
export function useCurrency() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return {
    code: s.code,
    rates: s.rates,
    setCode: setCurrencyCode,
    /** e.g. $23.40, £17.46 or ESP 15.18 */
    format: (usd: number | null | undefined) => formatIn(usd, s.code, s.rates),
    /** whole-number version for thresholds such as "free delivery over $100" */
    formatRound: (usd: number | null | undefined) => formatIn(usd, s.code, s.rates, true),
    /** always US dollars: the amount an order is actually charged in */
    formatBase: (usd: number | null | undefined) => formatIn(usd, BASE, s.rates),
  }
}
