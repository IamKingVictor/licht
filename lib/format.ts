let currency = '£'
export function setCurrency(c: string) {
  currency = c || '£'
}
export function money(n: number | null | undefined) {
  const v = Number(n ?? 0)
  return `${currency}${v.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
export function formatDate(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
export function formatDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
export const isPhone = (v: string) => v.replace(/\D/g, '').length >= 7
export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
export const todayISO = () => new Date().toISOString().slice(0, 10)
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export const humanise = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
export const digits = (s: string) => s.replace(/\D/g, '')
export function whatsappLink(number: string, text?: string) {
  const n = digits(number)
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ''}`
}
